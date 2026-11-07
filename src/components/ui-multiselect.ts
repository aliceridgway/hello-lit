import { LitElement, css, html, nothing, unsafeCSS, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { repeat } from "lit/directives/repeat.js";
import "./ui-chip";

const CHEVRON_URL = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none"><path stroke="#6b7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.5 6.25 8 9.75l3.5-3.5"/></svg>`,
)}")`;

let nextMultiselectId = 0;

type OptionItem = {
  kind: "option";
  value: string;
  label: string;
  disabled: boolean;
  id: string;
};

type GroupItem = {
  kind: "group";
  label: string;
  id: string;
};

type ListItem = OptionItem | GroupItem;

/**
 * Multiselect control. Form-associated: `name` submits one entry per selected value,
 * a form reset restores the value from connection, and a disabled fieldset disables the control.
 *
 * `value` is the selected values, in selection order. The attribute is a JSON array.
 * A value with no matching option still shows a chip, labeled with the value until an option provides text.
 *
 * Slots: `options` (`<option>` and `<optgroup>`). Empty-value options are ignored.
 * Disabled options are shown and cannot be toggled. Group labels are headings.
 * Choosing a row toggles that value and leaves the list open.
 * A chip remove drops that value and does not toggle the list.
 * Backspace removes the last chip. In a searchable field it deletes query text first, and removes a chip only when the query is empty. A disabled option stays selected.
 * `searchable` shows a text input after the chips. The text is a query, not `value`.
 * A row matches when its label or value contains the query, ignoring case. A group heading shows only when one of its options matches.
 * Focusing the input or typing opens the list. A query highlights the first enabled match. Enter or a comma adds that match, clears the query, and leaves the list open. Typed text that matches nothing is ignored.
 * Dispatches `input` and `change` on this host after `value` updates. Both bubble and are composed. Typing does not.
 * Escape, focus leaving the control, and a pointer outside close the list and clear the query.
 * No public methods.
 *
 * `ui-form-field` writes `description`, `described-by`, `invalid`, and `required`.
 *
 * @example
 * <ui-multiselect placeholder="Select fruits">
 *   <option slot="options" value="apple">Apple</option>
 * </ui-multiselect>
 */
@customElement("ui-multiselect")
export class UiMultiselect extends LitElement {
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

    slot[name="options"] {
      display: none;
    }

