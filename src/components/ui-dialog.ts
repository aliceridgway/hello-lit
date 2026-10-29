import { LitElement, css, html, type PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement("ui-dialog")
export class UiDialog extends LitElement {
  static override styles = css`
    :host {
      display: contents;
    }

    dialog {
      position: relative;
      box-sizing: border-box;
      max-width: calc(100% - 2rem);
      margin: auto;
      padding: var(--ui-space-4);
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      background: #ffffff;
      color: #111827;
      font-family: var(--ui-font-sans);
      font-size: var(--ui-font-size-md);
      line-height: 1.5;
    }

    dialog::backdrop {
      background: rgb(17 24 39 / 0.45);
    }

    .close {
      position: absolute;
      top: var(--ui-space-2);
      right: var(--ui-space-2);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      margin: 0;
      padding: 0;
      border: none;
      border-radius: var(--ui-radius-md);
      background: transparent;
      color: inherit;
      font: inherit;
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
    }

    .close:hover {
      background: #f3f4f6;
    }

    .content {
      padding-right: 1.5rem;
    }
  `;

  @property({ type: Boolean, reflect: true })
  open = false;

  @property({ type: String })
  width = "32rem";

  @query("dialog")
  private dialog!: HTMLDialogElement;

  override updated(changed: PropertyValues<this>) {
    if (!changed.has("open") || !this.dialog) return;

    if (this.open && !this.dialog.open) {
      this.dialog.showModal();
    } else if (!this.open && this.dialog.open) {
      this.dialog.close();
    }
  }

  private emitClose() {
    this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }));
  }

  private requestClose() {
    if (!this.open) return;
    this.open = false;
    this.emitClose();
  }

  private onDialogClose() {
    if (!this.open) return;
    this.open = false;
    this.emitClose();
  }

  private onDialogClick(event: MouseEvent) {
    const rect = this.dialog.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (inside) return;
    this.dialog.close();
  }

  override render() {
    return html`
      <dialog
        style=${styleMap({ width: this.width })}
        @close=${this.onDialogClose}
        @click=${this.onDialogClick}
      >
        <button class="close" type="button" aria-label="Close" @click=${this.requestClose}>
          ×
        </button>
        <div class="content">
          <slot></slot>
        </div>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-dialog": UiDialog;
  }
}
