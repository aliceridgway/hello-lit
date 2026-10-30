export interface FieldProps {
  /** Visible label text. Omit when providing a custom label via the default slot. */
  label?: string;
  /** Helper copy shown below the control when there is no error. */
  help?: string;
  /** Validation message; when set, the field is marked invalid and help is hidden. */
  error?: string;
  /** Explicit id for the control; generated automatically when omitted. */
  id?: string;
  required?: boolean;
}

/** Props passed to the `#control` slot so the native control can wire a11y correctly. */
export interface FieldControlSlotProps {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
}
