<script lang="ts">
  import "../components/ui-button";
  import "../components/ui-dropdown-menu";
  import "../components/ui-dropdown-menu-item";

  let lastSelected = $state("None");
  let controlledOpen = $state(false);

  function onSelect(event: Event) {
    const detail = (event as CustomEvent<{ value: string }>).detail;
    lastSelected = detail?.value || "None";
  }

  function onOpenChange(event: Event) {
    const detail = (event as CustomEvent<{ open: boolean }>).detail;
    if (detail) controlledOpen = detail.open;
  }
</script>

<div class="dropdown-demo">
  <section class="demo-row">
    <h3>Basic</h3>
    <div class="demo-stack">
      <ui-dropdown-menu onselect={onSelect}>
        <ui-button icon-position="end">
          Actions
          <svg slot="icon" viewBox="0 0 16 16" aria-hidden="true">
            <path
              fill="currentColor"
              d="M3.22 5.97a.75.75 0 0 1 1.06 0L8 9.69l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.22 7.03a.75.75 0 0 1 0-1.06Z"
            />
          </svg>
        </ui-button>
        <ui-dropdown-menu-item slot="items">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path
              fill="currentColor"
              d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.921-.92l.93-3.252c.081-.286.235-.547.445-.758l8.61-8.61Zm1.414 1.06a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.262a.25.25 0 0 0 0-.354l-1.086-1.086ZM9.75 4.811 3.992 10.57l-.564 1.973 1.973-.564L10.75 5.75 9.75 4.81Z"
            />
          </svg>
          Edit
        </ui-dropdown-menu-item>
        <ui-dropdown-menu-item slot="items">Duplicate</ui-dropdown-menu-item>
        <ui-dropdown-menu-item slot="items" disabled>Delete</ui-dropdown-menu-item>
        <ui-dropdown-menu-item slot="items">Archive</ui-dropdown-menu-item>
      </ui-dropdown-menu>
      <p class="demo-meta">Selected: {lastSelected}</p>
    </div>
  </section>

  <section class="demo-row">
    <h3>Controlled</h3>
    <div class="demo-stack">
      <ui-button variant="secondary" onclick={() => (controlledOpen = !controlledOpen)}>
        {controlledOpen ? "Close" : "Open"} menu
      </ui-button>
      <ui-dropdown-menu
        open={controlledOpen}
        onopen-change={onOpenChange}
        onselect={onSelect}
      >
        <ui-button>More</ui-button>
        <ui-dropdown-menu-item slot="items">Share</ui-dropdown-menu-item>
        <ui-dropdown-menu-item slot="items">Export</ui-dropdown-menu-item>
        <ui-dropdown-menu-item slot="items">Print</ui-dropdown-menu-item>
      </ui-dropdown-menu>
      <p class="demo-meta">Open: {controlledOpen}</p>
    </div>
  </section>
</div>
