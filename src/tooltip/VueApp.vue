<script setup lang="ts">
import "../components/ui-button";
import "../components/ui-tooltip";
</script>

<template>
  <div class="tips">
    <ui-tooltip text="Tooltip on top" position="top">
      <ui-button>Top</ui-button>
    </ui-tooltip>
    <ui-tooltip text="Tooltip on bottom" position="bottom">
      <ui-button>Bottom</ui-button>
    </ui-tooltip>
    <ui-tooltip text="Tooltip on left" position="left">
      <ui-button>Left</ui-button>
    </ui-tooltip>
    <ui-tooltip text="Tooltip on right" position="right">
      <ui-button>Right</ui-button>
    </ui-tooltip>
  </div>
</template>
