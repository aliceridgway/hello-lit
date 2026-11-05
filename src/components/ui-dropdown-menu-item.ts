import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

export type DropdownMenuSelectDetail = {
  value: string;
};

/**
 * One row in a `ui-dropdown-menu`. Place it in the menu's `items` slot.
 *
 * Slots: default (label).
 * `select` bubbles and is composed, with `{ value }` set to the trimmed text content.
 * A `disabled` item does not emit `select`.
 * Public method: `activate()`.
 *
 * @example
 * <ui-dropdown-menu-item slot="items">Edit</ui-dropdown-menu-item>
 */
@customElement("ui-dropdown-menu-item")
export class UiDropdownMenuItem extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
      box-sizing: border-box;
    }

    .item {
      display: inline-flex;
      align-items: center;
      gap: var(--ui-space-2);
      box-sizing: border-box;
      width: 100%;
      margin: 0;
      padding: var(--ui-space-2) var(--ui-space-3);
      border: none;
      border-radius: 0;
      background: transparent;
      color: #111827;
      font-family: var(--ui-font-sans);
      font-size: var(--ui-font-size-md);
      font-weight: var(--ui-font-weight-medium);
      line-height: var(--ui-line-height);
      text-align: start;
      cursor: pointer;
    }

    .item ::slotted(svg) {
      flex-shrink: 0;
      width: 1em;
      height: 1em;
    }

    .item:hover:not(:disabled),
    .item:focus-visible:not(:disabled) {
      background: #f3f4f6;
      outline: none;
    }

    .item:active:not(:disabled) {
      background: #e5e7eb;
    }

    .item:disabled {
      color: #9ca3af;
      cursor: not-allowed;
    }
  `;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  private activating = false;

  activate() {
    if (this.disabled || this.activating) return;
    this.activating = true;
    queueMicrotask(() => {
      this.activating = false;
    });
    const value = (this.textContent ?? "").trim();
    this.dispatchEvent(
      new CustomEvent<DropdownMenuSelectDetail>("select", {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onClick(event: MouseEvent) {
    event.preventDefault();
    this.activate();
  }

  override render() {
    return html`
      <button
        class="item"
        type="button"
        role="menuitem"
        tabindex="-1"
        ?disabled=${this.disabled}
        aria-disabled=${this.disabled ? "true" : "false"}
        @click=${this.onClick}
      >
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-dropdown-menu-item": UiDropdownMenuItem;
  }
}
