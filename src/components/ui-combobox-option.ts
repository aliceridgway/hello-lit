import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * One row in a `ui-combobox`. Place it in the combobox's `options` slot.
 *
 * Slots: default (row content). The row stacks that content in a column.
 * `value` is the string the combobox stores when this row is chosen. `label` is what the field shows.
 * Neither is the row's text.
 * `ui-combobox` sets `active` on the highlighted row and `selected` when `value` matches the field.
 * No events. No public methods.
 *
 * @example
 * <ui-combobox-option slot="options" value="apple" label="Apple">
 *   <span>Apple</span>
 *   <span>A crisp fruit</span>
 * </ui-combobox-option>
 */
@customElement("ui-combobox-option")
export class UiComboboxOption extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
      box-sizing: border-box;
      outline: none;
    }

    .row {
      display: block;
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

    .row slot {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: var(--ui-space-1);
    }

    :host([selected]) .row {
      background: #eef2ff;
    }

    :host([active]) .row,
    :host(:hover) .row {
      background: #f3f4f6;
    }
  `;

  /** String stored on the combobox when this row is chosen. */
  @property({ type: String })
  value = "";

  /** Text the combobox shows in the field when this row is chosen. */
  @property({ type: String })
  label = "";

  /** Set by `ui-combobox` while this row is highlighted. */
  @property({ type: Boolean, reflect: true })
  active = false;

  /** Set by `ui-combobox` when `value` equals the combobox value. */
  @property({ type: Boolean, reflect: true })
  selected = false;

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "option");
  }

  override updated() {
    this.setAttribute("aria-selected", this.selected ? "true" : "false");
  }

  override render() {
    return html`
      <div class="row">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-combobox-option": UiComboboxOption;
  }
}
