import { LitElement, html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  formFieldControlProps,
  formFieldStyles,
  slotHasContent,
} from "./form-field";

let nextFieldId = 0;

/**
 * Reusable field chrome: label, control slot, help, and error.
 *
 * @example
 * <ui-form-field label="Email" help="We never share this." required>
 *   <ui-text-input name="email"></ui-text-input>
 * </ui-form-field>
 */
@customElement("ui-form-field")
export class UiFormField extends LitElement {
  static override styles = formFieldStyles;

  @property({ type: String })
  label = "";

  @property({ type: String })
  help = "";

  @property({ type: String })
  error = "";

  @property({ type: Boolean, reflect: true })
  required = false;

  @state()
  private hasLabelSlot = false;

  @state()
  private hasHelpSlot = false;

  @state()
  private description = "";

  private readonly generatedId = `ui-field-${++nextFieldId}`;
  private explicitId = "";

  private get controlId() {
    return this.explicitId || this.generatedId;
  }

  override willUpdate(changed: PropertyValues<this>) {
    const id = this.getAttribute("id");
    if (id) {
      this.explicitId = id;
      this.removeAttribute("id");
    }
    if (changed.has("error") || changed.has("help")) this.description = "";
  }

  override updated(changed: PropertyValues<this>) {
    const note = this.renderRoot.querySelector<HTMLElement>(
      ".ui-field__error, .ui-field__help:not([hidden])",
    );
    const fromDom = note?.textContent?.trim() ?? "";
    const fallback = this.error || this.help;
    const description = fromDom && fromDom !== fallback ? fromDom : "";
    if (description !== this.description) this.description = description;

    if (
      changed.has("error") ||
      changed.has("help") ||
      changed.has("required") ||
      changed.has("hasHelpSlot") ||
      changed.has("description") ||
      changed.has("label")
    ) {
      this.applyControlProps();
    }
  }

  private get describedText() {
    if (this.error) return this.description || this.error;
    if (this.help || this.hasHelpSlot) return this.description || this.help;
    return "";
  }

  private controlElement() {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>("slot:not([name])");
    if (!slot) return null;
    const node = slot.assignedElements({ flatten: true })[0];
    return node instanceof HTMLElement ? node : null;
  }

  private applyControlProps() {
    const control = this.controlElement();
    if (!control) return;

    const props = formFieldControlProps({
      id: this.controlId,
      help: this.help,
      error: this.error,
      required: this.required,
      hasHelpSlot: this.hasHelpSlot,
    });

    control.id = props.id;

    if (props.describedBy) control.setAttribute("described-by", props.describedBy);
    else control.removeAttribute("described-by");

    if ("invalid" in control) {
      (control as HTMLElement & { invalid: boolean }).invalid = props.invalid;
    } else if (props.invalid) control.setAttribute("invalid", "");
    else control.removeAttribute("invalid");

    if ("required" in control) {
      (control as HTMLElement & { required: boolean }).required = props.required;
    } else if (props.required) control.setAttribute("required", "");
    else control.removeAttribute("required");

    if ("description" in control) {
      (control as HTMLElement & { description: string }).description = this.describedText;
    }
  }

  private onLabelSlotChange(event: Event) {
    const slot = event.target;
    if (!(slot instanceof HTMLSlotElement)) return;
    const hasLabelSlot = slotHasContent(slot);
    if (hasLabelSlot === this.hasLabelSlot) return;
    queueMicrotask(() => {
      if (this.hasLabelSlot !== hasLabelSlot) this.hasLabelSlot = hasLabelSlot;
    });
  }

  private onHelpSlotChange(event: Event) {
    const slot = event.target;
    if (!(slot instanceof HTMLSlotElement)) return;
    const hasHelpSlot = slotHasContent(slot);
    if (hasHelpSlot === this.hasHelpSlot) return;
    queueMicrotask(() => {
      if (this.hasHelpSlot !== hasHelpSlot) this.hasHelpSlot = hasHelpSlot;
    });
  }

  private onControlSlotChange() {
    this.applyControlProps();
  }

  override render() {
    const hasError = Boolean(this.error);
    const showLabel = Boolean(this.label) || this.hasLabelSlot;
    const showHelp = !hasError && (Boolean(this.help) || this.hasHelpSlot);

    return html`
      <div class="ui-field ${hasError ? "ui-field--invalid" : ""}">
        <label class="ui-field__label" for=${this.controlId} ?hidden=${!showLabel}>
          <slot name="label" @slotchange=${this.onLabelSlotChange}>${this.label}</slot>
          ${this.required
            ? html`<span class="ui-field__required" aria-hidden="true">*</span>`
            : nothing}
        </label>
        <slot @slotchange=${this.onControlSlotChange}></slot>
        ${hasError
          ? html`<p id=${`${this.controlId}-error`} class="ui-field__error" role="alert">
              <slot name="error">${this.error}</slot>
            </p>`
          : nothing}
        <p id=${`${this.controlId}-help`} class="ui-field__help" ?hidden=${!showHelp}>
          <slot name="help" @slotchange=${this.onHelpSlotChange}>${this.help}</slot>
        </p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-form-field": UiFormField;
  }
}
