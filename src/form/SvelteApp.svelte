<script lang="ts">
  import "../components/ui-form-field-text";

  let name = $state("");

  function onNameInput(event: Event) {
    const current = event.currentTarget;
    const field = current instanceof HTMLElement && "value" in current ? current : event.target;
    if (!(field instanceof HTMLElement) || !("value" in field)) return;
    name = String(field.value);
  }
</script>

<div class="form-demo">
  <div class="form-demo__live">
    <ui-form-field-text
      label="Display name"
      help="This is how your name appears."
      value={name}
      oninput={onNameInput}
    ></ui-form-field-text>
    <p class="demo-meta">Current value: {name}</p>
  </div>
  <ui-form-field-text label="Email" placeholder="name@example.com" required={true}></ui-form-field-text>
  <ui-form-field-text label="Username" error="That username is taken." value="admin"></ui-form-field-text>
  <ui-form-field-text label="Account id" value="usr_2048" disabled={true}></ui-form-field-text>
</div>
