import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

/**
 * Single-line text control. Form-associated: `name` submits `value`,
 * a form reset restores the value from connection, and a disabled fieldset disables the control.
 *
 * Enter calls `requestSubmit()` on the parent form unless `type` is `"textarea"`,
 * or the control is disabled or readonly.
 * `input` is the inner input event, retargeted to this host after `value` updates.
 * No slots. No public methods.
 *
 * `ui-form-field` writes `description`, `described-by`, `invalid`, and `required`.
 *
 * @example
 * <ui-text-input name="email" placeholder="name@example.com"></ui-text-input>
 */
@customElement("ui-text-input")
export class UiTextInput extends LitElement {
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

    .ui-field__control {
      box-sizing: border-box;
      width: 100%;
      margin: 0;
      padding: var(--ui-space-2) var(--ui-space-3);
      border: 1px solid var(--ui-field-border);
      border-radius: var(--ui-radius-md);
      background: var(--ui-field-bg);
      color: var(--ui-field-fg);
      font: inherit;
      font-size: var(--ui-font-size-md);
      transition:
        border-color 120ms ease,
        box-shadow 120ms ease,
        background-color 120ms ease;
    }

    .ui-field__control::placeholder {
      color: var(--ui-field-placeholder);
    }

    .ui-field__control:hover:not(:disabled):not(:read-only):not(:focus) {
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

    .ui-field__control:read-only {
      background: #f9fafb;
      color: var(--ui-color-fg-muted);
      cursor: default;
    }

    :host([invalid]) .ui-field__control {
      border-color: var(--ui-field-border-invalid);
    }

    :host([invalid]) .ui-field__control:focus {
      border-color: var(--ui-field-border-invalid);
      box-shadow: 0 0 0 3px var(--ui-field-focus-ring-invalid);
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
    }
  `;

  @property({ type: String })
  value = "";

  @property({ type: String })
  placeholder = "";

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  readonly = false;

  @property({ type: Boolean, reflect: true })
  required = false;

  @property({ type: Boolean, reflect: true })
  invalid = false;

  @property({ type: String, reflect: true })
  name = "";

  /** Passed through to the inner input. `"textarea"` skips Enter-to-submit. */
  @property({ type: String })
  type = "text";

  /** Help or error copy. Id refs on the field cannot cross into this shadow. */
  @property({ type: String })
  description = "";

  /** Id of the help or error element. Copied to `aria-describedby` on the host. */
  @property({ attribute: "described-by" })
  describedBy = "";

  @state()
  private formDisabled = false;

  private readonly internals: ElementInternals;
  private defaultValue = "";

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback() {
    super.connectedCallback();
    this.defaultValue = this.value;
  }

  override updated() {
    if (this.describedBy) this.setAttribute("aria-describedby", this.describedBy);
    else this.removeAttribute("aria-describedby");

    if (this.invalid) this.setAttribute("aria-invalid", "true");
    else this.removeAttribute("aria-invalid");

    this.internals.setFormValue(this.controlDisabled ? null : this.value);
  }

  formDisabledCallback(disabled: boolean) {
    this.formDisabled = disabled;
  }

  formResetCallback() {
    this.value = this.defaultValue;
  }

  private get controlDisabled() {
    return this.disabled || this.formDisabled;
  }

  private onInput(event: Event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.value === this.value) return;
    this.value = input.value;
  }

  private onKeydown(event: KeyboardEvent) {
    if (
      event.key !== "Enter" ||
      event.defaultPrevented ||
      event.isComposing ||
      this.controlDisabled ||
      this.readonly
    ) {
      return;
    }
    if (this.type === "textarea") return;
    this.internals.form?.requestSubmit();
  }

  override render() {
    return html`
      <input
        class="ui-field__control"
        type=${this.type || "text"}
        .value=${this.value}
        placeholder=${this.placeholder || nothing}
        ?disabled=${this.controlDisabled}
        ?readonly=${this.readonly}
        ?required=${this.required}
        aria-invalid=${this.invalid ? "true" : nothing}
        aria-description=${this.description || nothing}
        @input=${this.onInput}
        @keydown=${this.onKeydown}
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-text-input": UiTextInput;
  }
}
