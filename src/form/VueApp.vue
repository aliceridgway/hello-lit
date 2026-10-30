<script setup lang="ts">
import { ref } from "vue";
import "../components/ui-form-field-text";

const name = ref("");

function onNameInput(event: Event) {
  const current = event.currentTarget;
  const field = current instanceof HTMLElement && "value" in current ? current : event.target;
  if (!(field instanceof HTMLElement) || !("value" in field)) return;
  name.value = String(field.value);
}
</script>

<template>
  <div class="form-demo">
    <div class="form-demo__live">
      <ui-form-field-text
        label="Display name"
        help="This is how your name appears."
        :value="name"
        @input="onNameInput"
      ></ui-form-field-text>
      <p class="demo-meta">Current value: {{ name }}</p>
    </div>
    <ui-form-field-text label="Email" placeholder="name@example.com" required></ui-form-field-text>
    <ui-form-field-text
      label="Username"
      error="That username is taken."
      value="admin"
    ></ui-form-field-text>
    <ui-form-field-text label="Account id" value="usr_2048" disabled></ui-form-field-text>
  </div>
</template>
