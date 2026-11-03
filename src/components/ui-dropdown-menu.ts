import { LitElement, css, html, type PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import "./ui-popover";
import "./ui-dropdown-menu-item";
import type { UiPopover } from "./ui-popover";
import type { UiDropdownMenuItem } from "./ui-dropdown-menu-item";

const OPEN_DELAY_MS = 150;
const CLOSE_DELAY_MS = 200;
const TYPEAHEAD_RESET_MS = 500;

@customElement("ui-dropdown-menu")
export class UiDropdownMenu extends LitElement {
  static override styles = css`
    :host {
      position: relative;
      display: inline-flex;
      vertical-align: middle;
    }

    .menu {
      display: flex;
      flex-direction: column;
      gap: var(--ui-space-1);
      min-width: 8rem;
      margin: 0;
      padding: 0;
    }
  `;

  @property({ type: Boolean, reflect: true })
  open = false;

  @query("ui-popover")
  private popoverEl!: UiPopover;

  private openTimer: number | undefined;
  private closeTimer: number | undefined;
  private typeahead = "";
  private typeaheadTimer: number | undefined;
  private activeIndex = -1;
  private suppressFocusOpen = false;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("pointerenter", this.onPointerEnter);
    this.addEventListener("pointerleave", this.onPointerLeave);
    this.addEventListener("focusin", this.onFocusIn);
    this.addEventListener("focusout", this.onFocusOut);
    this.addEventListener("keydown", this.onKeyDown);
    this.addEventListener("select", this.onSelect);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("pointerenter", this.onPointerEnter);
    this.removeEventListener("pointerleave", this.onPointerLeave);
    this.removeEventListener("focusin", this.onFocusIn);
    this.removeEventListener("focusout", this.onFocusOut);
    this.removeEventListener("keydown", this.onKeyDown);
    this.removeEventListener("select", this.onSelect);
    this.clearOpenTimer();
    this.clearCloseTimer();
    this.clearTypeahead();
  }

  override updated(changed: PropertyValues<this>) {
    if (!changed.has("open") || !this.popoverEl) return;
    if (this.open === this.popoverEl.isOpen) return;
    if (this.open) this.popoverEl.show();
    else this.popoverEl.close();
  }

  private items(): UiDropdownMenuItem[] {
    return [...this.querySelectorAll(":scope > ui-dropdown-menu-item")].filter(
      (node): node is UiDropdownMenuItem => node.slot === "items",
    );
  }

  private enabledItems() {
    return this.items().filter((item) => !item.disabled);
  }

  private clearOpenTimer() {
    if (this.openTimer === undefined) return;
    window.clearTimeout(this.openTimer);
    this.openTimer = undefined;
  }

  private clearCloseTimer() {
    if (this.closeTimer === undefined) return;
    window.clearTimeout(this.closeTimer);
    this.closeTimer = undefined;
  }

  private clearTypeahead() {
    this.typeahead = "";
    if (this.typeaheadTimer === undefined) return;
    window.clearTimeout(this.typeaheadTimer);
    this.typeaheadTimer = undefined;
  }

  private isFocusInside() {
    const active = document.activeElement;
    if (!(active instanceof Node)) return false;
    return this === active || this.contains(active);
  }

  private setOpen(next: boolean, focusMenu = false) {
    this.clearOpenTimer();
    this.clearCloseTimer();
    if (this.open === next) {
      if (next && focusMenu) this.focusActiveOrFirst();
      return;
    }
    this.open = next;
    if (next) this.popoverEl?.show();
    else this.popoverEl?.close();
    this.dispatchEvent(
      new CustomEvent("open-change", {
        detail: { open: next },
        bubbles: true,
        composed: true,
      }),
    );
    if (next && focusMenu) {
      queueMicrotask(() => this.focusActiveOrFirst());
    }
    if (!next) {
      this.activeIndex = -1;
      this.clearTypeahead();
    }
  }

  private readonly onPointerEnter = () => {
    this.clearCloseTimer();
    if (this.open) return;
    this.clearOpenTimer();
    this.openTimer = window.setTimeout(() => {
      this.openTimer = undefined;
      this.setOpen(true);
    }, OPEN_DELAY_MS);
  };

  private readonly onPointerLeave = () => {
    this.clearOpenTimer();
    if (!this.open) return;
    this.clearCloseTimer();
    this.closeTimer = window.setTimeout(() => {
      this.closeTimer = undefined;
      if (this.isFocusInside()) return;
      this.setOpen(false);
    }, CLOSE_DELAY_MS);
  };

  private readonly onFocusIn = (event: FocusEvent) => {
    this.clearCloseTimer();
    if (this.suppressFocusOpen) return;
    const trigger = this.trigger();
    if (!trigger) return;
    const path = event.composedPath();
    if (!path.includes(trigger)) return;
    this.setOpen(true);
  };

  private focusTriggerWithoutReopen() {
    this.suppressFocusOpen = true;
    this.trigger()?.focus();
    queueMicrotask(() => {
      this.suppressFocusOpen = false;
    });
  }

  private readonly onFocusOut = () => {
    requestAnimationFrame(() => {
      if (!this.open) return;
      if (this.isFocusInside()) return;
      this.setOpen(false);
    });
  };

  private trigger() {
    return (
      [...this.children].find(
        (node): node is HTMLElement => node instanceof HTMLElement && !node.slot,
      ) ?? null
    );
  }

  private readonly onSelect = (event: Event) => {
    if (!(event.target instanceof HTMLElement)) return;
    if (event.target.localName !== "ui-dropdown-menu-item") return;
    this.setOpen(false);
    this.focusTriggerWithoutReopen();
  };

  private readonly onPopoverOpenChange = (event: Event) => {
    const detail = (event as CustomEvent<{ open: boolean }>).detail;
    if (!detail || this.open === detail.open) return;
    this.open = detail.open;
    this.dispatchEvent(
      new CustomEvent("open-change", {
        detail: { open: detail.open },
        bubbles: true,
        composed: true,
      }),
    );
    if (detail.open) {
      this.setTriggerHasPopup();
      // Click-to-open: move focus into the menu for keyboard use.
      queueMicrotask(() => this.focusActiveOrFirst());
    } else {
      this.activeIndex = -1;
      this.clearTypeahead();
    }
  };

  private setTriggerHasPopup() {
    const trigger = this.trigger();
    if (!trigger) return;
    trigger.setAttribute("aria-haspopup", "menu");
    const inner = trigger.shadowRoot?.querySelector("button");
    if (inner instanceof HTMLElement) inner.setAttribute("aria-haspopup", "menu");
  }

  private onTriggerSlotChange() {
    this.setTriggerHasPopup();
  }

  private focusItem(index: number) {
    const enabled = this.enabledItems();
    if (!enabled.length) return;
    const clamped = ((index % enabled.length) + enabled.length) % enabled.length;
    this.activeIndex = clamped;
    const item = enabled[clamped];
    const button = item.shadowRoot?.querySelector("button");
    if (button instanceof HTMLElement) button.focus();
    else item.focus();
  }

  private focusActiveOrFirst() {
    const enabled = this.enabledItems();
    if (!enabled.length) return;
    if (this.activeIndex < 0 || this.activeIndex >= enabled.length) this.activeIndex = 0;
    this.focusItem(this.activeIndex);
  }

  private itemLabel(item: UiDropdownMenuItem) {
    return (item.textContent ?? "").trim().toLowerCase();
  }

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      if (!this.open) return;
      event.preventDefault();
      this.setOpen(false);
      this.focusTriggerWithoutReopen();
      return;
    }

    const trigger = this.trigger();
    const onTrigger = !!trigger && event.composedPath().includes(trigger);

    if (!this.open) {
      if (!onTrigger) return;
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.setOpen(true, true);
      }
      return;
    }

    const enabled = this.enabledItems();
    if (!enabled.length) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        this.focusItem(this.activeIndex + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        this.focusItem(this.activeIndex < 0 ? enabled.length - 1 : this.activeIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        this.focusItem(0);
        break;
      case "End":
        event.preventDefault();
        this.focusItem(enabled.length - 1);
        break;
      case "Enter":
      case " ": {
        if (onTrigger) {
          event.preventDefault();
          this.focusActiveOrFirst();
          break;
        }
        event.preventDefault();
        const item = enabled[this.activeIndex] ?? enabled[0];
        item?.activate();
        break;
      }
      default: {
        if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
        event.preventDefault();
        this.typeahead += event.key.toLowerCase();
        if (this.typeaheadTimer !== undefined) window.clearTimeout(this.typeaheadTimer);
        this.typeaheadTimer = window.setTimeout(() => {
          this.typeaheadTimer = undefined;
          this.typeahead = "";
        }, TYPEAHEAD_RESET_MS);
        const start = Math.max(this.activeIndex, 0) + 1;
        const ordered = [...enabled.slice(start), ...enabled.slice(0, start)];
        const match = ordered.find((item) => this.itemLabel(item).startsWith(this.typeahead));
        if (!match) return;
        this.focusItem(enabled.indexOf(match));
      }
    }
  };

  override render() {
    return html`
      <ui-popover @open-change=${this.onPopoverOpenChange}>
        <slot @slotchange=${this.onTriggerSlotChange}></slot>
        <div class="menu" slot="content" role="menu">
          <slot name="items"></slot>
        </div>
      </ui-popover>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-dropdown-menu": UiDropdownMenu;
  }
}
