import { LitElement, css, html, nothing, unsafeCSS } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

const CHEVRON_URL = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none"><path stroke="#6b7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.5 6.25 8 9.75l3.5-3.5"/></svg>`,
)}")`;

@customElement("ui-select")
export class UiSelect extends LitElement {
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

    ::slotted(option),
    ::slotted(optgroup),
    slot[name="options"]::slotted(option),
    slot[name="options"]::slotted(optgroup) {
      display: none;
    }

    .ui-field__control {
      box-sizing: border-box;
      width: 100%;
      margin: 0;
      padding: var(--ui-space-2) 2rem var(--ui-space-2) var(--ui-space-3);
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
      appearance: none;
      transition:
        border-color 120ms ease,
        box-shadow 120ms ease,
        background-color 120ms ease;
    }

    .ui-field__control:hover:not(:disabled):not(:focus) {
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

  @property({ attribute: "described-by" })
  describedBy = "";

  @state()
  private formDisabled = false;

  @query("select")
  private selectEl!: HTMLSelectElement;

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

    if (this.selectEl && this.selectEl.value !== this.value) {
      this.selectEl.value = this.value;
    }
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

  private optionsSlot() {
    return this.renderRoot.querySelector<HTMLSlotElement>('slot[name="options"]');
  }

  private syncOptionsFromSlot(slot = this.optionsSlot()) {
    const select = this.selectEl ?? this.renderRoot.querySelector("select");
    if (!slot || !select) return;
    const nodes = slot
      .assignedElements({ flatten: true })
      .filter(
        (node): node is HTMLOptionElement | HTMLOptGroupElement =>
          node instanceof HTMLOptionElement || node instanceof HTMLOptGroupElement,
      )
      .map((node) => node.cloneNode(true) as HTMLOptionElement | HTMLOptGroupElement);

    select.replaceChildren(...nodes);
    select.value = this.value;
  }

  private onSlotChange(event: Event) {
    const slot = event.target;
    if (!(slot instanceof HTMLSlotElement)) return;
    this.syncOptionsFromSlot(slot);
  }

  override firstUpdated() {
    this.syncOptionsFromSlot();
  }

  private onChange(event: Event) {
    const select = event.target;
    if (!(select instanceof HTMLSelectElement) || select.value === this.value) return;
    this.value = select.value;
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  override render() {
    return html`
      <select
        class="ui-field__control"
        .value=${this.value}
        ?disabled=${this.controlDisabled}
        ?required=${this.required}
        aria-invalid=${this.invalid ? "true" : nothing}
        aria-description=${this.description || nothing}
        @change=${this.onChange}
      ></select>
      <slot name="options" @slotchange=${this.onSlotChange}></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-select": UiSelect;
  }
}
