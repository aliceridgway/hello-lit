import { LitElement, css, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

/**
 * Number control. Form-associated: `name` submits `value`,
 * a form reset restores the value from connection, and a disabled fieldset disables the control.
 *
 * Wraps `<input type="number">`, so the spinner, arrow keys, and step behavior stay native.
 * `min`, `max`, and `step` are forwarded. Omit them for the browser defaults: step `1`, no minimum, and no maximum.
 * `value` is the sanitized string. Blank is `""`, which is distinct from `"0"`.
 *
 * Enter calls `requestSubmit()` on the parent form unless the control is disabled or readonly.
 * `input` is the inner input event, retargeted to this host after `value` updates.
 * Constraint validity mirrors the inner input, so `checkValidity` and `reportValidity` honor `min`, `max`, `step`, and `required`.
 * No slots. No public methods.
 *
 * `unit` renders after the input and stays visible when help is hidden.
 * `ui-form-field` writes `description`, `described-by`, `invalid`, and `required`.
 *
 * @example
 * <ui-number-input name="duration" unit="minutes" min="0" step="1"></ui-number-input>
 */
@customElement("ui-number-input")
export class UiNumberInput extends LitElement {
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

    .ui-number {
      display: flex;
      align-items: center;
      gap: var(--ui-space-2);
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

    .ui-number:has(.ui-number__unit) .ui-field__control {
      width: 9rem;
      flex: 0 1 9rem;
      min-width: 0;
    }

    .ui-number__unit {
      color: var(--ui-color-fg-muted);
      font: inherit;
      font-size: var(--ui-font-size-md);
      white-space: nowrap;
    }

    .ui-number--disabled .ui-number__unit {
      opacity: 0.5;
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

  /** Current sanitized text. Blank is `""`, distinct from `"0"`. */
  @property({ type: String })
  value = "";

  @property({ type: String })
  placeholder = "";

  /** Forwarded to the inner input. Empty omits the attribute. */
  @property({ type: String })
  min = "";

  /** Forwarded to the inner input. Empty omits the attribute. */
  @property({ type: String })
  max = "";

  /** Forwarded to the inner input. Empty omits the attribute, so the browser uses `1`. `"any"` allows any decimal. */
  @property({ type: String })
  step = "";

  /** Text shown after the input, such as `minutes`. */
  @property({ type: String })
  unit = "";

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

  /** Help or error copy. Id refs on the field cannot cross into this shadow. */
  @property({ type: String })
  description = "";

  /** Id of the help or error element. Copied to `aria-describedby` on the host. */
  @property({ attribute: "described-by" })
  describedBy = "";

  @state()
  private formDisabled = false;

  @query("input")
  private inputEl!: HTMLInputElement;

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

    this.syncFormState();
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

  private get unitText() {
    return this.unit.trim();
  }

  private get accessibleDescription() {
    return [this.unitText, this.description.trim()].filter(Boolean).join(". ");
  }

  private syncFormState() {
    const input = this.inputEl;
    if (input && input.value !== this.value) input.value = this.value;

    this.internals.setFormValue(this.controlDisabled ? null : this.value);

    if (!input || this.controlDisabled || this.readonly || input.validity.valid) {
      this.internals.setValidity({});
      return;
    }

    const message = input.validationMessage;
    if (!message) {
      this.internals.setValidity({});
      return;
    }

    const { validity } = input;
    this.internals.setValidity(
      {
        badInput: validity.badInput,
        customError: validity.customError,
        patternMismatch: validity.patternMismatch,
        rangeOverflow: validity.rangeOverflow,
        rangeUnderflow: validity.rangeUnderflow,
        stepMismatch: validity.stepMismatch,
        tooLong: validity.tooLong,
        tooShort: validity.tooShort,
        typeMismatch: validity.typeMismatch,
        valueMissing: validity.valueMissing,
      },
      message,
      input,
    );
  }

  private onInput(event: Event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (input.value === this.value) {
      this.syncFormState();
      return;
    }
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
    this.internals.form?.requestSubmit();
  }

  override render() {
    const unit = this.unitText;
    return html`
      <div class="ui-number ${this.controlDisabled ? "ui-number--disabled" : ""}">
        <input
          class="ui-field__control"
          type="number"
          placeholder=${this.placeholder || nothing}
          min=${this.min || nothing}
          max=${this.max || nothing}
          step=${this.step || nothing}
          ?disabled=${this.controlDisabled}
          ?readonly=${this.readonly}
          ?required=${this.required}
          aria-invalid=${this.invalid ? "true" : nothing}
          aria-description=${this.accessibleDescription || nothing}
          @input=${this.onInput}
          @keydown=${this.onKeydown}
        />
        ${unit
          ? html`<span class="ui-number__unit" aria-hidden="true">${unit}</span>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-number-input": UiNumberInput;
  }
}
