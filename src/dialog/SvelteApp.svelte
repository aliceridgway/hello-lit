<script lang="ts">
  import "../components/ui-button";
  import "../components/ui-dialog";

  let open = $state(false);
</script>

<ui-button onclick={() => (open = true)}>Open Dialog</ui-button>
<ui-dialog {open} width="24rem" onclose={() => (open = false)}>Dialog content</ui-dialog>
