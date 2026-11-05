## Lit

Component manifests: [docs/components](docs/components).

Lit is a library for building web components. It was originally created by Google and is now managedby the OpenJS Foundation.

The library is 6kb gzipped, about a quarter of the size of Vue.

### What are Web Components?

Web Components are like Vue components, but they run natively in the browser and can be integrated into any framework.

It would allow us to create one library that can be consumed by both Vue and Svelte projects.

### What is Lit for?

Lit provides the boilerplate for writing web components. It assists with reactivity, scoped styles and template support.

### Why not generate web components without Lit?

AI can allow us to be more selective about the libraries we use, but replacing dependencies with AI-generated code does not reduce overall risk.

To implement web components without Lit, AI would need to generate a large volume of code and likely fall back to a homegrown mini-framework. The burden of bugs, maintenance, and security reviews would shift to the development team.

## Compatibility

| Framework | Compatibility |
|-----------|---------------|
| Svelte    | Optimal          |
| Vue 3     | Optimal          |
| Vue 2     | Risky. AI describes Vue 2 as 'the awkward consumer' and the framework that would need the most glue to make it work. Given Vue 2 is EOL, an upgrade to Vue 3 or Svelte should be considered.    |
| jQuery    | Yes, in theory; but may need additional glue to make it work. |