    .ui-field__control {
      position: relative;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--ui-space-1);
      box-sizing: border-box;
      width: 100%;
      min-height: calc(var(--ui-space-2) * 2 + var(--ui-font-size-md) * var(--ui-line-height) + 2px);
      margin: 0;
      padding: var(--ui-space-1) 2rem var(--ui-space-1) var(--ui-space-3);
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
      cursor: pointer;
      transition:
        border-color 120ms ease,
        box-shadow 120ms ease,
        background-color 120ms ease;
    }

    .ui-field__control:hover:not(.is-disabled):not(:focus-within) {
      border-color: var(--ui-field-border-hover);
    }

    .ui-field__control:focus-within {
      border-color: var(--ui-field-border-focus);
      box-shadow: 0 0 0 3px var(--ui-field-focus-ring);
    }

    .ui-field__control.is-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    :host([invalid]) .ui-field__control {
      border-color: var(--ui-field-border-invalid);
    }

    :host([invalid]) .ui-field__control:focus-within {
      border-color: var(--ui-field-border-invalid);
      box-shadow: 0 0 0 3px var(--ui-field-focus-ring-invalid);
    }

    .chips {
      position: relative;
      z-index: 1;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--ui-space-1);
      max-width: 100%;
      pointer-events: none;
    }

    .chips ui-chip {
      pointer-events: auto;
    }

    .placeholder {
      color: var(--ui-field-placeholder);
      pointer-events: none;
    }

    .ui-field__control:has(.query) {
      cursor: text;
    }

    .query {
      position: relative;
      z-index: 1;
      order: 1;
      flex: 1 1 6rem;
      min-width: 4rem;
      margin: 0;
      padding: 0;
      border: none;
      background: transparent;
      color: inherit;
      font: inherit;
      line-height: inherit;
      cursor: text;
    }

    .query::placeholder {
      color: var(--ui-field-placeholder);
    }

    .query:focus {
      outline: none;
    }

    .query:disabled {
      cursor: not-allowed;
    }

    .opener {
      position: absolute;
      inset: 0;
      z-index: 0;
      margin: 0;
      padding: 0;
      border: none;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
      appearance: none;
    }

    .opener:disabled {
      cursor: not-allowed;
    }

    .opener:focus {
      outline: none;
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

    .group,
    .empty {
      margin: 0;
      padding: var(--ui-space-2) var(--ui-space-3) var(--ui-space-1);
      color: #6b7280;
      font-size: var(--ui-font-size-sm);
      font-weight: var(--ui-font-weight-medium);
      line-height: var(--ui-line-height);
    }

    .empty {
      font-weight: 400;
    }

    .option {
      display: flex;
      align-items: center;
      gap: var(--ui-space-2);
      box-sizing: border-box;
      width: 100%;
      margin: 0;
      padding: var(--ui-space-2) var(--ui-space-3);
      background: transparent;
      color: #111827;
      font-family: var(--ui-font-sans);
      font-size: var(--ui-font-size-md);
      line-height: var(--ui-line-height);
      text-align: start;
      cursor: pointer;
    }

    .option[aria-selected="true"] {
      background: #eef2ff;
    }

    .option.active,
    .option:hover:not([aria-disabled="true"]) {
      background: #f3f4f6;
    }

    .option[aria-disabled="true"] {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .check {
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      width: 1rem;
      height: 1rem;
      color: #4f46e5;
    }

    .check svg {
      width: 1rem;
      height: 1rem;
    }

    @media (forced-colors: active) {
      .ui-field__control:focus-within {
        outline: 2px solid Highlight;
        outline-offset: 2px;
        box-shadow: none;
      }

      :host([invalid]) .ui-field__control {
        border-color: Mark;
      }

      .check {
        color: Highlight;
      }
    }
  `;

  /** Selected values, in selection order. The attribute is a JSON array. */
  @property({ type: Array })
  value: string[] = [];

  @property({ type: String })
  placeholder = "";

  /** Shows a text input that filters options by label or value. The text is not submitted. */
  @property({ type: Boolean, reflect: true })
  searchable = false;

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

  @state()
  private items: ListItem[] = [];

  @state()
  private query = "";

  private readonly internals: ElementInternals;
  private readonly listId = `ui-multiselect-list-${++nextMultiselectId}`;
  private defaultValue: string[] = [];
  private placedAbove = false;
  private panelWidth = 0;
  private panelHeight = 0;
  private repositioning = false;
  private focusingQuery = false;
  private wantsOpen = false;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback() {
    super.connectedCallback();
    this.defaultValue = this.normalizedValues(this.value);
    document.addEventListener("pointerdown", this.onDocumentPointerDown, true);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("pointerdown", this.onDocumentPointerDown, true);
    this.unbindReposition();
    this.closeList();
  }

  override willUpdate(changed: PropertyValues<this>) {
    if (changed.has("searchable") && !this.searchable && this.query !== "") this.query = "";
    if (!changed.has("value")) return;
    const next = this.normalizedValues(this.value);
    if (this.sameValues(next, this.value)) return;
    this.value = next;
  }

  override updated() {
    if (this.describedBy) this.setAttribute("aria-describedby", this.describedBy);
    else this.removeAttribute("aria-describedby");

    if (this.invalid) this.setAttribute("aria-invalid", "true");
    else this.removeAttribute("aria-invalid");

    this.syncFormValue();

    if (this.controlDisabled && this.open) {
      this.closeList();
      return;
    }

    this.syncQueryInput();
    this.syncActiveDescendant();
    if (this.open) this.place();
  }

  override firstUpdated() {
    this.syncItems();
  }

  formDisabledCallback(disabled: boolean) {
    this.formDisabled = disabled;
  }

  formResetCallback() {
    this.value = [...this.defaultValue];
    this.activeIndex = -1;
    this.query = "";
  }

  private get controlDisabled() {
    return this.disabled || this.formDisabled;
  }

  private get opener() {
    return this.renderRoot.querySelector<HTMLButtonElement>(".opener");
  }

  private get queryEl() {
    return this.renderRoot.querySelector<HTMLInputElement>(".query");
  }

  private get popupTarget() {
    return this.searchable ? this.queryEl : this.opener;
  }

  private get panelEl() {
    return this.renderRoot.querySelector<HTMLElement>(".panel");
  }

  private get controlEl() {
    return this.renderRoot.querySelector<HTMLElement>(".ui-field__control");
  }

  private get hasOptions() {
    return this.items.some((item) => item.kind === "option");
  }

  private normalizedValues(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    const seen = new Set<string>();
    const result: string[] = [];
    for (const item of value) {
      if (typeof item !== "string" || item === "" || seen.has(item)) continue;
      seen.add(item);
      result.push(item);
    }
    return result;
  }

  private sameValues(left: readonly string[], right: unknown) {
    return Array.isArray(right) && left.length === right.length && left.every((item, index) => item === right[index]);
  }

  private labelFor(value: string) {
    for (const item of this.items) {
      if (item.kind === "option" && item.value === value && item.label) return item.label;
    }
    return value;
  }

  private canToggle(value: string) {
    return this.items.every((item) => item.kind !== "option" || item.value !== value || !item.disabled);
  }

  private visibleItems() {
    const needle = this.query.trim().toLowerCase();
    if (!this.searchable || needle === "") return this.items;
    const visible: ListItem[] = [];
    let group: GroupItem | null = null;
    let groupUsed = false;
    for (const item of this.items) {
      if (item.kind === "group") {
        group = item;
        groupUsed = false;
        continue;
      }
      if (!`${item.label}\n${item.value}`.toLowerCase().includes(needle)) continue;
      if (group && !groupUsed) {
        visible.push(group);
        groupUsed = true;
      }
      visible.push(item);
    }
    return visible;
  }

  private toggleValue(value: string, clearQuery = false) {
    if (this.controlDisabled || !this.canToggle(value)) return;
    const next = this.value.includes(value) ? this.value.filter((item) => item !== value) : [...this.value, value];
    this.commit(next);
    if (clearQuery) this.query = "";
  }

  private selectableIndexes() {
    return this.visibleItems().flatMap((item) => {
      if (item.kind !== "option" || item.disabled) return [];
      const index = this.items.indexOf(item);
      return index < 0 ? [] : [index];
    });
  }

  private syncFormValue() {
    if (this.controlDisabled) {
      this.internals.setFormValue(null);
      return;
    }
    const data = new FormData();
    for (const value of this.value) data.append(this.name, value);
    this.internals.setFormValue(data);
  }

  private syncItems(slot?: HTMLSlotElement | null) {
    const source = slot ?? this.renderRoot.querySelector<HTMLSlotElement>('slot[name="options"]');
    const nodes = source
      ? source.assignedElements({ flatten: false })
      : [...this.children].filter((node) => node instanceof HTMLElement && node.slot === "options");
    const items: ListItem[] = [];
    let index = 0;

    const pushOption = (option: HTMLOptionElement, groupDisabled: boolean) => {
      if (option.value === "") return;
      const label = option.label.trim() || option.value;
      items.push({
        kind: "option",
        value: option.value,
        label,
        disabled: groupDisabled || option.disabled,
        id: `${this.listId}-opt-${index++}`,
      });
    };

    for (const node of nodes) {
      if (node instanceof HTMLOptionElement) {
        pushOption(node, false);
        continue;
      }
      if (!(node instanceof HTMLOptGroupElement)) continue;
      const label = node.label.trim();
      if (label) items.push({ kind: "group", label, id: `${this.listId}-group-${index++}` });
      for (const child of node.children) {
        if (child instanceof HTMLOptionElement) pushOption(child, node.disabled);
      }
    }

    this.items = items;
    const current = items[this.activeIndex];
    if (!current || current.kind !== "option" || current.disabled) this.activeIndex = -1;
    const hasOptions = items.some((item) => item.kind === "option");
    if (!hasOptions && this.open) this.closeList();
    else if (this.wantsOpen && hasOptions && !this.open) this.openList();
  }

  private readonly onDocumentPointerDown = (event: PointerEvent) => {
    if (!this.open || event.composedPath().includes(this)) return;
    this.closeList();
  };

  private containsTarget(target: EventTarget | null) {
    if (!(target instanceof Node)) return false;
    let current: Node | null = target;
    while (current) {
      if (current === this) return true;
      const root = current.getRootNode();
      if (root instanceof ShadowRoot) current = root.host;
      else return this.contains(current);
    }
    return false;
  }

  private onFocusOut(event: FocusEvent) {
    if (this.containsTarget(event.relatedTarget)) return;
    this.closeList();
  }

  private onOpenerMouseDown(event: MouseEvent) {
    if (!this.searchable) return;
    event.preventDefault();
  }

  private onOpenerClick() {
    if (this.controlDisabled) return;
    if (this.searchable) {
      this.focusingQuery = true;
      this.queryEl?.focus();
      this.focusingQuery = false;
    }
    if (this.open) this.closeList();
    else this.openList();
  }

  private onQueryFocus() {
    if (this.focusingQuery || this.controlDisabled) return;
    this.wantsOpen = true;
    queueMicrotask(() => {
      if (this.wantsOpen) this.openList();
    });
  }

  private onQueryInput(event: Event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || this.controlDisabled) return;
    this.query = input.value;
    this.highlightQueryMatch();
    if (this.hasOptions) this.openList();
  }

  private highlightQueryMatch() {
    const indexes = this.selectableIndexes();
    if (this.searchable && this.query.trim() !== "") {
      if (!indexes.includes(this.activeIndex)) this.activeIndex = indexes[0] ?? -1;
      return;
    }
    if (!indexes.includes(this.activeIndex)) this.activeIndex = -1;
  }

  private commitActive(clearQuery: boolean) {
    const item = this.items[this.activeIndex];
    if (!item || item.kind !== "option" || item.disabled) return;
    this.toggleValue(item.value, clearQuery);
    if (clearQuery) this.activeIndex = -1;
  }

  private onKeydown(event: KeyboardEvent) {
    if (event.isComposing || this.controlDisabled) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (this.selectableIndexes().length === 0) return;
      event.preventDefault();
      this.moveActive(event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (event.key === "Escape") {
      if (!this.open && this.query === "") return;
      event.preventDefault();
      event.stopPropagation();
      this.closeList();
      return;
    }

    if (event.key === "Backspace") {
      if (this.searchable && this.query !== "") return;
      event.preventDefault();
      const last = this.value.at(-1);
      if (last) this.toggleValue(last);
      return;
    }

    if (this.searchable && event.key === " ") return;

    if (this.searchable && event.key === ",") {
      event.preventDefault();
      if (this.query.trim() === "") return;
      this.commitActive(true);
      return;
    }

    if (event.key === "Enter" && this.searchable) {
      event.preventDefault();
      if (!this.open) return;
      this.commitActive(true);
      return;
    }

    if ((event.key !== "Enter" && event.key !== " ") || !this.open || this.searchable) return;
    event.preventDefault();
    const item = this.items[this.activeIndex];
    if (!item || item.kind !== "option") return;
    this.toggleValue(item.value);
  }

  private onChipRemove(event: Event) {
    event.stopPropagation();
    if (this.controlDisabled || !(event instanceof CustomEvent)) return;
    const value = event.detail?.value;
    if (typeof value !== "string") return;
    this.toggleValue(value);
  }

  private onListMouseDown(event: MouseEvent) {
    if (!this.optionRow(event.target)) return;
    event.preventDefault();
  }

  private onListClick(event: MouseEvent) {
    const row = this.optionRow(event.target);
    if (!row || this.controlDisabled) return;
    const index = Number(row.dataset.index);
    const item = this.items[index];
    if (!item || item.kind !== "option") return;
    this.activeIndex = index;
    this.toggleValue(item.value, true);
  }

  private optionRow(target: EventTarget | null) {
    if (!(target instanceof Element)) return null;
    const row = target.closest("[data-index]");
    return row instanceof HTMLElement ? row : null;
  }

  private onSlotChange(event: Event) {
    const slot = event.target;
    if (!(slot instanceof HTMLSlotElement)) return;
    this.syncItems(slot);
  }

  private onToggle(event: Event) {
    const panel = this.panelEl;
    const open = event instanceof ToggleEvent ? event.newState === "open" : !!panel?.matches(":popover-open");
    this.open = open;
    if (open) this.bindReposition();
    else {
      this.activeIndex = -1;
      this.wantsOpen = false;
      if (this.query !== "") this.query = "";
      this.unbindReposition();
    }
  }

  private moveActive(delta: number) {
    const indexes = this.selectableIndexes();
    if (indexes.length === 0) return;
    const current = indexes.indexOf(this.activeIndex);
    const next =
      current < 0
        ? delta > 0
          ? indexes[0]
          : indexes[indexes.length - 1]
        : indexes[Math.min(indexes.length - 1, Math.max(0, current + delta))];
    this.activeIndex = next;
    this.openList();
    this.renderRoot.querySelector<HTMLElement>(`#${this.items[next].id}`)?.scrollIntoView({ block: "nearest" });
  }

  private commit(value: string[]) {
    const next = this.normalizedValues(value);
    if (this.sameValues(next, this.value)) return;
    this.value = next;
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  private openList() {
    if (this.controlDisabled || !this.hasOptions) return;
    const panel = this.panelEl;
    if (!panel) return;
    if (!panel.matches(":popover-open")) {
      this.place();
      panel.showPopover();
    }
    this.open = true;
    this.wantsOpen = true;
    this.bindReposition();
  }

  private closeList() {
    this.activeIndex = -1;
    this.wantsOpen = false;
    if (this.query !== "") this.query = "";
    const panel = this.panelEl;
    if (panel?.matches(":popover-open")) panel.hidePopover();
    this.open = false;
    this.unbindReposition();
  }

  private syncQueryInput() {
    const input = this.queryEl;
    if (!input || input.value === this.query) return;
    input.value = this.query;
  }

  private syncActiveDescendant() {
    const target = this.popupTarget;
    if (!target) return;
    const item = this.open ? this.items[this.activeIndex] : undefined;
    const active = item?.kind === "option" && this.visibleItems().includes(item) ? item : null;
    if ("ariaActiveDescendantElement" in target) {
      const element = active ? this.renderRoot.querySelector<HTMLElement>(`#${active.id}`) : null;
      (target as HTMLElement & { ariaActiveDescendantElement: Element | null }).ariaActiveDescendantElement = element;
    }
    if (active) target.setAttribute("aria-activedescendant", active.id);
    else target.removeAttribute("aria-activedescendant");
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
    const anchor = this.controlEl;
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

  private renderOption(item: OptionItem, index: number) {
    const selected = this.value.includes(item.value);
    return html`
      <div
        id=${item.id}
        class=${classMap({ option: true, active: this.open && index === this.activeIndex })}
        role="option"
        aria-selected=${selected ? "true" : "false"}
        aria-disabled=${item.disabled ? "true" : "false"}
        data-index=${index}
      >
        <span class="check">
          ${selected
            ? html`
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M3.5 8.5 6.5 11.5 12.5 4.5"
                  />
                </svg>
              `
            : nothing}
        </span>
        <span>${item.label}</span>
      </div>
    `;
  }

  override render() {
    const selected = this.value;
    const visible = this.visibleItems();
    const hasVisibleOptions = visible.some((item) => item.kind === "option");
    return html`
      <div class=${classMap({ "ui-field__control": true, "is-disabled": this.controlDisabled })} @focusout=${this.onFocusOut}>
        ${this.searchable
          ? html`
              <input
                class="query"
                type="text"
                role="combobox"
                autocomplete="off"
                aria-autocomplete="list"
                placeholder=${selected.length === 0 && this.query === "" && this.placeholder ? this.placeholder : nothing}
                ?disabled=${this.controlDisabled}
                aria-haspopup="listbox"
                aria-expanded=${this.open ? "true" : "false"}
                aria-controls=${this.listId}
                aria-invalid=${this.invalid ? "true" : nothing}
                aria-required=${this.required ? "true" : nothing}
                aria-description=${this.description || nothing}
                @focus=${this.onQueryFocus}
                @input=${this.onQueryInput}
                @keydown=${this.onKeydown}
              />
            `
          : nothing}
        <button
          class="opener"
          type="button"
          tabindex=${this.searchable ? "-1" : nothing}
          aria-hidden=${this.searchable ? "true" : nothing}
          ?disabled=${this.controlDisabled}
          aria-haspopup=${this.searchable ? nothing : "listbox"}
          aria-expanded=${this.searchable ? nothing : this.open ? "true" : "false"}
          aria-controls=${this.searchable ? nothing : this.listId}
          aria-invalid=${!this.searchable && this.invalid ? "true" : nothing}
          aria-required=${!this.searchable && this.required ? "true" : nothing}
          aria-description=${this.searchable ? nothing : this.description || nothing}
          @mousedown=${this.onOpenerMouseDown}
          @click=${this.onOpenerClick}
          @keydown=${this.onKeydown}
        ></button>
        ${selected.length
          ? html`
              <span class="chips">
                ${repeat(
                  selected,
                  (value) => value,
                  (value) => html`
                    <ui-chip
                      role="none"
                      .value=${value}
                      .removable=${!this.controlDisabled && this.canToggle(value)}
                      @remove=${this.onChipRemove}
                    >
                      ${this.labelFor(value)}
                    </ui-chip>
                  `,
                )}
              </span>
            `
          : !this.searchable && this.placeholder
            ? html`<span class="placeholder">${this.placeholder}</span>`
            : nothing}
      </div>
      <div class="panel" popover="manual" @toggle=${this.onToggle}>
        <div
          id=${this.listId}
          class="list"
          role="listbox"
          aria-multiselectable="true"
          @mousedown=${this.onListMouseDown}
          @click=${this.onListClick}
        >
          ${visible.map((item) => {
            const index = this.items.indexOf(item);
            return item.kind === "group"
              ? html`<div class="group" role="presentation">${item.label}</div>`
              : this.renderOption(item, index);
          })}
        </div>
        ${this.searchable && this.query.trim() !== "" && !hasVisibleOptions
          ? html`<div class="empty">No matches</div>`
          : nothing}
      </div>
      <slot name="options" @slotchange=${this.onSlotChange}></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-multiselect": UiMultiselect;
  }
}
