<script setup lang="ts">
import { ref } from "vue";
import "../components/ui-form-field";
import "../components/ui-text-input";
import "../components/ui-number-input";
import "../components/ui-select";
import "../components/ui-multiselect";

const name = ref("");
const duration = ref("");
const fruit = ref("");
const fruits = ref<string[]>([]);

function onNameInput(event: Event) {
  const current = event.currentTarget;
  const field = current instanceof HTMLElement && "value" in current ? current : event.target;
  if (!(field instanceof HTMLElement) || !("value" in field)) return;
  name.value = String(field.value);
}

function onDurationInput(event: Event) {
  const current = event.currentTarget;
  const field = current instanceof HTMLElement && "value" in current ? current : event.target;
  if (!(field instanceof HTMLElement) || !("value" in field)) return;
  duration.value = String(field.value);
}

function onFruitInput(event: Event) {
  const current = event.currentTarget;
  const field = current instanceof HTMLElement && "value" in current ? current : event.target;
  if (!(field instanceof HTMLElement) || !("value" in field)) return;
  fruit.value = String(field.value);
}

function onFruitsInput(event: Event) {
  const current = event.currentTarget;
  const field = current instanceof HTMLElement && "value" in current ? current : event.target;
  if (!(field instanceof HTMLElement) || !("value" in field) || !Array.isArray(field.value)) return;
  fruits.value = field.value.map(String);
}
</script>

<template>
  <div class="form-demo">
    <section class="form-demo__section" aria-labelledby="text-heading">
      <h3 id="text-heading">Text</h3>
      <div class="form-demo__live">
        <ui-form-field label="Display name" help="This is how your name appears.">
          <ui-text-input :value="name" @input="onNameInput"></ui-text-input>
        </ui-form-field>
        <p class="demo-meta">Current value: {{ name }}</p>
      </div>
      <ui-form-field label="Email" required>
        <ui-text-input placeholder="name@example.com"></ui-text-input>
      </ui-form-field>
      <ui-form-field label="Username" error="That username is taken.">
        <ui-text-input value="admin"></ui-text-input>
      </ui-form-field>
      <ui-form-field label="Permalink" help="Generated from your display name.">
        <ui-text-input value="foo-bar" readonly></ui-text-input>
      </ui-form-field>
      <ui-form-field label="Account id">
        <ui-text-input value="usr_2048" disabled></ui-text-input>
      </ui-form-field>
    </section>

    <section class="form-demo__section" aria-labelledby="number-heading">
      <h3 id="number-heading">Number</h3>
      <div class="form-demo__live">
        <ui-form-field label="Duration" help="How long it runs.">
          <ui-number-input
            :value="duration"
            min="0"
            step="1"
            unit="minutes"
            @input="onDurationInput"
          ></ui-number-input>
        </ui-form-field>
        <p class="demo-meta">Current value: {{ duration }}</p>
      </div>
      <ui-form-field label="Quantity" required>
        <ui-number-input min="1"></ui-number-input>
      </ui-form-field>
      <ui-form-field label="Seats" error="Enter at least 1.">
        <ui-number-input value="0" min="1"></ui-number-input>
      </ui-form-field>
      <ui-form-field label="Timeout" help="Applied on the server.">
        <ui-number-input value="30" unit="seconds" readonly></ui-number-input>
      </ui-form-field>
      <ui-form-field label="Retry count">
        <ui-number-input value="3" disabled></ui-number-input>
      </ui-form-field>
    </section>

    <section class="form-demo__section" aria-labelledby="select-heading">
      <h3 id="select-heading">Select</h3>
      <div class="form-demo__live">
        <ui-form-field label="Favorite fruit" help="Used on your profile.">
          <ui-select :value="fruit" @input="onFruitInput">
            <option slot="options" value="">Select a fruit</option>
            <option slot="options" value="apple">Apple</option>
            <option slot="options" value="banana">Banana</option>
            <option slot="options" value="cherry">Cherry</option>
            <option slot="options" value="durian">Durian</option>
          </ui-select>
        </ui-form-field>
        <p class="demo-meta">Current value: {{ fruit }}</p>
      </div>
      <ui-form-field label="Country" required>
        <ui-select>
          <option slot="options" value="">Select a country</option>
          <option slot="options" value="uk">United Kingdom</option>
          <option slot="options" value="us">United States</option>
          <option slot="options" value="ca">Canada</option>
        </ui-select>
      </ui-form-field>
      <ui-form-field label="Plan" error="That plan is no longer available.">
        <ui-select value="pro">
          <option slot="options" value="free">Free</option>
          <option slot="options" value="pro">Pro</option>
          <option slot="options" value="enterprise">Enterprise</option>
        </ui-select>
      </ui-form-field>
      <ui-form-field label="Region">
        <ui-select value="eu" disabled>
          <option slot="options" value="us">US</option>
          <option slot="options" value="eu">EU</option>
          <option slot="options" value="ap">APAC</option>
        </ui-select>
      </ui-form-field>
    </section>

    <section class="form-demo__section" aria-labelledby="multiselect-heading">
      <h3 id="multiselect-heading">Multiselect</h3>
      <div class="form-demo__live">
        <ui-form-field label="Favorite fruits" help="Type to filter the list.">
          <ui-multiselect :value.prop="fruits" placeholder="Select fruits" searchable @input="onFruitsInput">
            <option slot="options" value="apple">Apple</option>
            <option slot="options" value="apricot">Apricot</option>
            <option slot="options" value="banana">Banana</option>
            <option slot="options" value="blackberry">Blackberry</option>
            <option slot="options" value="cherry">Cherry</option>
            <option slot="options" value="durian">Durian</option>
            <option slot="options" value="grape">Grape</option>
            <option slot="options" value="grapefruit">Grapefruit</option>
            <option slot="options" value="lemon">Lemon</option>
            <option slot="options" value="mango">Mango</option>
            <option slot="options" value="orange">Orange</option>
            <option slot="options" value="peach">Peach</option>
            <option slot="options" value="pear">Pear</option>
            <option slot="options" value="plum">Plum</option>
          </ui-multiselect>
        </ui-form-field>
        <p class="demo-meta">Current value: {{ fruits.join(", ") }}</p>
      </div>
      <ui-form-field label="Countries" required>
        <ui-multiselect placeholder="Select countries">
          <option slot="options" value="uk">United Kingdom</option>
          <option slot="options" value="us">United States</option>
          <option slot="options" value="ca">Canada</option>
        </ui-multiselect>
      </ui-form-field>
      <ui-form-field label="Plans" error="That plan is no longer available.">
        <ui-multiselect :value.prop="['pro']">
          <option slot="options" value="free">Free</option>
          <option slot="options" value="pro">Pro</option>
          <option slot="options" value="enterprise">Enterprise</option>
        </ui-multiselect>
      </ui-form-field>
      <ui-form-field label="Regions">
        <ui-multiselect :value.prop="['eu']" disabled>
          <option slot="options" value="us">US</option>
          <option slot="options" value="eu">EU</option>
          <option slot="options" value="ap">APAC</option>
        </ui-multiselect>
      </ui-form-field>
    </section>
  </div>
</template>
