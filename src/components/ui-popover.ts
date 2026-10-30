import { LitElement, css, html } from "lit";
import { customElement, query } from "lit/decorators.js";

@customElement("ui-popover")
export class UiPopover extends LitElement {
  static override styles = css`
    :host {
      position: relative;
      display: inline-flex;
      vertical-align: middle;
    }

    .panel {
      position: fixed;
      inset: auto;
      box-sizing: border-box;
      width: max-content;
      max-width: min(20rem, calc(100vw - 2rem));
      margin: 0;
      padding: var(--ui-space-3) var(--ui-space-4);
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      background: #ffffff;
      color: #111827;
      font-family: var(--ui-font-sans);
      font-size: var(--ui-font-size-md);
      line-height: 1.5;
      box-shadow: 0 10px 30px rgb(17 24 39 / 0.12);
      overflow: auto;
    }

    ::slotted(h1),
    ::slotted(h2),
    ::slotted(h3),
    ::slotted(h4),
    ::slotted(p) {
      margin: 0;
    }

    ::slotted(h1),
    ::slotted(h2),
    ::slotted(h3),
    ::slotted(h4) {
      margin-bottom: var(--ui-space-2);
      font-size: var(--ui-font-size-md);
      font-weight: var(--ui-font-weight-semibold);
      line-height: var(--ui-line-height);
    }

    ::slotted(p) {
      color: #4b5563;
      font-size: var(--ui-font-size-sm);
    }

    slot[name="content"]::slotted(ui-button) {
      margin-top: var(--ui-space-3);
    }
  `;

  @query(".panel")
  private panel!: HTMLElement;

  private suppressToggle = false;
  private placedAbove = false;
  private panelWidth = 0;
  private panelHeight = 0;
  private repositioning = false;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("pointerdown", this.onPointerDown);
    this.addEventListener("click", this.onClick);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("pointerdown", this.onPointerDown);
    this.removeEventListener("click", this.onClick);
    this.unbindReposition();
    this.close();
  }

  private isPanelEvent(event: Event) {
    return !!this.panel && event.composedPath().includes(this.panel);
  }

  private readonly onPointerDown = (event: PointerEvent) => {
    this.suppressToggle = false;
    if (!this.panel?.matches(":popover-open") || this.isPanelEvent(event)) return;
    this.suppressToggle = true;
  };

  private isCloseRequest(event: Event) {
    return event.composedPath().some((node) => node instanceof HTMLElement && node.hasAttribute("data-popover-close"));
  }

  close() {
    if (this.panel?.matches(":popover-open")) this.panel.hidePopover();
  }

  private readonly onClick = (event: Event) => {
    if (this.isCloseRequest(event)) {
      this.close();
      return;
    }
    if (this.isPanelEvent(event)) return;
    const suppress = this.suppressToggle;
    this.suppressToggle = false;
    if (suppress) return;
    this.toggle();
  };

  private readonly onToggle = (event: Event) => {
    const open = event instanceof ToggleEvent ? event.newState === "open" : this.panel.matches(":popover-open");
    if (open) this.bindReposition();
    else {
      this.unbindReposition();
      this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }));
    }
    this.setExpanded(open);
  };

  private readonly onReposition = () => {
    if (!this.panel?.matches(":popover-open")) return;
    this.place(true);
  };

  private trigger() {
    const slot = this.shadowRoot?.querySelector("slot:not([name])");
    if (!(slot instanceof HTMLSlotElement)) return null;
    const node = slot.assignedElements({ flatten: true })[0];
    return node instanceof HTMLElement ? node : null;
  }

  private measureNatural() {
    const panel = this.panel;
    const display = panel.style.display;
    const visibility = panel.style.visibility;
    const maxHeight = panel.style.maxHeight;
    panel.style.display = "block";
    panel.style.visibility = "hidden";
    panel.style.maxHeight = "none";
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    panel.style.display = display;
    panel.style.visibility = visibility;
    panel.style.maxHeight = maxHeight;
    return { width, height };
  }

  private place(moveOnly = false) {
    const trigger = this.trigger();
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const margin = 8;
    const gap = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (!moveOnly) {
      const natural = this.measureNatural();
      const spaceBelow = viewportHeight - rect.bottom - gap - margin;
      const spaceAbove = rect.top - gap - margin;
      this.placedAbove = natural.height > spaceBelow && spaceAbove > spaceBelow;
      const available = Math.max(0, this.placedAbove ? spaceAbove : spaceBelow);
      this.panel.style.maxHeight = `${available}px`;
      this.panelWidth = natural.width;
      this.panelHeight = Math.min(natural.height, available);
    }

    const top = this.placedAbove ? rect.top - gap - this.panelHeight : rect.bottom + gap;
    let left = rect.left;
    if (left + this.panelWidth > viewportWidth - margin) {
      left = viewportWidth - margin - this.panelWidth;
    }
    this.panel.style.top = `${top}px`;
    this.panel.style.left = `${Math.max(margin, left)}px`;
  }

  private bindReposition() {
    if (this.repositioning) return;
    this.repositioning = true;
    window.addEventListener("scroll", this.onReposition, true);
    window.addEventListener("resize", this.onReposition);
  }

  private unbindReposition() {
    if (!this.repositioning) return;
    this.repositioning = false;
    window.removeEventListener("scroll", this.onReposition, true);
    window.removeEventListener("resize", this.onReposition);
  }

  private toggle() {
    if (!this.panel) return;
    if (this.panel.matches(":popover-open")) {
      this.close();
      return;
    }
    this.place();
    this.panel.showPopover();
  }

  private setExpanded(open: boolean) {
    const slot = this.shadowRoot?.querySelector("slot:not([name])");
    if (!(slot instanceof HTMLSlotElement)) return;
    const value = open ? "true" : "false";
    for (const node of slot.assignedElements({ flatten: true })) {
      if (!(node instanceof HTMLElement)) continue;
      node.setAttribute("aria-expanded", value);
      const inner = node.shadowRoot?.querySelector("button");
      if (inner instanceof HTMLElement) inner.setAttribute("aria-expanded", value);
    }
  }

  private onSlotChange() {
    this.setExpanded(this.panel?.matches(":popover-open") ?? false);
  }

  override render() {
    return html`
      <slot @slotchange=${this.onSlotChange}></slot>
      <div class="panel" popover="auto" @toggle=${this.onToggle}>
        <slot name="content"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-popover": UiPopover;
  }
}
