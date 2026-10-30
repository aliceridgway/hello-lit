<script setup lang="ts">
import { computed, useId, useSlots } from "vue";
import type { FieldControlSlotProps, FieldProps } from "./Field.types";

const props = withDefaults(defineProps<FieldProps>(), {
  required: false,
});

const slots = useSlots();
const generatedId = useId();
const controlId = computed(() => props.id ?? generatedId);
const helpId = computed(() => `${controlId.value}-help`);
const errorId = computed(() => `${controlId.value}-error`);

const hasError = computed(() => Boolean(props.error));
const hasHelp = computed(() => Boolean(props.help) || Boolean(slots.help));
const describedBy = computed(() => {
  if (hasError.value) return errorId.value;
  if (hasHelp.value) return helpId.value;
  return undefined;
});

const controlSlotProps = computed((): FieldControlSlotProps => ({
  id: controlId.value,
  describedBy: describedBy.value,
  invalid: hasError.value,
  required: props.required,
}));
</script>

<template>
  <div class="ui-field" :class="{ 'ui-field--invalid': hasError }">
    <label v-if="label || $slots.default" class="ui-field__label" :for="controlId">
      <slot>{{ label }}</slot>
      <span v-if="required" class="ui-field__required" aria-hidden="true">*</span>
    </label>

    <slot name="control" v-bind="controlSlotProps" />

    <p v-if="hasError" :id="errorId" class="ui-field__error" role="alert">
      <slot name="error">{{ error }}</slot>
    </p>
    <p v-else-if="hasHelp" :id="helpId" class="ui-field__help">
      <slot name="help">{{ help }}</slot>
    </p>
  </div>
</template>

<style scoped>
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
</style>

<!-- Unscoped so TextField/TextArea slot controls pick up shared chrome. -->
<style>
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

.ui-field--invalid .ui-field__control {
  border-color: var(--ui-field-border-invalid);
}

.ui-field--invalid .ui-field__control:focus {
  border-color: var(--ui-field-border-invalid);
  box-shadow: 0 0 0 3px var(--ui-field-focus-ring-invalid);
}

@media (forced-colors: active) {
  .ui-field__control:focus {
    outline: 2px solid Highlight;
    outline-offset: 2px;
    box-shadow: none;
  }

  .ui-field--invalid .ui-field__control {
    border-color: Mark;
  }
}
</style>
