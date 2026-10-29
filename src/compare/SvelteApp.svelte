<script lang="ts">
  import "../components/ui-button";

  let clicks = $state(0);
  let disabledClicks = $state(0);
  let loadingClicks = $state(0);
  let submitted = $state(false);
  let resets = $state(0);
</script>

{#snippet plusIcon()}
  <svg viewBox="0 0 16 16" width="100%" height="100%" aria-hidden="true">
    <path
      fill="currentColor"
      d="M8 1.5a.75.75 0 0 1 .75.75v5h5a.75.75 0 0 1 0 1.5h-5v5a.75.75 0 0 1-1.5 0v-5h-5a.75.75 0 0 1 0-1.5h5v-5A.75.75 0 0 1 8 1.5Z"
    />
  </svg>
{/snippet}

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
      <ui-button disabled={true} onclick={() => (disabledClicks += 1)}>Disabled</ui-button>
      <p class="demo-meta">Clicks: {disabledClicks}</p>
    </div>
  </section>

  <section class="demo-row">
    <h3>Loading start</h3>
    <div class="demo-stack">
      <ui-button loading={true} icon-position="start" onclick={() => (loadingClicks += 1)}>
        <span slot="icon" class="lit-icon">{@render plusIcon()}</span>
        Saving
      </ui-button>
      <p class="demo-meta">Clicks: {loadingClicks}</p>
    </div>
  </section>

  <section class="demo-row">
    <h3>Loading end</h3>
    <ui-button loading={true} icon-position="end">
      <span slot="icon" class="lit-icon">{@render plusIcon()}</span>
      Saving
    </ui-button>
  </section>

  <section class="demo-row">
    <h3>Icon start</h3>
    <ui-button icon-position="start">
      <span slot="icon" class="lit-icon">{@render plusIcon()}</span>
      Add
    </ui-button>
  </section>

  <section class="demo-row">
    <h3>Icon end</h3>
    <ui-button icon-position="end">
      <span slot="icon" class="lit-icon">{@render plusIcon()}</span>
      Add
    </ui-button>
  </section>

  <section class="demo-row">
    <h3>Click</h3>
    <ui-button onclick={() => (clicks += 1)}>Clicked {clicks}</ui-button>
  </section>

  <section class="demo-row">
    <h3>Submit</h3>
    <form
      class="demo-stack"
      onsubmit={(event) => {
        event.preventDefault();
        submitted = true;
      }}
    >
      <ui-button type="submit">Submit</ui-button>
      <p class="demo-meta">{submitted ? "Submitted" : "Not submitted"}</p>
    </form>
  </section>

  <section class="demo-row">
    <h3>Reset</h3>
    <form class="demo-stack" onreset={() => (resets += 1)}>
      <input aria-label="Svelte name" value="Ada" />
      <ui-button type="reset">Reset</ui-button>
      <p class="demo-meta">Resets: {resets}</p>
    </form>
  </section>
</div>

<style>
  .lit-icon {
    display: contents;
  }
</style>
