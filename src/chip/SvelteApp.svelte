<script lang="ts">
  import "../components/ui-chip";
  import "../components/ui-chip-group";

  type Chip = { value: string; label: string; removable?: boolean };

  let chips = $state<Chip[]>([
    { value: "design", label: "Design" },
    { value: "research", label: "Research" },
    { value: "engineering", label: "Engineering" },
    { value: "required", label: "Required", removable: false },
  ]);
  let removed = $state("None");

  function onRemove(event: Event) {
    const detail = (event as CustomEvent<{ value: string }>).detail;
    const value = detail?.value ?? "";
    removed = value || "None";
    chips = chips.filter((chip) => chip.value !== value);
  }
</script>

<div class="chip-demo">
  <ui-chip-group onremove={onRemove}>
    {#each chips as chip (chip.value)}
      <ui-chip value={chip.value} removable={chip.removable !== false}>{chip.label}</ui-chip>
    {/each}
  </ui-chip-group>
  <p class="demo-meta">Removed: {removed}</p>
</div>
