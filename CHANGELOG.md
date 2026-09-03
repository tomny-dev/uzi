# Changelog

## [0.6.0](https://github.com/tomny-dev/uzi/compare/uzi-v0.5.0...uzi-v0.6.0) (2026-09-03)


### Features

* add AuthCard template component ([#22](https://github.com/tomny-dev/uzi/issues/22)) ([f4b9be6](https://github.com/tomny-dev/uzi/commit/f4b9be62ea5bceba2cf45caf4aac408e652143e5))
* add DataTable, SettingsPage, and ErrorPage templates ([#42](https://github.com/tomny-dev/uzi/issues/42)) ([1cd6181](https://github.com/tomny-dev/uzi/commit/1cd61815566ed5c66b2ad829ad8bd3035b213711))
* add reusable application scaffolding primitives ([#37](https://github.com/tomny-dev/uzi/issues/37)) ([85f00a0](https://github.com/tomny-dev/uzi/commit/85f00a0d66f3d0d8623f71fb125a76430eebec0f))
* add Storybook with interactive component playground ([#40](https://github.com/tomny-dev/uzi/issues/40)) ([4aeabe9](https://github.com/tomny-dev/uzi/commit/4aeabe9b20bfd96c627d6d1b2e9381b591b3d64b))
* **SidebarNav:** add matchStrategy prop for most-specific active item highlighting ([#10](https://github.com/tomny-dev/uzi/issues/10)) ([2d88291](https://github.com/tomny-dev/uzi/commit/2d88291d745de802c290b5cff9c5268cedf68dd3))


### Bug Fixes

* add preserveModules to keep React imports intact ([3ee2742](https://github.com/tomny-dev/uzi/commit/3ee27429e9082660323de45e198e584e94bcaa88))
* **ci:** add pnpm/action-setup and upgrade to Node 22 ([bb2c6ac](https://github.com/tomny-dev/uzi/commit/bb2c6ace891f256c972b010b413829cdcc993f87))
* **ci:** correct release-please config locations ([3830c59](https://github.com/tomny-dev/uzi/commit/3830c597b9afc504c8f21f970ea40f1509dd3c23))
* **ci:** simplify publish workflow to trigger on v* and uzi-v* tags ([#18](https://github.com/tomny-dev/uzi/issues/18)) ([dbc555f](https://github.com/tomny-dev/uzi/commit/dbc555f3001f3c9c2a4b1b71878b63734b11f829))
* **ci:** trigger publish on release tags, not every push ([a529347](https://github.com/tomny-dev/uzi/commit/a529347f4c2e64bfdaa39f6e1390bbac56cfb071))
* disable minification to avoid Vite 8/Rolldown corrupting React import aliases ([133983d](https://github.com/tomny-dev/uzi/commit/133983d857fc8e3d681d2ba0cb78c9f24d32bbe9))
* inline CSS into JS bundle so body margin reset applies automatically ([#16](https://github.com/tomny-dev/uzi/issues/16)) ([937f107](https://github.com/tomny-dev/uzi/commit/937f107261b08eb0087b9f7c0ede53e375f3c1e5))
* modal layering fix ([62b8765](https://github.com/tomny-dev/uzi/commit/62b8765d3451dc02ee55cacef190685c3f4f26b4))
* preserve Next.js client boundary ([#30](https://github.com/tomny-dev/uzi/issues/30)) ([1dfd747](https://github.com/tomny-dev/uzi/commit/1dfd7471ab94185af4bd9164841a93b3b130abe6))
* remove broken ./styles.css export from package.json ([#19](https://github.com/tomny-dev/uzi/issues/19)) ([e976b26](https://github.com/tomny-dev/uzi/commit/e976b26c5edf8d9451eaf3a23c399e9b8f95386f))
* remove main/module fields to fix Vite ESM bundling ([bd2b207](https://github.com/tomny-dev/uzi/commit/bd2b207acd00f8bf6a64005bed798c5910ebe81b))
* remove vite-plugin-css-injected-by-js to fix ESM bundling ([706da55](https://github.com/tomny-dev/uzi/commit/706da557e58695232dfce0eafb79dc5fdc5773c5))
* replace hardcoded rgba colors with design token color-mix ([1e63c19](https://github.com/tomny-dev/uzi/commit/1e63c199c0e1e050629a09b110e0df43639860cc))
* **sidebar-nav:** avoid reserving space for missing icons ([#33](https://github.com/tomny-dev/uzi/issues/33)) ([8a9252f](https://github.com/tomny-dev/uzi/commit/8a9252f38ea9c02886a0b15be89483b1c4afddbf))
* **ui:** improve auth card spacing ([#27](https://github.com/tomny-dev/uzi/issues/27)) ([86db09b](https://github.com/tomny-dev/uzi/commit/86db09b9bbdfbd2c385bfe07946f858a22e4f044))
* Update CLAUDE.md to generalize agent reference ([b35d05b](https://github.com/tomny-dev/uzi/commit/b35d05b5a9aebefedf4dc598980c696a6e667a76))
* use plain string class names instead of CSS module objects ([0b36547](https://github.com/tomny-dev/uzi/commit/0b3654777e06589503b035489f1dd92e5eb5cbba))

## [0.5.0](https://github.com/tomny-dev/uzi/compare/uzi-v0.4.0...uzi-v0.5.0) (2026-09-03)


### ⚠ BREAKING CHANGES

* require Node.js 24 or newer for the published package and MCP package.


### Dependencies

* update MCP dependencies: `@hono/node-server` 1.19.14 → 2.1.1, `fast-uri` 3.1.5 → 3.1.7, and `qs` 6.15.3 → 6.16.0 ([#46](https://github.com/tomny-dev/uzi/issues/46))

## [0.4.0](https://github.com/tomny-dev/uzi/compare/uzi-v0.3.0...uzi-v0.4.0) (2026-08-24)


### Features

* add DataTable, SettingsPage, and ErrorPage templates ([#42](https://github.com/tomny-dev/uzi/issues/42)) ([1cd6181](https://github.com/tomny-dev/uzi/commit/1cd61815566ed5c66b2ad829ad8bd3035b213711))
* add Storybook with interactive component playground ([#40](https://github.com/tomny-dev/uzi/issues/40)) ([4aeabe9](https://github.com/tomny-dev/uzi/commit/4aeabe9b20bfd96c627d6d1b2e9381b591b3d64b))

## [0.3.0](https://github.com/tomny-dev/uzi/compare/uzi-v0.2.12...uzi-v0.3.0) (2026-08-18)


### Features

* add reusable application scaffolding primitives ([#37](https://github.com/tomny-dev/uzi/issues/37)) ([85f00a0](https://github.com/tomny-dev/uzi/commit/85f00a0d66f3d0d8623f71fb125a76430eebec0f))

## [0.2.12](https://github.com/tomny-dev/uzi/compare/uzi-v0.2.11...uzi-v0.2.12) (2026-07-29)


### Bug Fixes

* **sidebar-nav:** avoid reserving space for missing icons ([#33](https://github.com/tomny-dev/uzi/issues/33)) ([8a9252f](https://github.com/tomny-dev/uzi/commit/8a9252f38ea9c02886a0b15be89483b1c4afddbf))

## [0.2.11](https://github.com/tomny-dev/uzi/compare/uzi-v0.2.10...uzi-v0.2.11) (2026-07-23)


### Bug Fixes

* preserve Next.js client boundary ([#30](https://github.com/tomny-dev/uzi/issues/30)) ([1dfd747](https://github.com/tomny-dev/uzi/commit/1dfd7471ab94185af4bd9164841a93b3b130abe6))

## [0.2.10](https://github.com/tomny-dev/uzi/compare/uzi-v0.2.9...uzi-v0.2.10) (2026-06-30)


### Bug Fixes

* modal layering fix ([62b8765](https://github.com/tomny-dev/uzi/commit/62b8765d3451dc02ee55cacef190685c3f4f26b4))

## [0.2.9](https://github.com/tomny-dev/uzi/compare/uzi-v0.2.8...uzi-v0.2.9) (2026-06-30)


### Bug Fixes

* **ui:** improve auth card spacing ([#27](https://github.com/tomny-dev/uzi/issues/27)) ([86db09b](https://github.com/tomny-dev/uzi/commit/86db09b9bbdfbd2c385bfe07946f858a22e4f044))

## [0.2.8](https://github.com/tomny-dev/uzi/compare/uzi-v0.2.7...uzi-v0.2.8) (2026-06-30)


### Bug Fixes

* Update CLAUDE.md to generalize agent reference ([b35d05b](https://github.com/tomny-dev/uzi/commit/b35d05b5a9aebefedf4dc598980c696a6e667a76))

## [0.2.0](https://github.com/tomny-dev/uzi/compare/uzi-v0.1.16...uzi-v0.2.0) (2026-06-27)


### Features

* **SidebarNav:** add matchStrategy prop for most-specific active item highlighting ([#10](https://github.com/tomny-dev/uzi/issues/10)) ([2d88291](https://github.com/tomny-dev/uzi/commit/2d88291d745de802c290b5cff9c5268cedf68dd3))


### Bug Fixes

* **ci:** add pnpm/action-setup and upgrade to Node 22 ([bb2c6ac](https://github.com/tomny-dev/uzi/commit/bb2c6ace891f256c972b010b413829cdcc993f87))
* **ci:** correct release-please config locations ([3830c59](https://github.com/tomny-dev/uzi/commit/3830c597b9afc504c8f21f970ea40f1509dd3c23))
* inline CSS into JS bundle so body margin reset applies automatically ([#16](https://github.com/tomny-dev/uzi/issues/16)) ([937f107](https://github.com/tomny-dev/uzi/commit/937f107261b08eb0087b9f7c0ede53e375f3c1e5))
* replace hardcoded rgba colors with design token color-mix ([1e63c19](https://github.com/tomny-dev/uzi/commit/1e63c199c0e1e050629a09b110e0df43639860cc))
* use plain string class names instead of CSS module objects ([0b36547](https://github.com/tomny-dev/uzi/commit/0b3654777e06589503b035489f1dd92e5eb5cbba))
