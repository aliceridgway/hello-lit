<script setup lang="ts">
import { ref } from "vue";
import Button from "./components/Button.vue";
import PlusIcon from "./components/PlusIcon.vue";

const vueClicks = ref(0);
const litClicks = ref(0);
const vueDisabledClicks = ref(0);
const litDisabledClicks = ref(0);
const vueLoadingClicks = ref(0);
const litLoadingClicks = ref(0);
const vueSubmitted = ref(false);
const litSubmitted = ref(false);
const vueResets = ref(0);
const litResets = ref(0);
</script>

<template>
  <main class="page">
    <header class="intro">
      <h1>Button, Vue and Lit</h1>
      <p>The same button API, rendered as a Vue component and as a Lit web component.</p>
    </header>

    <div class="columns" aria-hidden="true">
      <span></span>
      <span>Vue</span>
      <span>Lit</span>
    </div>

    <section class="row">
      <h2>Primary</h2>
      <Button variant="primary">Primary</Button>
      <ui-button variant="primary">Primary</ui-button>
    </section>

    <section class="row">
      <h2>Secondary</h2>
      <Button variant="secondary">Secondary</Button>
      <ui-button variant="secondary">Secondary</ui-button>
    </section>

    <section class="row">
      <h2>Ghost</h2>
      <Button variant="ghost">Ghost</Button>
      <ui-button variant="ghost">Ghost</ui-button>
    </section>

    <section class="row">
      <h2>Small</h2>
      <Button size="sm">Small</Button>
      <ui-button size="sm">Small</ui-button>
    </section>

    <section class="row">
      <h2>Medium</h2>
      <Button size="md">Medium</Button>
      <ui-button size="md">Medium</ui-button>
    </section>

    <section class="row">
      <h2>Large</h2>
      <Button size="lg">Large</Button>
      <ui-button size="lg">Large</ui-button>
    </section>

    <section class="row">
      <h2>Disabled</h2>
      <div class="stack">
        <Button disabled @click="vueDisabledClicks += 1">Disabled</Button>
        <p class="meta">Clicks: {{ vueDisabledClicks }}</p>
      </div>
      <div class="stack">
        <ui-button disabled @click="litDisabledClicks += 1">Disabled</ui-button>
        <p class="meta">Clicks: {{ litDisabledClicks }}</p>
      </div>
    </section>

    <section class="row">
      <h2>Loading start</h2>
      <div class="stack">
        <Button loading icon-position="start" @click="vueLoadingClicks += 1">
          <template #icon><PlusIcon /></template>
          Saving
        </Button>
        <p class="meta">Clicks: {{ vueLoadingClicks }}</p>
      </div>
      <div class="stack">
        <ui-button loading icon-position="start" @click="litLoadingClicks += 1">
          <span slot="icon" class="lit-icon"><PlusIcon /></span>
          Saving
        </ui-button>
        <p class="meta">Clicks: {{ litLoadingClicks }}</p>
      </div>
    </section>

    <section class="row">
      <h2>Loading end</h2>
      <Button loading icon-position="end">
        <template #icon><PlusIcon /></template>
        Saving
      </Button>
      <ui-button loading icon-position="end">
        <span slot="icon" class="lit-icon"><PlusIcon /></span>
        Saving
      </ui-button>
    </section>

    <section class="row">
      <h2>Icon start</h2>
      <Button icon-position="start">
        <template #icon><PlusIcon /></template>
        Add
      </Button>
      <ui-button icon-position="start">
        <span slot="icon" class="lit-icon"><PlusIcon /></span>
        Add
      </ui-button>
    </section>

    <section class="row">
      <h2>Icon end</h2>
      <Button icon-position="end">
        <template #icon><PlusIcon /></template>
        Add
      </Button>
      <ui-button icon-position="end">
        <span slot="icon" class="lit-icon"><PlusIcon /></span>
        Add
      </ui-button>
    </section>

    <section class="row">
      <h2>Click</h2>
      <Button @click="vueClicks += 1">Clicked {{ vueClicks }}</Button>
      <ui-button @click="litClicks += 1">Clicked {{ litClicks }}</ui-button>
    </section>

    <section class="row">
      <h2>Submit</h2>
      <form class="stack" @submit.prevent="vueSubmitted = true">
        <Button type="submit">Submit</Button>
        <p class="meta">{{ vueSubmitted ? "Submitted" : "Not submitted" }}</p>
      </form>
      <form class="stack" @submit.prevent="litSubmitted = true">
        <ui-button type="submit">Submit</ui-button>
        <p class="meta">{{ litSubmitted ? "Submitted" : "Not submitted" }}</p>
      </form>
    </section>

    <section class="row">
      <h2>Reset</h2>
      <form class="stack" @reset="vueResets += 1">
        <input aria-label="Vue name" value="Ada" />
        <Button type="reset">Reset</Button>
        <p class="meta">Resets: {{ vueResets }}</p>
      </form>
      <form class="stack" @reset="litResets += 1">
        <input aria-label="Lit name" value="Ada" />
        <ui-button type="reset">Reset</ui-button>
        <p class="meta">Resets: {{ litResets }}</p>
      </form>
    </section>
  </main>
</template>

<style scoped>
.page {
  max-width: 52rem;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
}

.intro h1 {
  margin: 0 0 0.35rem;
  font-size: 1.75rem;
  line-height: 1.2;
}

.intro p {
  margin: 0 0 1.5rem;
  color: #4b5563;
}

.columns,
.row {
  display: grid;
  grid-template-columns: 8.5rem 1fr 1fr;
  gap: 1rem;
  align-items: center;
}

.columns {
  padding-bottom: 0.5rem;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.row {
  justify-items: start;
  padding: 0.85rem 0;
  border-top: 1px solid #e5e7eb;
}

.row h2 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.stack {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.meta {
  margin: 0;
  color: #4b5563;
  font-size: 0.875rem;
}

.stack input {
  width: 7rem;
  padding: 0.4rem 0.55rem;
  border: 1px solid #d1d5db;
  border-radius: var(--ui-radius-md);
  font: inherit;
}

.lit-icon {
  display: contents;
}
</style>
