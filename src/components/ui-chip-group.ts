import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import "./ui-chip";

/**
 * A wrapping list of `ui-chip` elements.
 *
 * Slots: default (`ui-chip` elements).
 * `remove` bubbles from a chip with `{ value }`. This element does not remove the chip.
 * No public methods.
 *
 * @example
 * <ui-chip-group>
 *   <ui-chip value="design">Design</ui-chip>
 *   <ui-chip>Research</ui-chip>
 * </ui-chip-group>
 */
@customElement("ui-chip-group")
export class UiChipGroup extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--ui-space-2);
      max-width: 100%;
    }

    slot {
      display: contents;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute("role")) this.setAttribute("role", "list");
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-chip-group": UiChipGroup;
  }
}
