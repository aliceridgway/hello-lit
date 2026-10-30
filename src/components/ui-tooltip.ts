import { LitElement, css, html, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

const positions = ["top", "bottom", "left", "right"] as const;
type TooltipPosition = (typeof positions)[number];

let nextTooltipId = 0;

@customElement("ui-tooltip")
export class UiTooltip extends LitElement {
  static override styles = css`
    :host {
      position: relative;
      display: inline-flex;
      vertical-align: middle;
    }

    :host(:hover),
    :host(:focus-within) {
      z-index: 1;
    }

    .tooltip {
      position: absolute;
      z-index: 1;
      width: max-content;
      max-width: 16rem;
      margin: 0;
      padding: var(--ui-space-1) var(--ui-space-2);
      border-radius: var(--ui-radius-md);
      background: #111827;
      color: #ffffff;
      font-family: var(--ui-font-sans);
      font-size: var(--ui-font-size-sm);
      font-weight: var(--ui-font-weight-semibold);
      line-height: var(--ui-line-height);
      white-space: nowrap;
    }

    :host([position="top"]) .tooltip {
      bottom: calc(100% + var(--ui-space-2));
      left: 50%;
      transform: translateX(-50%);
    }

    :host([position="bottom"]) .tooltip {
      top: calc(100% + var(--ui-space-2));
      left: 50%;
      transform: translateX(-50%);
    }

    :host([position="left"]) .tooltip {
      top: 50%;
      right: calc(100% + var(--ui-space-2));
      transform: translateY(-50%);
    }

    :host([position="right"]) .tooltip {
      top: 50%;
      left: calc(100% + var(--ui-space-2));
      transform: translateY(-50%);
    }
  `;

  @property({ type: String })
  text = "";

  @property({ type: String, reflect: true })
  position: TooltipPosition = "top";

  @state()
  private open = false;

  @query(".tooltip")
  private tooltipEl!: HTMLElement;

  private readonly tooltipId = `ui-tooltip-${++nextTooltipId}`;
  private hovering = false;
  private focused = false;
  private dismissed = false;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("mouseenter", this.onPointerEnter);
    this.addEventListener("mouseleave", this.onPointerLeave);
    this.addEventListener("focusin", this.onFocusIn);
    this.addEventListener("focusout", this.onFocusOut);
    this.addEventListener("click", this.onClick);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("mouseenter", this.onPointerEnter);
    this.removeEventListener("mouseleave", this.onPointerLeave);
    this.removeEventListener("focusin", this.onFocusIn);
    this.removeEventListener("focusout", this.onFocusOut);
    this.removeEventListener("click", this.onClick);
  }

  override willUpdate(changed: PropertyValues<this>) {
    if (changed.has("position") && !positions.includes(this.position)) {
      this.position = "top";
    }
  }

  private readonly onPointerEnter = () => {
    this.dismissed = false;
    this.hovering = true;
    this.sync();
  };

  private readonly onPointerLeave = () => {
    this.hovering = false;
    this.sync();
  };

  private readonly onFocusIn = () => {
    this.dismissed = false;
    this.focused = true;
    this.sync();
  };

  private readonly onClick = (event: Event) => {
    if (this.tooltipEl && event.composedPath().includes(this.tooltipEl)) return;
    this.dismissed = true;
    this.sync();
  };

  private readonly onFocusOut = (event: FocusEvent) => {
    if (this.owns(event.relatedTarget)) return;
    this.focused = false;
    this.sync();
  };

  private owns(target: EventTarget | null) {
    if (!(target instanceof Node)) return false;
    return this.contains(target) || !!this.shadowRoot?.contains(target);
  }

  private sync() {
    const open = !this.dismissed && (this.hovering || this.focused);
    if (open === this.open) return;
    this.open = open;
  }

  private linkDescription() {
    const tooltip = this.tooltipEl;
    const slot = this.shadowRoot?.querySelector("slot");
    if (!tooltip || !(slot instanceof HTMLSlotElement)) return;

    for (const node of slot.assignedElements({ flatten: true })) {
      if (!(node instanceof HTMLElement)) continue;
      this.describe(node, tooltip);
      const inner = node.shadowRoot?.querySelector("button");
      if (inner instanceof HTMLElement) this.describe(inner, tooltip);
    }
  }

  private describe(element: HTMLElement, tooltip: HTMLElement) {
    element.setAttribute("aria-describedby", tooltip.id);
    if (element.shadowRoot) return;
    element.setAttribute("aria-description", this.text);
  }

  private onSlotChange() {
    this.linkDescription();
  }

  override updated() {
    this.linkDescription();
  }

  override render() {
    return html`
      <slot @slotchange=${this.onSlotChange}></slot>
      <div id=${this.tooltipId} class="tooltip" role="tooltip" ?hidden=${!this.open}>
        ${this.text}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-tooltip": UiTooltip;
  }
}
