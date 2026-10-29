import { mount } from "svelte";
import { createApp } from "vue";
import SvelteApp from "./compare/SvelteApp.svelte";
import VueApp from "./compare/VueApp.vue";
import "./compare/compare.css";
import "./styles/tokens.css";

createApp(VueApp).mount("#vue-app");

const svelteRoot = document.querySelector("#svelte-app");
if (svelteRoot instanceof HTMLElement) {
  mount(SvelteApp, { target: svelteRoot });
}
