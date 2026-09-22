# Visual Hierarchy

Uzi owns the reusable visual grammar of an application. Consumer apps should provide domain-specific composition and branding without re-inventing surface depth, typography, spacing, or basic workspace layout.

## Hierarchy model

1. **Canvas** — application background. Do not border it.
2. **Workspace** — the page's main content region. Usually transparent.
3. **Surface** — groups related content using subtle contrast.
4. **Raised / interactive** — menus, dialogs, popovers, or genuinely elevated objects.
5. **Selected / focused** — the current selection or active interaction.

Prefer whitespace and surface contrast before adding a border. Prefer a border before adding a shadow. Shadows communicate elevation, not grouping.

## Semantic tokens

- Surfaces: `--uzi-surface-canvas`, `--uzi-surface-1`, `--uzi-surface-2`, `--uzi-surface-raised`, `--uzi-surface-selected`
- Text: `--uzi-text-primary`, `--uzi-text-secondary`, `--uzi-text-muted`, `--uzi-text-disabled`
- Borders: `--uzi-border-subtle`, `--uzi-border-default`, `--uzi-border-strong`, `--uzi-border-accent`
- Shadows: `--uzi-shadow-none`, `--uzi-shadow-sm`, `--uzi-shadow-md`, `--uzi-shadow-lg`
- Type: `--uzi-font-display`, `--uzi-font-title`, `--uzi-font-heading`, `--uzi-font-body`, `--uzi-font-small`, `--uzi-font-caption`
- Spacing: `--uzi-space-1` through `--uzi-space-7`

Existing theme variables such as `--background`, `--panel`, `--muted`, and `--border` remain supported.

## Surface vs Card

Use `Surface` to group related content without implying that the group is a standalone object. Use `Card` when the content itself is a discrete object.

Default cards intentionally have little or no elevation. Use `tone="contrast"` or an interactive state only when the object should visually rise above the workspace.

## Toolbars

Use `Toolbar` for filters and page-level controls instead of placing ordinary controls inside a large card. `ToolbarGroup` provides labels, separators, growth, and narrow-screen stacking.

## Typography rules

- Primary content and values should visually dominate supporting metadata.
- Ordinary labels use sentence case.
- Reserve uppercase styling for short categorical or state labels such as `LIVE`, `BETA`, or a product-defined eyebrow.
- Caption-sized text is metadata, not normal body content.
- Avoid shrinking important data merely to fit more content on screen.

## Consumer-app boundary

Uzi owns visual and semantic layout concerns. Product concepts stay local. If a proposed Uzi prop names a product concept, it likely belongs in the consumer app.
