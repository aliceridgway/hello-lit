<script lang="ts">
  import "../components/ui-form-field";
  import "../components/ui-text-input";
  import "../components/ui-select";

  let name = $state("");
  let fruit = $state("");

  function onNameInput(event: Event) {
    const current = event.currentTarget;
    const field = current instanceof HTMLElement && "value" in current ? current : event.target;
    if (!(field instanceof HTMLElement) || !("value" in field)) return;
    name = String(field.value);
  }

  function onFruitInput(event: Event) {
    const current = event.currentTarget;
    const field = current instanceof HTMLElement && "value" in current ? current : event.target;
    if (!(field instanceof HTMLElement) || !("value" in field)) return;
    fruit = String(field.value);
  }
</script>

<div class="form-demo">
  <section class="form-demo__section" aria-labelledby="text-heading">
    <h3 id="text-heading">Text</h3>
    <div class="form-demo__live">
      <ui-form-field label="Display name" help="This is how your name appears.">
        <ui-text-input value={name} oninput={onNameInput}></ui-text-input>
      </ui-form-field>
      <p class="demo-meta">Current value: {name}</p>
    </div>
    <ui-form-field label="Email" required={true}>
      <ui-text-input placeholder="name@example.com"></ui-text-input>
    </ui-form-field>
    <ui-form-field label="Username" error="That username is taken.">
      <ui-text-input value="admin"></ui-text-input>
    </ui-form-field>
    <ui-form-field label="Account id">
      <ui-text-input value="usr_2048" disabled={true}></ui-text-input>
    </ui-form-field>
  </section>

  <section class="form-demo__section" aria-labelledby="select-heading">
    <h3 id="select-heading">Select</h3>
    <div class="form-demo__live">
      <ui-form-field label="Favorite fruit" help="Used on your profile.">
        <ui-select value={fruit} oninput={onFruitInput}>
          <option slot="options" value="">Select a fruit</option>
          <option slot="options" value="apple">Apple</option>
          <option slot="options" value="banana">Banana</option>
          <option slot="options" value="cherry">Cherry</option>
          <option slot="options" value="durian">Durian</option>
        </ui-select>
      </ui-form-field>
      <p class="demo-meta">Current value: {fruit}</p>
    </div>
    <ui-form-field label="Country" required={true}>
      <ui-select>
        <option slot="options" value="">Select a country</option>
        <option slot="options" value="uk">United Kingdom</option>
        <option slot="options" value="us">United States</option>
        <option slot="options" value="ca">Canada</option>
      </ui-select>
    </ui-form-field>
    <ui-form-field label="Plan" error="That plan is no longer available.">
      <ui-select value="pro">
        <option slot="options" value="free">Free</option>
        <option slot="options" value="pro">Pro</option>
        <option slot="options" value="enterprise">Enterprise</option>
      </ui-select>
    </ui-form-field>
    <ui-form-field label="Region">
      <ui-select value="eu" disabled={true}>
        <option slot="options" value="us">US</option>
        <option slot="options" value="eu">EU</option>
        <option slot="options" value="ap">APAC</option>
      </ui-select>
    </ui-form-field>
  </section>
</div>
