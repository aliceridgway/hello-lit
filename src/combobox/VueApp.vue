<script setup lang="ts">
import { computed, ref } from "vue";
import "../components/ui-combobox";
import "../components/ui-form-field";

const fruits = [
  { value: "apple", label: "Apple", help: "A crisp fruit" },
  { value: "apricot", label: "Apricot", help: "A soft stone fruit" },
  { value: "banana", label: "Banana", help: "A sweet tropical fruit" },
  { value: "cherry", label: "Cherry", help: "A tart stone fruit" },
  { value: "durian", label: "Durian", help: "A pungent fruit" },
];

const fruit = ref("");
const restricted = ref("");

function fieldValue(event: Event) {
  const current = event.currentTarget;
  const field = current instanceof HTMLElement && "value" in current ? current : event.target;
  if (!(field instanceof HTMLElement) || !("value" in field)) return null;
  return String(field.value);
}

function onFruitInput(event: Event) {
  const value = fieldValue(event);
  if (value === null) return;
  fruit.value = value;
}

function onRestrictedInput(event: Event) {
  const value = fieldValue(event);
  if (value === null) return;
  restricted.value = value;
}

function matching(query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return fruits;
  return fruits.filter((item) =>
    [item.value, item.label, item.help].some((part) => part.toLowerCase().includes(needle)),
  );
}

const fruitOptions = computed(() => matching(fruit.value));
const restrictedOptions = computed(() => matching(restricted.value));
const restrictedError = computed(() =>
  restricted.value !== "" && !fruits.some((item) => item.value === restricted.value)
    ? "Choose a fruit from the list."
    : "",
);
</script>

<template>
  <div class="form-demo">
    <section class="form-demo__section" aria-labelledby="any-heading">
      <h3 id="any-heading">Any value</h3>
      <div class="form-demo__live">
        <ui-form-field
          label="Favorite fruit"
          help="Any string is kept. The list matches the id, label, and help text."
        >
          <ui-combobox :value="fruit" placeholder="Type a fruit" @input="onFruitInput">
            <ui-combobox-option
              v-for="item in fruitOptions"
              :key="item.value"
              slot="options"
              :value="item.value"
              :label="item.label"
            >
              <span class="combobox-option__title">{{ item.label }}</span>
              <span class="combobox-option__help">{{ item.help }}</span>
            </ui-combobox-option>
          </ui-combobox>
        </ui-form-field>
        <p class="demo-meta">Current value: {{ fruit }}</p>
      </div>
    </section>

    <section class="form-demo__section" aria-labelledby="known-heading">
      <h3 id="known-heading">Known values only</h3>
      <div class="form-demo__live">
        <ui-form-field label="Stocked fruit" help="Only a known id is accepted." :error="restrictedError">
          <ui-combobox :value="restricted" placeholder="Type a fruit" @input="onRestrictedInput">
            <ui-combobox-option
              v-for="item in restrictedOptions"
              :key="item.value"
              slot="options"
              :value="item.value"
              :label="item.label"
            >
              <span class="combobox-option__title">{{ item.label }}</span>
              <span class="combobox-option__help">{{ item.help }}</span>
            </ui-combobox-option>
          </ui-combobox>
        </ui-form-field>
        <p class="demo-meta">Current value: {{ restricted }}</p>
      </div>
    </section>
  </div>
</template>
