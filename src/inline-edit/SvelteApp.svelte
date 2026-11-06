<script lang="ts">
  import "../components/ui-button";
  import "../components/ui-form-field";
  import "../components/ui-inline-edit";
  import "../components/ui-select";
  import "../components/ui-text-input";

  const statuses = [
    { value: "todo", label: "To do" },
    { value: "in_progress", label: "In progress" },
    { value: "done", label: "Done" },
  ];

  let status = $state("");
  let statusDraft = $state("");
  let owner = $state("");
  let ownerDraft = $state("");

  const statusLabel = $derived(statuses.find((item) => item.value === status)?.label ?? "");

  function fieldValue(event: Event) {
    const current = event.currentTarget;
    const field = current instanceof HTMLElement && "value" in current ? current : event.target;
    if (!(field instanceof HTMLElement) || !("value" in field)) return "";
    return String(field.value);
  }

  function onStatusSubmit(event: SubmitEvent) {
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;
    status = String(new FormData(form).get("status") ?? "");
  }

  function onOwnerSubmit(event: SubmitEvent) {
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;
    owner = String(new FormData(form).get("owner") ?? "");
  }
</script>

<div class="inline-edit-demo">
  <section aria-labelledby="svelte-update-heading">
    <h3 id="svelte-update-heading">Update</h3>
    <ui-inline-edit
      label="Status"
      onclose={() => (statusDraft = status)}
      onclear={() => {
        status = "";
        statusDraft = "";
      }}
    >
      {#if statusLabel}
        <span slot="value">{statusLabel}</span>
      {/if}
      <form slot="content" class="popover-form" onsubmit={onStatusSubmit}>
        <ui-form-field label="Status">
          <ui-select name="status" value={statusDraft} oninput={(event: Event) => (statusDraft = fieldValue(event))}>
            <option slot="options" value="">------</option>
            {#each statuses as item (item.value)}
              <option slot="options" value={item.value}>{item.label}</option>
            {/each}
          </ui-select>
        </ui-form-field>
        <div class="popover-form__actions">
          <ui-button type="submit">Apply</ui-button>
          <ui-button type="button" variant="secondary" data-popover-close>Cancel</ui-button>
        </div>
      </form>
    </ui-inline-edit>
  </section>

  <section aria-labelledby="svelte-filter-heading">
    <h3 id="svelte-filter-heading">Filter</h3>
    <ui-inline-edit
      label="Owner"
      placeholder="Anyone"
      onclose={() => (ownerDraft = owner)}
      onclear={() => {
        owner = "";
        ownerDraft = "";
      }}
    >
      {#if owner}
        <span slot="value">{owner}</span>
      {/if}
      <form slot="content" class="popover-form" onsubmit={onOwnerSubmit}>
        <ui-form-field label="Owner">
          <ui-text-input
            name="owner"
            value={ownerDraft}
            oninput={(event: Event) => (ownerDraft = fieldValue(event))}
          ></ui-text-input>
        </ui-form-field>
        <div class="popover-form__actions">
          <ui-button type="submit">Apply</ui-button>
          <ui-button type="button" variant="secondary" data-popover-close>Cancel</ui-button>
        </div>
      </form>
    </ui-inline-edit>
  </section>
</div>
