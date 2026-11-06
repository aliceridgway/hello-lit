import { LitElement, css, html, nothing, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { UiComboboxOption } from "./ui-combobox-option";

const CHEVRON_URL = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none"><path stroke="#6b7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.5 6.25 8 9.75l3.5-3.5"/></svg>`,
)}")`;

let nextComboboxId = 0;

/**
 * Text field with a suggestion list. Form-associated: `name` submits `value`,
 * a form reset restores the value from connection, and a disabled fieldset disables the control.
 *
 * While typing, `value` is the field text. Choosing an option sets `value` to that option's
 * `value` and shows its `label` in the field. A string that matches no option stays, and the
 * field shows that string. This element does not filter options.
 *
 * Slots: `options` (`ui-combobox-option`).
 * `input` bubbles and is composed. While typing it is the inner input event, after `value` updates.
 * Choosing an option dispatches `input` and `change` on this host. Both bubble and are composed.
 * Enter selects the highlighted option while the list is open, and submits the parent form when it is closed.
 * The list uses `popover="manual"` so it stays open while the field, outside the panel, has focus.
 * A clear button shows while `value` is non-empty. It sets `value` to `""` and dispatches `input` and `change`.
 * No public methods.
 *
 * `ui-form-field` writes `description`, `described-by`, `invalid`, and `required`.
 *
 * @example
 * <ui-combobox>
 *   <ui-combobox-option slot="options" value="apple" label="Apple">Apple</ui-combobox-option>
 * </ui-combobox>
 */
@customElement("ui-combobox")
export class UiCombobox extends LitElement {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .field {
      position: relative;
    }

    .ui-field__control {
      box-sizing: border-box;
      width: 100%;
      margin: 0;
      padding: var(--ui-space-2) 2rem var(--ui-space-2) var(--ui-space-3);
      border: 1px solid var(--ui-field-border);
      border-radius: var(--ui-radius-md);
      background-color: var(--ui-field-bg);
      background-image: ${unsafeCSS(CHEVRON_URL)};
      background-repeat: no-repeat;
      background-position: right var(--ui-space-3) center;
      background-size: 1rem;
      color: var(--ui-field-fg);
      font: inherit;
      font-size: var(--ui-font-size-md);
      line-height: var(--ui-line-height);
      transition:
        border-color 120ms ease,
        box-shadow 120ms ease,
        background-color 120ms ease;
    }

    .ui-field__control.has-clear {
      padding-right: 3.25rem;
    }

    .ui-field__control::placeholder {
      color: var(--ui-field-placeholder);
    }

    .clear {
      position: absolute;
      top: 50%;
      right: 1.75rem;
      transform: translateY(-50%);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      margin: 0;
      padding: 0;
      border: none;
      border-radius: var(--ui-radius-md);
      background: transparent;
      color: #6b7280;
      cursor: pointer;
    }

    .clear svg {
      width: 0.875rem;
      height: 0.875rem;
    }

    .clear:hover {
      background: #f3f4f6;
      color: #111827;
    }

    .clear:focus-visible {
      outline: 2px solid var(--ui-field-border-focus);
      outline-offset: 1px;
    }

    .ui-field__control:hover:not(:disabled):not(:focus) {
      border-color: var(--ui-field-border-hover);
    }

    .ui-field__control:focus {
      outline: none;
      border-color: var(--ui-field-border-focus);
      box-shadow: 0 0 0 3px var(--ui-field-focus-ring);
    }

    .ui-field__control:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    :host([invalid]) .ui-field__control {
      border-color: var(--ui-field-border-invalid);
    }

    :host([invalid]) .ui-field__control:focus {
      border-color: var(--ui-field-border-invalid);
      box-shadow: 0 0 0 3px var(--ui-field-focus-ring-invalid);
    }

    .panel {
      position: fixed;
      inset: auto;
      box-sizing: border-box;
      width: max-content;
      max-width: calc(100vw - 1rem);
      margin: 0;
      padding: var(--ui-space-1) 0;
      border: 1px solid #e5e7eb;
      border-radius: var(--ui-radius-lg);
      background: #ffffff;
      color: #111827;
      box-shadow: 0 10px 30px rgb(17 24 39 / 0.12);
      overflow: auto;
    }

