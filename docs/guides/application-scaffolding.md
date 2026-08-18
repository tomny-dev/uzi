# Application Scaffolding

Use these primitives for shared page structure before adding consumer-specific layout CSS.

## Recommended page composition

```tsx
import {
  Button,
  PageContainer,
  PageHeader,
  SectionHeader,
  Stack,
  Stat,
  StatGroup,
} from "@tomny-dev/uzi";

export function DashboardPage() {
  return (
    <PageContainer>
      <Stack gap="xl">
        <PageHeader
          eyebrow="Workspace"
          title="Dashboard"
          description="Monitor the latest activity and key metrics."
          actions={<Button>New item</Button>}
        />

        <StatGroup>
          <Stat label="Active" value="24" />
          <Stat label="Completed" value="81" detail="Last 30 days" />
          <Stat label="Success rate" value="93%" />
        </StatGroup>

        <section>
          <SectionHeader title="Recent activity" description="The latest changes in this workspace." />
          {/* Product-specific content belongs here. */}
        </section>
      </Stack>
    </PageContainer>
  );
}
```

## Components

### `PageContainer`

Provides a centered responsive content width and horizontal gutters. Use `maxWidth="sm" | "md" | "lg" | "xl" | "full"` when the page needs a different content measure, and `bleed` only when the parent already owns horizontal padding.

### `PageHeader`

Provides a page-level title, optional eyebrow/badge content, description, and actions. `headingLevel` controls the semantic heading from `1` through `6` without coupling the component to a specific page type.

### `SectionHeader`

Provides a smaller section heading, optional description, and actions. It is intended for content sections inside a page rather than the page's primary heading. `headingLevel` supports `2` through `6` for nested document structure.

### `EmptyState`

Provides reusable empty-result or empty-resource presentation with optional visual, description, and primary/secondary actions. Use `size="compact"` when the state lives inside a smaller panel. Use `headingLevel` (`2` through `6`) to keep the empty-state title consistent with the surrounding document outline.

### `Stack` and `Inline`

These intentionally small layout helpers cover the most common gap/alignment boilerplate:

- `Stack` arranges children vertically with `xs` through `xl` gaps.
- `Inline` arranges children horizontally, wraps by default, and supports common alignment/justification options.

They are not a utility-CSS replacement. If a layout requires product-specific positioning, responsive behavior, or visual treatment, keep that composition in the consumer app.

### `Stat` and `StatGroup`

Use `Stat` for a label/value/detail presentation and `StatGroup` for a responsive collection of up to four columns. These components deliberately avoid dashboard, game, betting, or analytics semantics.

## What belongs in the consumer app

Keep product semantics and specialized compositions local. Examples include sports event headers, wiki entity headers, sportsbook controls, branded marketing heroes, domain-specific tables, and application navigation behavior.

A useful rule: if a proposed Uzi prop names a product concept rather than a visual or semantic layout concern, the abstraction probably belongs in the consumer repository.

## Next.js client boundary

These components themselves do not use hooks or browser-only APIs. The main `@tomny-dev/uzi` entry remains a client entry because it also exports interactive components and providers. This issue does not change that package boundary; a broader server-safe export redesign should be handled separately if consumer measurements show a meaningful benefit.
