import { css, html, nothing, type TemplateResult } from "lit";
import { classMap } from "lit/directives/class-map.js";
import type { FieldControlSlotProps } from "../../source-components/Field.types";

export const formFieldStyles = css`
  :host {
    display: block;
    width: 100%;
  }

  .ui-field {
    display: flex;
    flex-direction: column;
    gap: var(--ui-space-1);
    width: 100%;
    font-family: var(--ui-font-sans);
    line-height: var(--ui-line-height);
  }

  .ui-field__label {
    display: inline-flex;
    align-items: baseline;
    gap: var(--ui-space-1);
    color: var(--ui-color-fg);
    font-size: var(--ui-font-size-sm);
    font-weight: var(--ui-font-weight-medium);
  }

  .ui-field__label[hidden],
  .ui-field__help[hidden] {
    display: none;
  }

  .ui-field__required {
    color: var(--ui-color-danger);
  }

  .ui-field__help,
  .ui-field__error {
    margin: 0;
    font-size: var(--ui-font-size-sm);
  }

  .ui-field__help {
    color: var(--ui-color-fg-muted);
  }

  .ui-field__error {
    color: var(--ui-color-danger);
  }
`;

export interface FormFieldChrome {
  label?: string;
  help?: string;
  error?: string;
  id: string;
  required: boolean;
  hasLabelSlot: boolean;
  hasHelpSlot: boolean;
  control: TemplateResult;
  onLabelSlotChange: (event: Event) => void;
  onHelpSlotChange: (event: Event) => void;
}

export function slotHasContent(slot: HTMLSlotElement) {
  return slot.assignedNodes({ flatten: true }).some((node) => {
    if (node.nodeType === Node.TEXT_NODE) return Boolean(node.textContent?.trim());
    return node.nodeType === Node.ELEMENT_NODE;
  });
}

export function formFieldControlProps(
  field: Pick<FormFieldChrome, "id" | "help" | "error" | "required" | "hasHelpSlot">,
): FieldControlSlotProps {
  const hasError = Boolean(field.error);
  const hasHelp = Boolean(field.help) || field.hasHelpSlot;
  return {
    id: field.id,
    describedBy: hasError ? `${field.id}-error` : hasHelp ? `${field.id}-help` : undefined,
    invalid: hasError,
    required: field.required,
  };
}

export function renderFormField(field: FormFieldChrome) {
  const hasError = Boolean(field.error);
  const showLabel = Boolean(field.label) || field.hasLabelSlot;
  const showHelp = !hasError && (Boolean(field.help) || field.hasHelpSlot);

  return html`
    <div
      class=${classMap({
        "ui-field": true,
        "ui-field--invalid": hasError,
      })}
    >
      <label class="ui-field__label" for=${field.id} ?hidden=${!showLabel}>
        <slot @slotchange=${field.onLabelSlotChange}>${field.label ?? ""}</slot>
        ${field.required
          ? html`<span class="ui-field__required" aria-hidden="true">*</span>`
          : nothing}
      </label>
      ${field.control}
      ${hasError
        ? html`<p id=${`${field.id}-error`} class="ui-field__error" role="alert">
            <slot name="error">${field.error}</slot>
          </p>`
        : nothing}
      <p id=${`${field.id}-help`} class="ui-field__help" ?hidden=${!showHelp}>
        <slot name="help" @slotchange=${field.onHelpSlotChange}>${field.help ?? ""}</slot>
      </p>
    </div>
  `;
}
