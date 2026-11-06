<script setup lang="ts">
import { ref } from "vue";
import "../components/ui-chip";
import "../components/ui-chip-group";

type Chip = { value: string; label: string; removable?: boolean };

const chips = ref<Chip[]>([
  { value: "design", label: "Design" },
  { value: "research", label: "Research" },
  { value: "engineering", label: "Engineering" },
  { value: "required", label: "Required", removable: false },
]);
const removed = ref("None");

function onRemove(event: Event) {
  const detail = (event as CustomEvent<{ value: string }>).detail;
  const value = detail?.value ?? "";
  removed.value = value || "None";
  chips.value = chips.value.filter((chip) => chip.value !== value);
}
</script>

<template>
  <div class="chip-demo">
    <ui-chip-group @remove="onRemove">
      <ui-chip
        v-for="chip in chips"
        :key="chip.value"
        :value="chip.value"
        :removable="chip.removable !== false"
      >
        {{ chip.label }}
      </ui-chip>
    </ui-chip-group>
    <p class="demo-meta">Removed: {{ removed }}</p>
  </div>
</template>
