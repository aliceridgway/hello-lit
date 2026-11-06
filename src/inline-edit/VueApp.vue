<script setup lang="ts">
import { ref, computed } from "vue";
import "../components/ui-inline-edit";
import "../components/ui-form-field";
import "../components/ui-select";
import "../components/ui-text-input";
import "../components/ui-button";

const statuses = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const status = ref("");
const statusDraft = ref("");
const owner = ref("");
const ownerDraft = ref("");

const statusLabel = computed(() => statuses.find((item) => item.value === status.value)?.label ?? "");

function fieldValue(event: Event) {
  const current = event.currentTarget;
  const field = current instanceof HTMLElement && "value" in current ? current : event.target;
  if (!(field instanceof HTMLElement) || !("value" in field)) return "";
  return String(field.value);
}

function onStatusInput(event: Event) {
  statusDraft.value = fieldValue(event);
}

function onStatusSubmit(event: Event) {
  const form = event.currentTarget;
  if (!(form instanceof HTMLFormElement)) return;
  status.value = String(new FormData(form).get("status") ?? "");
}

function onStatusClose() {
  statusDraft.value = status.value;
}

function onStatusClear() {
  status.value = "";
  statusDraft.value = "";
}

function onOwnerInput(event: Event) {
  ownerDraft.value = fieldValue(event);
}

function onOwnerSubmit(event: Event) {
  const form = event.currentTarget;
  if (!(form instanceof HTMLFormElement)) return;
  owner.value = String(new FormData(form).get("owner") ?? "");
}

function onOwnerClose() {
  ownerDraft.value = owner.value;
}

function onOwnerClear() {
  owner.value = "";
  ownerDraft.value = "";
}
</script>

<template>
  <div class="inline-edit-demo">
    <section aria-labelledby="vue-update-heading">
      <h3 id="vue-update-heading">Update</h3>
      <ui-inline-edit label="Status" @close="onStatusClose" @clear="onStatusClear">
        <span v-if="statusLabel" slot="value">{{ statusLabel }}</span>
        <form slot="content" class="popover-form" @submit="onStatusSubmit">
          <ui-form-field label="Status">
            <ui-select name="status" :value="statusDraft" @input="onStatusInput">
              <option slot="options" value="">------</option>
              <option v-for="item in statuses" :key="item.value" slot="options" :value="item.value">
                {{ item.label }}
              </option>
            </ui-select>
          </ui-form-field>
          <div class="popover-form__actions">
            <ui-button type="submit">Apply</ui-button>
            <ui-button type="button" variant="secondary" data-popover-close>Cancel</ui-button>
          </div>
        </form>
      </ui-inline-edit>
    </section>

    <section aria-labelledby="vue-filter-heading">
      <h3 id="vue-filter-heading">Filter</h3>
      <ui-inline-edit label="Owner" placeholder="Anyone" @close="onOwnerClose" @clear="onOwnerClear">
        <span v-if="owner" slot="value">{{ owner }}</span>
        <form slot="content" class="popover-form" @submit="onOwnerSubmit">
          <ui-form-field label="Owner">
            <ui-text-input name="owner" :value="ownerDraft" @input="onOwnerInput"></ui-text-input>
          </ui-form-field>
          <div class="popover-form__actions">
            <ui-button type="submit">Apply</ui-button>
            <ui-button type="button" variant="secondary" data-popover-close>Cancel</ui-button>
          </div>
        </form>
      </ui-inline-edit>
    </section>
  </div>
</template>
