import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

export type ChipRemoveDetail = {
  value: string;
};

/**
 * One chip in a `ui-chip-group`.
 *
 * Slots: default (label).
 * `remove` bubbles and is composed. `detail.value` is the `value` attribute,
 * or the trimmed text content when `value` is omitted.
 * No public methods. The chip stays in the DOM after the click.
 *
 * @example
 * <ui-chip value="design">Design</ui-chip>
 */
@customElement("ui-chip")
export class UiChip extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      vertical-align: middle;
      max-width: 100%;
    }

    .ui-chip {
      display: inline-flex;
      align-items: center;
      max-width: 100%;
      box-sizing: border-box;
      margin: 0;
      padding: var(--ui-space-1) var(--ui-space-1) var(--ui-space-1) var(--ui-space-3);
      border: 1px solid var(--ui-chip-border);
      border-radius: 999px;
      background: var(--ui-chip-bg);
      color: var(--ui-chip-fg);
      font-family: var(--ui-font-sans);
      font-size: var(--ui-font-size-sm);
      font-weight: var(--ui-font-weight-medium);
      line-height: var(--ui-line-height);
    }

    .ui-chip__label {
      padding-right: var(--ui-space-1);
      white-space: nowrap;
    }

    .ui-chip__remove {
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      margin: 0;
      padding: 0;
      border: none;
      border-radius: 999px;
      background: transparent;
      color: var(--ui-color-fg-muted);
      cursor: pointer;
    }

    .ui-chip__remove svg {
      width: 0.875rem;
      height: 0.875rem;
    }

    .ui-chip__remove:hover {
      background: #e5e7eb;
      color: var(--ui-chip-fg);
    }

    .ui-chip__remove:focus-visible {
      outline: 2px solid var(--ui-field-border-focus);
      outline-offset: 1px;
    }
  `;

  /** Identifier sent with `remove`. Falls back to the trimmed label when omitted. */
  @property({ type: String })
  value = "";

  @state()
  private label = "";

  override connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute("role")) this.setAttribute("role", "listitem");
  }

  private onSlotChange(event: Event) {
    const slot = event.target;
    if (!(slot instanceof HTMLSlotElement)) return;
    const label = slot
      .assignedNodes({ flatten: true })
      .map((node) => node.textContent ?? "")
      .join("")
      .trim();
    if (label === this.label) return;
    this.label = label;
  }

  private onRemove(event: MouseEvent) {
    event.preventDefault();
    const value = this.value.trim() || (this.textContent ?? "").trim();
    this.dispatchEvent(
      new CustomEvent<ChipRemoveDetail>("remove", {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    const removeLabel = this.label ? `Remove ${this.label}` : "Remove";
    return html`
      <span class="ui-chip">
        <span class="ui-chip__label">
          <slot @slotchange=${this.onSlotChange}></slot>
        </span>
        <button class="ui-chip__remove" type="button" aria-label=${removeLabel} @click=${this.onRemove}>
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
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-chip": UiChip;
  }
}
