<script setup lang="ts">
import { ref } from "vue";
import "../components/ui-button";
import "../components/ui-dialog";

const open = ref(false);
</script>

<template>
  <ui-button @click="open = true">Open Dialog</ui-button>
  <ui-dialog :open="open" width="24rem" @close="open = false">Dialog content</ui-dialog>
</template>
