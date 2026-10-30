<script lang="ts">
  import "../components/ui-button";
  import "../components/ui-popover";
  import "../components/ui-text-input";
  import type { UiPopover } from "../components/ui-popover";

  let notePopover = $state<UiPopover>();
  let noteForm = $state<HTMLFormElement>();

  function onNoteSubmit(event: SubmitEvent) {
    event.preventDefault();
    notePopover?.close();
  }
</script>

<div class="popover-demo">
  <ui-popover bind:this={notePopover} onclose={() => noteForm?.reset()}>
    <ui-button>Open popover</ui-button>
    <form bind:this={noteForm} slot="content" class="popover-form" onsubmit={onNoteSubmit}>
      <h3>Add a note</h3>
      <label for="svelte-note">
        Note
        <ui-text-input id="svelte-note" name="note"></ui-text-input>
      </label>
      <div class="popover-form__actions">
        <ui-button type="submit">Save</ui-button>
        <ui-button type="button" variant="secondary" data-popover-close>Cancel</ui-button>
      </div>
    </form>
  </ui-popover>
  <ui-popover>
    <ui-button>Open large popover</ui-button>
    <h3 slot="content">Large popover</h3>
    <p slot="content">
      This panel is tall enough that it cannot sit below a button near the bottom of the page. It
      opens above the button instead, and the extra text scrolls inside the panel.
    </p>
    <p slot="content">
      The popover stays in the top layer, so the button and the rest of the page do not move when it
      opens. Its height is chosen once, from the space that is actually available.
    </p>
    <p slot="content">
      Further notes stay inside the same box. Scrolling the panel does not change its outer size,
      and scrolling the page only moves the panel with the button.
    </p>
    <p slot="content">
      One more paragraph keeps the content longer than a short viewport, so the cap and the flip are
      both visible from the lower button.
    </p>
    <p slot="content">
      The remaining room above the lower button is still smaller than this whole note. The panel
      stops at the viewport edge and this part is reached by scrolling inside it.
    </p>
    <p slot="content">
      Nothing below the button is pushed down. The trigger stays where it was, and the panel remains
      a fixed layer over the page.
    </p>
    <p slot="content">
      A final line makes the note longer than the space above a button sitting near the bottom of the
      window.
    </p>
    <p slot="content">
      Keep reading only if you need the rest of the note. The button underneath has not moved.
    </p>
    <p slot="content">
      The same rule applies near the edges: the panel shifts inward instead of widening the page.
    </p>
    <p slot="content">
      That is the whole demonstration. Close the panel with the button, the backdrop, or Escape.
    </p>
    <ui-button slot="content" variant="secondary" data-popover-close>Close</ui-button>
  </ui-popover>
</div>
