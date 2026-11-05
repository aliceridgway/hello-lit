import { LitElement, html, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import type { FieldProps } from "../../source-components/Field.types";
import {
  formFieldControlProps,
  formFieldStyles,
  renderFormField,
  slotHasContent,
} from "./form-field";
import { UiTextInput } from "./ui-text-input";

let nextFieldId = 0;

/**
 * `ui-form-field` and `ui-text-input` on one tag.
 * The demos use the split pair. This is the combined alternative.
 * When `error` is set, help is hidden.
 *
 * Slots: `label`, `help`, `error`. The text control is internal.
 * An `id` on the host is removed and copied onto the inner control,
 * which also receives `described-by`, `description`, `invalid`, and `required`.
 * `input` bubbles from the inner control after `value` updates.
 * No public methods.
 *
 * @example
 * <ui-form-field-text label="Email" name="email" required></ui-form-field-text>
 */
@customElement("ui-form-field-text")
export class UiFormFieldText extends LitElement implements FieldProps {
  static override styles = formFieldStyles;

  @property({ type: String })
  label = "";

  @property({ type: String })
  help = "";

  @property({ type: String })
  error = "";

  @property({ type: Boolean, reflect: true })
  required = false;

  @property({ type: String })
  value = "";

  @property({ type: String })
  placeholder = "";

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: String })
  name = "";

  @property({ type: String })
  type = "text";

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

  private get describedText() {
    if (this.error) return this.description || this.error;
    if (this.help || this.hasHelpSlot) return this.description || this.help;
    return "";
  }

  override updated() {
    const note = this.renderRoot.querySelector<HTMLElement>(
      ".ui-field__error, .ui-field__help:not([hidden])",
    );
    const fromDom = note?.textContent?.trim() ?? "";
    const fallback = this.error || this.help;
    const description = fromDom && fromDom !== fallback ? fromDom : "";
    if (description !== this.description) this.description = description;
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

  private onInput(event: Event) {
    const input = event.currentTarget;
    if (!(input instanceof UiTextInput) || input.value === this.value) return;
    this.value = input.value;
  }

  override render() {
    const controlProps = formFieldControlProps({
      id: this.controlId,
      help: this.help,
      error: this.error,
      required: this.required,
      hasHelpSlot: this.hasHelpSlot,
    });

    return renderFormField({
      label: this.label,
      help: this.help,
      error: this.error,
      id: this.controlId,
      required: this.required,
      hasLabelSlot: this.hasLabelSlot,
      hasHelpSlot: this.hasHelpSlot,
      onLabelSlotChange: this.onLabelSlotChange,
      onHelpSlotChange: this.onHelpSlotChange,
      control: html`
        <ui-text-input
          id=${controlProps.id}
          described-by=${ifDefined(controlProps.describedBy)}
          .value=${this.value}
          .placeholder=${this.placeholder}
          .name=${this.name}
          .type=${this.type}
          .description=${this.describedText}
          ?disabled=${this.disabled}
          ?required=${controlProps.required}
          ?invalid=${controlProps.invalid}
          @input=${this.onInput}
        ></ui-text-input>
      `,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-form-field-text": UiFormFieldText;
  }
}
