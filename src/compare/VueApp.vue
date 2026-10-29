<script setup lang="ts">
import { ref } from "vue";
import PlusIcon from "../components/PlusIcon.vue";
import "../components/ui-button";

const clicks = ref(0);
const disabledClicks = ref(0);
const loadingClicks = ref(0);
const submitted = ref(false);
const resets = ref(0);
</script>

<template>
  <div>
    <section class="demo-row">
      <h3>Primary</h3>
      <ui-button variant="primary">Primary</ui-button>
    </section>

    <section class="demo-row">
      <h3>Secondary</h3>
      <ui-button variant="secondary">Secondary</ui-button>
    </section>

    <section class="demo-row">
      <h3>Ghost</h3>
      <ui-button variant="ghost">Ghost</ui-button>
    </section>

    <section class="demo-row">
      <h3>Small</h3>
      <ui-button size="sm">Small</ui-button>
    </section>

    <section class="demo-row">
      <h3>Medium</h3>
      <ui-button size="md">Medium</ui-button>
    </section>

    <section class="demo-row">
      <h3>Large</h3>
      <ui-button size="lg">Large</ui-button>
    </section>

    <section class="demo-row">
      <h3>Disabled</h3>
      <div class="demo-stack">
        <ui-button disabled @click="disabledClicks += 1">Disabled</ui-button>
        <p class="demo-meta">Clicks: {{ disabledClicks }}</p>
      </div>
    </section>

    <section class="demo-row">
      <h3>Loading start</h3>
      <div class="demo-stack">
        <ui-button loading icon-position="start" @click="loadingClicks += 1">
          <span slot="icon" class="lit-icon"><PlusIcon /></span>
          Saving
        </ui-button>
        <p class="demo-meta">Clicks: {{ loadingClicks }}</p>
      </div>
    </section>

    <section class="demo-row">
      <h3>Loading end</h3>
      <ui-button loading icon-position="end">
        <span slot="icon" class="lit-icon"><PlusIcon /></span>
        Saving
      </ui-button>
    </section>

    <section class="demo-row">
      <h3>Icon start</h3>
      <ui-button icon-position="start">
        <span slot="icon" class="lit-icon"><PlusIcon /></span>
        Add
      </ui-button>
    </section>

    <section class="demo-row">
      <h3>Icon end</h3>
      <ui-button icon-position="end">
        <span slot="icon" class="lit-icon"><PlusIcon /></span>
        Add
      </ui-button>
    </section>

    <section class="demo-row">
      <h3>Click</h3>
      <ui-button @click="clicks += 1">Clicked {{ clicks }}</ui-button>
    </section>

    <section class="demo-row">
      <h3>Submit</h3>
      <form class="demo-stack" @submit.prevent="submitted = true">
        <ui-button type="submit">Submit</ui-button>
        <p class="demo-meta">{{ submitted ? "Submitted" : "Not submitted" }}</p>
      </form>
    </section>

    <section class="demo-row">
      <h3>Reset</h3>
      <form class="demo-stack" @reset="resets += 1">
        <input aria-label="Lit name" value="Ada" />
        <ui-button type="reset">Reset</ui-button>
        <p class="demo-meta">Resets: {{ resets }}</p>
      </form>
    </section>
  </div>
</template>

<style scoped>
.lit-icon {
  display: contents;
}
</style>
