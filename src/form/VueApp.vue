<script setup lang="ts">
import { ref } from "vue";
import "../components/ui-form-field-text";
import "../components/ui-form-field-select";

const name = ref("");
const fruit = ref("");

function onNameInput(event: Event) {
  const current = event.currentTarget;
  const field = current instanceof HTMLElement && "value" in current ? current : event.target;
  if (!(field instanceof HTMLElement) || !("value" in field)) return;
  name.value = String(field.value);
}

function onFruitInput(event: Event) {
  const current = event.currentTarget;
  const field = current instanceof HTMLElement && "value" in current ? current : event.target;
  if (!(field instanceof HTMLElement) || !("value" in field)) return;
  fruit.value = String(field.value);
}
</script>

<template>
  <div class="form-demo">
    <section class="form-demo__section" aria-labelledby="text-heading">
      <h3 id="text-heading">Text</h3>
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
    </section>

    <section class="form-demo__section" aria-labelledby="select-heading">
      <h3 id="select-heading">Select</h3>
      <div class="form-demo__live">
        <ui-form-field-select
          label="Favorite fruit"
          help="Used on your profile."
          :value="fruit"
          @input="onFruitInput"
        >
          <option slot="options" value="">Select a fruit</option>
          <option slot="options" value="apple">Apple</option>
          <option slot="options" value="banana">Banana</option>
          <option slot="options" value="cherry">Cherry</option>
          <option slot="options" value="durian">Durian</option>
        </ui-form-field-select>
        <p class="demo-meta">Current value: {{ fruit }}</p>
      </div>
      <ui-form-field-select label="Country" required>
        <option slot="options" value="">Select a country</option>
        <option slot="options" value="uk">United Kingdom</option>
        <option slot="options" value="us">United States</option>
        <option slot="options" value="ca">Canada</option>
      </ui-form-field-select>
      <ui-form-field-select label="Plan" error="That plan is no longer available." value="pro">
        <option slot="options" value="free">Free</option>
        <option slot="options" value="pro">Pro</option>
        <option slot="options" value="enterprise">Enterprise</option>
      </ui-form-field-select>
      <ui-form-field-select label="Region" value="eu" disabled>
        <option slot="options" value="us">US</option>
        <option slot="options" value="eu">EU</option>
        <option slot="options" value="ap">APAC</option>
      </ui-form-field-select>
    </section>
  </div>
</template>
