# SSR and Next.js

Uzi supports use in client-rendered applications and frameworks with server-side rendering (SSR).

## Styles and SSR

The main package bundle also injects its component CSS into the browser at runtime through `vite-plugin-css-injected-by-js`. This makes an additional stylesheet import unnecessary in some client-only applications.

For SSR applications such as Next.js and Remix, the runtime-injected `<style>` element is unavailable during server rendering. To avoid a flash of unstyled content, **import the exported stylesheet once in your application's global CSS**:

```css
@import "@tomny-dev/uzi/styles.css";
```

Bundlers that support CSS imports from JavaScript can instead import `@tomny-dev/uzi/styles.css` from the appropriate application entry.

## Next.js App Router

The main `@tomny-dev/uzi` entry is a client entry because it exports interactive components and context providers. Next.js Server Components can import and render these exports, and Next.js preserves the client boundary without requiring a local wrapper.

Application-scaffolding components themselves do not need browser-only hooks, but they are currently exposed through that main client entry. Uzi does not currently publish a separate server-safe layout entry.

The package provides these additional entry points:

- `@tomny-dev/uzi/server` for the server-safe `getThemeScript` export.
- `@tomny-dev/uzi/utils` for environment-neutral utilities such as `cx`, including direct use from Server Components.

For theme initialization before first paint and styling configuration, see [Theming](./theming.md).
