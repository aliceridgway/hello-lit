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
import { UiSelect } from "./ui-select";

let nextFieldId = 0;

/**
 * `ui-form-field` and `ui-select` on one tag.
 * The demos use the split pair. This is the combined alternative.
 * When `error` is set, help is hidden.
 *
 * Slots: `label`, `help`, `error`, and `options` (forwarded to the inner select).
 * An `id` on the host is removed and copied onto the inner control,
 * which also receives `described-by`, `description`, `invalid`, and `required`.
 * `input` and `change` bubble from the inner control after `value` updates.
 * No public methods.
 *
 * @example
 * <ui-form-field-select label="Fruit" name="fruit">
 *   <option slot="options" value="apple">Apple</option>
 * </ui-form-field-select>
 */
@customElement("ui-form-field-select")
export class UiFormFieldSelect extends LitElement implements FieldProps {
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

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: String })
  name = "";

  @state()
  private hasLabelSlot = false;

  @state()
  private hasHelpSlot = false;

  @state()
  private description = "";

  private readonly generatedId = `ui-field-select-${++nextFieldId}`;
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
    const select = event.currentTarget;
    if (!(select instanceof UiSelect) || select.value === this.value) return;
    this.value = select.value;
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
        <ui-select
          id=${controlProps.id}
          described-by=${ifDefined(controlProps.describedBy)}
          .value=${this.value}
          .name=${this.name}
          .description=${this.describedText}
          ?disabled=${this.disabled}
          ?required=${controlProps.required}
          ?invalid=${controlProps.invalid}
          @input=${this.onInput}
        >
          <slot name="options" slot="options"></slot>
        </ui-select>
      `,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-form-field-select": UiFormFieldSelect;
  }
}
