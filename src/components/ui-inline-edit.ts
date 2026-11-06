import { LitElement, css, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { slotHasContent } from "./form-field";

/**
 * Label and value that open a popover form.
 * An empty `value` slot shows `placeholder`.
 * A clear button shows while the `value` slot has content. It dispatches `clear` and closes the panel.
 * Submit on a form in the `content` slot closes the panel.
 * A descendant with `data-popover-close` closes it without submit.
 * The panel flips above the trigger when there is not enough room below.
 *
 * Slots: `value` (current value), `content` (panel body).
 * Events: `clear` when the clear button is clicked, and `close` when the panel closes.
 * Both bubble and are composed.
 * Public members: `isOpen`, `show()`, `close()`.
 *
 * @example
 * <ui-inline-edit label="Status">
 *   <span slot="value">In progress</span>
 *   <form slot="content"></form>
 * </ui-inline-edit>
 */
@customElement("ui-inline-edit")
export class UiInlineEdit extends LitElement {
  static override styles = css`
    :host {
      position: relative;
      display: inline-flex;
      vertical-align: middle;
    }

    .field {
      display: inline-flex;
      align-items: flex-end;
      border-radius: var(--ui-radius-md);
    }

    .field:hover {
      background: var(--ui-button-ghost-hover-bg);
    }

    .trigger {
      display: inline-flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0;
      margin: 0;
      padding: var(--ui-space-1) var(--ui-space-2);
      border: none;
      border-radius: var(--ui-radius-md);
      background: transparent;
      color: var(--ui-color-fg);
      font: inherit;
      font-size: var(--ui-font-size-sm);
      line-height: var(--ui-line-height);
      text-align: start;
      cursor: pointer;
    }

    .trigger:focus-visible {
      outline: 2px solid var(--ui-field-border-focus);
      outline-offset: 2px;
    }

    .label-row {
      display: inline-flex;
      align-items: center;
      gap: var(--ui-space-2);
      max-width: 100%;
    }

    .label {
      color: var(--ui-color-fg-muted);
      font-weight: var(--ui-font-weight-medium);
    }

    .value {
      display: inline-flex;
      align-items: center;
      min-width: 0;
    }

    .placeholder {
      color: var(--ui-field-placeholder);
    }

    .pencil {
      display: inline-flex;
      flex: none;
      width: 1rem;
      height: 1rem;
      color: var(--ui-color-fg-muted);
      opacity: 0;
    }

    .field:hover .pencil,
    .trigger:focus-visible .pencil,
    .trigger[aria-expanded="true"] .pencil {
      opacity: 1;
    }

    .clear {
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      margin: 0 var(--ui-space-1) var(--ui-space-1) 0;
      padding: 0;
      border: none;
      border-radius: var(--ui-radius-md);
      background: transparent;
      color: var(--ui-color-fg-muted);
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

    .panel {
      position: fixed;
      inset: auto;
      box-sizing: border-box;
      width: max-content;
      max-width: min(20rem, calc(100vw - 2rem));
      margin: 0;
      padding: var(--ui-space-3) var(--ui-space-4);
      border: 1px solid #e5e7eb;
      border-radius: var(--ui-radius-lg);
      background: #ffffff;
      color: #111827;
      font-family: var(--ui-font-sans);
      font-size: var(--ui-font-size-md);
      line-height: 1.5;
      box-shadow: 0 10px 30px rgb(17 24 39 / 0.12);
      overflow: auto;
    }
  `;

  @property({ type: String })
  label = "";

  @property({ type: String })
  placeholder = "------";

  @state()
  private hasValue = false;

  @state()
  private open = false;

  @query(".panel")
  private panel!: HTMLElement;

  @query(".field")
  private anchor!: HTMLElement;

  private suppressToggle = false;
  private placedAbove = false;
  private panelWidth = 0;
  private panelHeight = 0;
  private repositioning = false;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("pointerdown", this.onPointerDown);
    this.addEventListener("click", this.onClick);
    this.addEventListener("submit", this.onSubmit);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("pointerdown", this.onPointerDown);
    this.removeEventListener("click", this.onClick);
    this.removeEventListener("submit", this.onSubmit);
    this.unbindReposition();
    this.close();
  }

  private isPanelEvent(event: Event) {
    return !!this.panel && event.composedPath().includes(this.panel);
  }

  private readonly onPointerDown = (event: PointerEvent) => {
    this.suppressToggle = false;
    if (!this.panel?.matches(":popover-open") || this.isPanelEvent(event)) return;
    this.suppressToggle = true;
  };

  private isCloseRequest(event: Event) {
    return event.composedPath().some((node) => node instanceof HTMLElement && node.hasAttribute("data-popover-close"));
  }

  private isClearEvent(event: Event) {
    return event.composedPath().some((node) => node instanceof HTMLElement && node.classList.contains("clear"));
  }

  private contentForm(form: HTMLFormElement) {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot[name="content"]');
    if (!slot) return false;
    return slot.assignedElements({ flatten: true }).some((node) => node === form || node.contains(form));
  }

  private readonly onSubmit = (event: Event) => {
    if (!(event.target instanceof HTMLFormElement) || !this.contentForm(event.target)) return;
    event.preventDefault();
    this.close();
  };

  get isOpen() {
    return this.panel?.matches(":popover-open") ?? false;
  }

  show() {
    if (!this.panel || this.panel.matches(":popover-open")) return;
    this.place();
    this.panel.showPopover();
  }

  close() {
    if (this.panel?.matches(":popover-open")) this.panel.hidePopover();
  }

  private onClearClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent("clear", { bubbles: true, composed: true }));
    this.close();
  }

  private readonly onClick = (event: Event) => {
    if (this.isCloseRequest(event)) {
      this.close();
      return;
    }
    if (this.isPanelEvent(event) || this.isClearEvent(event)) return;
    const suppress = this.suppressToggle;
    this.suppressToggle = false;
    if (suppress) return;
    this.toggle();
  };

  private readonly onToggle = (event: Event) => {
    const open = event instanceof ToggleEvent ? event.newState === "open" : this.panel.matches(":popover-open");
    this.open = open;
    if (open) this.bindReposition();
    else {
      this.unbindReposition();
      this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }));
    }
  };

  private readonly onReposition = () => {
    if (!this.panel?.matches(":popover-open")) return;
    this.place(true);
  };

  private measureNatural() {
    const panel = this.panel;
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
    const trigger = this.anchor;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const margin = 8;
    const gap = 4;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (!moveOnly) {
      const natural = this.measureNatural();
      const spaceBelow = viewportHeight - rect.bottom - gap - margin;
      const spaceAbove = rect.top - gap - margin;
      this.placedAbove = natural.height > spaceBelow && spaceAbove > spaceBelow;
      const available = Math.max(0, this.placedAbove ? spaceAbove : spaceBelow);
      this.panel.style.maxHeight = `${available}px`;
      this.panelWidth = natural.width;
      this.panelHeight = Math.min(natural.height, available);
    }

    const top = this.placedAbove ? rect.top - gap - this.panelHeight : rect.bottom + gap;
    let left = rect.left;
    if (left + this.panelWidth > viewportWidth - margin) {
      left = viewportWidth - margin - this.panelWidth;
    }
    this.panel.style.top = `${top}px`;
    this.panel.style.left = `${Math.max(margin, left)}px`;
  }

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

  private toggle() {
    if (this.isOpen) this.close();
    else this.show();
  }

  private onValueSlotChange(event: Event) {
    const slot = event.target;
    if (!(slot instanceof HTMLSlotElement)) return;
    const hasValue = slotHasContent(slot);
    if (hasValue === this.hasValue) return;
    queueMicrotask(() => {
      if (this.hasValue !== hasValue) this.hasValue = hasValue;
    });
  }

  override render() {
    const clearLabel = this.label ? `Clear ${this.label}` : "Clear";
    return html`
      <div class="field">
        <button class="trigger" type="button" aria-expanded=${this.open ? "true" : "false"}>
          <span class="label-row">
            <span class="label">${this.label}</span>
            <svg class="pencil" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
              />
              <path
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m15 5 4 4"
              />
            </svg>
          </span>
          <span class="value">
            <slot name="value" @slotchange=${this.onValueSlotChange}></slot>
            ${this.hasValue ? nothing : html`<span class="placeholder">${this.placeholder}</span>`}
          </span>
        </button>
        ${this.hasValue
          ? html`
              <button class="clear" type="button" aria-label=${clearLabel} @click=${this.onClearClick}>
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
      <div class="panel" popover="auto" @toggle=${this.onToggle}>
        <slot name="content"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-inline-edit": UiInlineEdit;
  }
}