    .list {
      display: flex;
      flex-direction: column;
    }

    @media (forced-colors: active) {
      .ui-field__control:focus {
        outline: 2px solid Highlight;
        outline-offset: 2px;
        box-shadow: none;
      }

      :host([invalid]) .ui-field__control {
        border-color: Mark;
      }

      .clear:focus-visible {
        outline-color: Highlight;
      }
    }
  `;

  @property({ type: String })
  value = "";

  @property({ type: String })
  placeholder = "";

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  required = false;

  @property({ type: Boolean, reflect: true })
  invalid = false;

  @property({ type: String, reflect: true })
  name = "";

  /** Help or error copy. Id refs on the field cannot cross into this shadow. */
  @property({ type: String })
  description = "";

  /** Id of the help or error element. Copied to `aria-describedby` on the host. */
  @property({ attribute: "described-by" })
  describedBy = "";

  @state()
  private formDisabled = false;

  @state()
  private open = false;

  @state()
  private activeIndex = -1;

  private readonly internals: ElementInternals;
  private readonly listId = `ui-combobox-list-${++nextComboboxId}`;
  private defaultValue = "";
  private sawOptions = false;
  private pointerSelecting = false;
  private placedAbove = false;
  private panelWidth = 0;
  private panelHeight = 0;
  private repositioning = false;
  private nextOptionId = 0;
  private typedValue = false;
  private pinnedValue = "";
  private pinnedLabel = "";

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback() {
    super.connectedCallback();
    this.defaultValue = this.value;
    this.addEventListener("mousedown", this.onMouseDown);
    this.addEventListener("click", this.onClick);
    document.addEventListener("pointerdown", this.onDocumentPointerDown, true);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("mousedown", this.onMouseDown);
    this.removeEventListener("click", this.onClick);
    document.removeEventListener("pointerdown", this.onDocumentPointerDown, true);
    this.unbindReposition();
    this.closeList();
  }

  override updated() {
    if (this.describedBy) this.setAttribute("aria-describedby", this.describedBy);
    else this.removeAttribute("aria-describedby");

    if (this.invalid) this.setAttribute("aria-invalid", "true");
    else this.removeAttribute("aria-invalid");

    this.internals.setFormValue(this.controlDisabled ? null : this.value);

    if (this.controlDisabled && this.open) this.closeList();
    else this.syncOptionState();
    this.syncInputDisplay();
    this.typedValue = false;
  }

  formDisabledCallback(disabled: boolean) {
    this.formDisabled = disabled;
  }

  formResetCallback() {
    this.value = this.defaultValue;
    this.activeIndex = -1;
  }

  private get controlDisabled() {
    return this.disabled || this.formDisabled;
  }

  private get inputEl() {
    return this.renderRoot.querySelector<HTMLInputElement>("input");
  }

  private get panelEl() {
    return this.renderRoot.querySelector<HTMLElement>(".panel");
  }

  private options(): UiComboboxOption[] {
    return [...this.querySelectorAll(":scope > ui-combobox-option")].filter(
      (node): node is UiComboboxOption => node instanceof UiComboboxOption && node.slot === "options",
    );
  }

  private optionFromEvent(event: Event) {
    for (const node of event.composedPath()) {
      if (node instanceof UiComboboxOption && node.slot === "options") return node;
    }
    return null;
  }

  private readonly onDocumentPointerDown = (event: PointerEvent) => {
    if (!this.open || event.composedPath().includes(this)) return;
    this.closeList();
  };

  private readonly onMouseDown = (event: MouseEvent) => {
    if (!this.optionFromEvent(event)) return;
    this.pointerSelecting = true;
    event.preventDefault();
  };

  private readonly onClick = (event: MouseEvent) => {
    const option = this.optionFromEvent(event);
    this.pointerSelecting = false;
    if (!option || this.controlDisabled) return;
    event.preventDefault();
    this.choose(option);
  };

  private onFocus() {
    if (this.options().length > 0) this.openList();
  }

  private onFocusOut(event: FocusEvent) {
    if (this.pointerSelecting) return;
    const next = event.relatedTarget;
    if (next instanceof Node && (this.contains(next) || !!this.shadowRoot?.contains(next))) return;
    this.closeList();
  }

  private onInput(event: Event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || this.controlDisabled) return;
    if (input.value !== this.value) {
      this.value = input.value;
      this.typedValue = true;
      this.pinnedValue = "";
      this.pinnedLabel = "";
    }
    this.activeIndex = -1;
    if (this.options().length > 0) this.openList();
    else this.closeList();
  }

  private onKeydown(event: KeyboardEvent) {
    if (event.isComposing || this.controlDisabled) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (this.options().length === 0) return;
      event.preventDefault();
      this.moveActive(event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (event.key === "Escape") {
      if (!this.open) return;
      event.preventDefault();
      event.stopPropagation();
      this.closeList();
      return;
    }

    if (event.key !== "Enter" || event.defaultPrevented) return;
    if (this.open) {
      event.preventDefault();
      const option = this.options()[this.activeIndex];
      if (option) this.choose(option);
      return;
    }
    this.internals.form?.requestSubmit();
  }

  private onSlotChange() {
    const options = this.options();
    const hadOptions = this.sawOptions;
    this.sawOptions = options.length > 0;
    if (this.activeIndex >= options.length) this.activeIndex = -1;

    if (options.length === 0) {
      this.closeList();
      return;
    }
    if (this.open) {
      this.place();
      this.syncOptionState();
      this.syncInputDisplay();
      return;
    }
    if (!hadOptions && this.matches(":focus-within")) this.openList();
    else this.syncOptionState();
    this.syncInputDisplay();
  }

  private onToggle(event: Event) {
    const panel = this.panelEl;
    const open = event instanceof ToggleEvent ? event.newState === "open" : !!panel?.matches(":popover-open");
    this.open = open;
    if (open) this.bindReposition();
    else {
      this.activeIndex = -1;
      this.unbindReposition();
    }
    this.syncOptionState();
  }

  private moveActive(delta: number) {
    const options = this.options();
    if (options.length === 0) return;
    const next =
      this.activeIndex < 0
        ? delta > 0
          ? 0
          : options.length - 1
        : Math.min(options.length - 1, Math.max(0, this.activeIndex + delta));
    this.activeIndex = next;
    this.openList();
    options[next]?.scrollIntoView({ block: "nearest" });
  }

  private choose(option: UiComboboxOption) {
    this.pinnedValue = option.value;
    this.pinnedLabel = option.label || option.value;
    this.commitValue(option.value);
    this.closeList();
  }

  private onClearMouseDown(event: MouseEvent) {
    event.preventDefault();
  }

  private onClearClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.controlDisabled || this.value === "") return;
    this.pinnedValue = "";
    this.pinnedLabel = "";
    this.commitValue("");
    this.activeIndex = -1;
    this.inputEl?.focus();
    if (this.options().length > 0) this.openList();
    else this.closeList();
  }

  private commitValue(value: string) {
    this.value = value;
    this.typedValue = false;
    this.syncInputDisplay();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  private displayText() {
    if (this.value !== "" && this.value === this.pinnedValue && this.pinnedLabel) return this.pinnedLabel;
    const match = this.options().find((option) => option.value === this.value && option.label);
    if (!match) return this.value;
    this.pinnedValue = this.value;
    this.pinnedLabel = match.label;
    return match.label;
  }

  private syncInputDisplay() {
    if (this.typedValue) return;
    const input = this.inputEl;
    if (!input) return;
    const display = this.displayText();
    if (input.value !== display) input.value = display;
  }

  private openList() {
    if (this.controlDisabled) return;
    const panel = this.panelEl;
    if (!panel || this.options().length === 0) return;
    if (!panel.matches(":popover-open")) {
      this.place();
      panel.showPopover();
    }
    this.open = true;
    this.bindReposition();
    this.syncOptionState();
  }

  private closeList() {
    this.activeIndex = -1;
    const panel = this.panelEl;
    if (panel?.matches(":popover-open")) panel.hidePopover();
    this.open = false;
    this.unbindReposition();
    this.syncOptionState();
  }

  private syncOptionState() {
    const options = this.options();
    const input = this.inputEl;
    let active: UiComboboxOption | undefined;
    for (const [index, option] of options.entries()) {
      if (!option.id) option.id = `${this.listId}-opt-${this.nextOptionId++}`;
      const isActive = this.open && index === this.activeIndex;
      option.active = isActive;
      option.selected = option.value === this.value;
      if (isActive) active = option;
    }
    this.setActiveDescendant(input, active ?? null);
  }

  private setActiveDescendant(input: HTMLInputElement | null, option: UiComboboxOption | null) {
    if (!input) return;
    if (option) input.setAttribute("aria-activedescendant", option.id);
    else input.removeAttribute("aria-activedescendant");
    if (!("ariaActiveDescendantElement" in input)) return;
    (input as HTMLInputElement & { ariaActiveDescendantElement: Element | null }).ariaActiveDescendantElement =
      option;
  }

  private measureNatural(panel: HTMLElement) {
    if (panel.matches(":popover-open")) {
      return { width: panel.offsetWidth, height: panel.scrollHeight };
    }
    const display = panel.style.display;
    const visibility = panel.style.visibility;
    const maxHeight = panel.style.maxHeight;
    panel.style.display = "block";
    panel.style.visibility = "hidden";
    panel.style.maxHeight = "none";
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    panel.style.display = display;
    panel.style.visibility = visibility;
    panel.style.maxHeight = maxHeight;
    return { width, height };
  }

  private place(moveOnly = false) {
    const anchor = this.inputEl;
    const panel = this.panelEl;
    if (!anchor || !panel) return;
    const rect = anchor.getBoundingClientRect();
    const margin = 8;
    const gap = 4;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    panel.style.minWidth = `${Math.min(rect.width, viewportWidth - margin * 2)}px`;

    if (!moveOnly) {
      const natural = this.measureNatural(panel);
      const spaceBelow = viewportHeight - rect.bottom - gap - margin;
      const spaceAbove = rect.top - gap - margin;
      this.placedAbove = natural.height > spaceBelow && spaceAbove > spaceBelow;
      const available = Math.max(0, this.placedAbove ? spaceAbove : spaceBelow);
      panel.style.maxHeight = `${available}px`;
      this.panelWidth = Math.max(natural.width, Math.min(rect.width, viewportWidth - margin * 2));
      this.panelHeight = Math.min(natural.height, available);
    }

    const top = this.placedAbove ? rect.top - gap - this.panelHeight : rect.bottom + gap;
    let left = rect.left;
    if (left + this.panelWidth > viewportWidth - margin) {
      left = viewportWidth - margin - this.panelWidth;
    }
    panel.style.top = `${top}px`;
    panel.style.left = `${Math.max(margin, left)}px`;
  }

  private readonly onReposition = () => {
    if (!this.panelEl?.matches(":popover-open")) return;
    this.place(true);
  };

  private bindReposition() {
    if (this.repositioning) return;
    this.repositioning = true;
    window.addEventListener("scroll", this.onReposition, true);
    window.addEventListener("resize", this.onReposition);
  }

  private unbindReposition() {
    if (!this.repositioning) return;
    this.repositioning = false;
    window.removeEventListener("scroll", this.onReposition, true);
    window.removeEventListener("resize", this.onReposition);
  }

  override render() {
    const canClear = this.value !== "" && !this.controlDisabled;
    return html`
      <div class="field">
        <input
          class="ui-field__control ${canClear ? "has-clear" : ""}"
          type="text"
          role="combobox"
          autocomplete="off"
          placeholder=${this.placeholder || nothing}
          ?disabled=${this.controlDisabled}
          ?required=${this.required}
          aria-invalid=${this.invalid ? "true" : nothing}
          aria-description=${this.description || nothing}
          aria-autocomplete="list"
          aria-expanded=${this.open ? "true" : "false"}
          aria-controls=${this.listId}
          @focus=${this.onFocus}
          @focusout=${this.onFocusOut}
          @input=${this.onInput}
          @keydown=${this.onKeydown}
        />
        ${canClear
          ? html`
              <button class="clear" type="button" aria-label="Clear" @mousedown=${this.onClearMouseDown} @click=${this.onClearClick}>
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-width="1.5"
                    d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5"
                  />
                </svg>
              </button>
            `
          : nothing}
      </div>
      <div class="panel" popover="manual" @toggle=${this.onToggle}>
        <div id=${this.listId} class="list" role="listbox">
          <slot name="options" @slotchange=${this.onSlotChange}></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-combobox": UiCombobox;
  }
}
