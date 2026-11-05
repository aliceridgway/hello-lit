import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";
type ButtonType = "button" | "submit" | "reset";
type IconPosition = "start" | "end";

/**
 * Form-associated button.
 *
 * Slots: default (label), `icon`.
 * `type="submit"` calls `requestSubmit()` on the parent form.
 * `type="reset"` calls `reset()` on the parent form.
 * `disabled` and `loading` stop the click from leaving the element.
 * No public methods.
 *
 * @example
 * <ui-button variant="primary" icon-position="start">
 *   <span slot="icon" aria-hidden="true">+</span>
 *   Add
 * </ui-button>
 */
@customElement("ui-button")
export class UiButton extends LitElement {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: inline-flex;
      vertical-align: middle;
    }

    .ui-button {
      display: inline-flex;
      flex: 1 1 auto;
      align-items: center;
      justify-content: center;
      gap: var(--ui-space-2);
      margin: 0;
      border: 1px solid transparent;
      border-radius: var(--ui-radius-md);
      background: var(--ui-button-bg);
      color: var(--ui-button-fg);
      font-family: var(--ui-font-sans);
      font-weight: var(--ui-font-weight-semibold);
      line-height: var(--ui-line-height);
      cursor: pointer;
      transition:
        background-color 120ms ease,
        color 120ms ease,
        border-color 120ms ease,
        opacity 120ms ease;
    }

    .ui-button__icon,
    .ui-button__spinner {
      display: inline-flex;
      flex-shrink: 0;
      width: 1em;
      height: 1em;
      color: var(--ui-button-icon);
    }

    .ui-button__icon[hidden] {
      display: none !important;
    }

    .ui-button--icon-end .ui-button__icon {
      order: 1;
    }

    .ui-button__icon ::slotted(*) {
      display: block;
      width: 100%;
      height: 100%;
    }

    .ui-button__spinner {
      border: 0.125em solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      opacity: 0.85;
      animation: ui-button-spin 0.6s linear infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      .ui-button__spinner {
        animation: none;
        border-right-color: currentColor;
        opacity: 0.5;
      }
    }

    @keyframes ui-button-spin {
      to {
        transform: rotate(360deg);
      }
    }

    .ui-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .ui-button--sm {
      padding: var(--ui-space-1) var(--ui-space-2);
      font-size: var(--ui-font-size-sm);
    }

    .ui-button--md {
      padding: var(--ui-space-2) var(--ui-space-3);
      font-size: var(--ui-font-size-md);
    }

    .ui-button--lg {
      padding: var(--ui-space-3) var(--ui-space-4);
      font-size: var(--ui-font-size-lg);
    }

    .ui-button--primary {
      --ui-button-bg: var(--ui-button-primary-bg);
      --ui-button-fg: var(--ui-button-primary-fg);
      --ui-button-icon: var(--ui-button-primary-icon);
    }

    .ui-button--primary:hover:not(:disabled) {
      filter: brightness(1.05);
    }

    .ui-button--secondary {
      --ui-button-bg: var(--ui-button-secondary-bg);
      --ui-button-fg: var(--ui-button-secondary-fg);
      --ui-button-icon: var(--ui-button-secondary-icon);
      border-color: var(--ui-button-secondary-border);
    }

    .ui-button--secondary:hover:not(:disabled) {
      filter: brightness(0.98);
    }

    .ui-button--ghost {
      --ui-button-bg: var(--ui-button-ghost-bg);
      --ui-button-fg: var(--ui-button-ghost-fg);
      --ui-button-icon: var(--ui-button-ghost-icon);
    }

    .ui-button--ghost:hover:not(:disabled) {
      --ui-button-bg: var(--ui-button-ghost-hover-bg);
    }
  `;

  @property({ type: String })
  variant: ButtonVariant = "primary";

  @property({ type: String })
  size: ButtonSize = "md";

  @property({ type: Boolean })
  disabled = false;

  /** `"submit"` requests submit, and `"reset"` resets the parent form. */
  @property({ type: String })
  type: ButtonType = "button";

  /** Which side the `icon` slot and the loading spinner sit on. */
  @property({ type: String, attribute: "icon-position" })
  iconPosition: IconPosition = "start";

  @property({ type: Boolean })
  loading = false;

  @state()
  private hasIcon = false;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  private readHasIcon(slot: HTMLSlotElement) {
    return slot.assignedNodes({ flatten: true }).some((node) => {
      if (node.nodeType === Node.TEXT_NODE) return Boolean(node.textContent?.trim());
      return node.nodeType === Node.ELEMENT_NODE;
    });
  }

  private onIconSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    const hasIcon = this.readHasIcon(slot);
    if (hasIcon === this.hasIcon) return;
    queueMicrotask(() => {
      if (this.hasIcon !== hasIcon) this.hasIcon = hasIcon;
    });
  }

  private onClick(event: MouseEvent) {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (this.type === "submit") {
      this.internals.form?.requestSubmit();
    } else if (this.type === "reset") {
      this.internals.form?.reset();
    }
  }

  override render() {
    const hideIcon = !this.hasIcon || this.loading;

    return html`
      <button
        class=${classMap({
          "ui-button": true,
          [`ui-button--${this.variant}`]: true,
          [`ui-button--${this.size}`]: true,
          "ui-button--icon-end": this.iconPosition === "end",
        })}
        type="button"
        ?disabled=${this.disabled || this.loading}
        aria-busy=${this.loading ? "true" : nothing}
        @click=${this.onClick}
      >
        ${this.loading && this.iconPosition === "start"
          ? html`<span class="ui-button__spinner" aria-hidden="true"></span>`
          : nothing}
        <span class="ui-button__icon" aria-hidden="true" ?hidden=${hideIcon}>
          <slot name="icon" @slotchange=${this.onIconSlotChange}></slot>
        </span>
        <slot></slot>
        ${this.loading && this.iconPosition === "end"
          ? html`<span class="ui-button__spinner" aria-hidden="true"></span>`
          : nothing}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-button": UiButton;
  }
}
