<script setup lang="ts">
import type { ButtonProps } from "./Button.types";

withDefaults(defineProps<ButtonProps>(), {
  variant: "primary",
  size: "md",
  disabled: false,
  type: "button",
  iconPosition: "start",
  loading: false,
});

defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <button
    class="ui-button"
    :class="[`ui-button--${variant}`, `ui-button--${size}`]"
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    @click="$emit('click', $event)"
  >
    <span
      v-if="loading && iconPosition === 'start'"
      class="ui-button__spinner"
      aria-hidden="true"
    />
    <span
      v-else-if="$slots.icon && iconPosition === 'start'"
      class="ui-button__icon"
      aria-hidden="true"
    >
      <slot name="icon" />
    </span>
    <slot />
    <span v-if="loading && iconPosition === 'end'" class="ui-button__spinner" aria-hidden="true" />
    <span
      v-else-if="$slots.icon && iconPosition === 'end'"
      class="ui-button__icon"
      aria-hidden="true"
    >
      <slot name="icon" />
    </span>
  </button>
</template>

<style scoped>
.ui-button {
  display: inline-flex;
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

.ui-button__icon :deep(svg) {
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
</style>
