# Form Patterns

uzi provides lightweight form primitives that compose naturally with HTML. This guide covers common patterns for building forms.

## Input + Label Pairing

`Input` and `Label` are native HTML wrappers — no Radix dependency, no custom behavior. Use the `id` / `htmlFor` pairing for accessibility:

```tsx
"use client";

import { Input, Label } from "@tomny-dev/uzi";

export function LoginForm() {
  return (
    <fieldset style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
        />
      </div>
    </fieldset>
  );
}
```

`Input` accepts all standard `HTMLInputAttributes` — `type`, `name`, `placeholder`, `disabled`, `required`, `autoComplete`, etc.

## Select Controlled State

`Select` is a Radix-backed single-select field. It requires **controlled** state — you must provide `value` and `onChange`:

```tsx
"use client";

import { useState } from "react";
import { Select } from "@tomny-dev/uzi";

const options = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Pending", value: "pending" },
];

export function StatusSelector() {
  const [status, setStatus] = useState("");

  return (
    <Select
      options={options}
      value={status}
      onChange={setStatus}
      placeholder="Select status..."
      allowEmptyOption={true}
    />
  );
}
```

Key props:

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `{ label: string; value: string; disabled?: boolean }[]` | — | Available choices. |
| `value` | `string` | — | Currently selected value (controlled). |
| `onChange` | `(value: string) => void` | — | Called with the new value on selection. |
| `placeholder` | `string` | — | Shown when no option is selected. |
| `allowEmptyOption` | `boolean` | `false` | When `true`, shows the placeholder as a selectable "clear" option. |
| `fullWidth` | `boolean` | `true` | Whether the select takes full container width. |

## MultiSelect with Chip Display

`MultiSelect` lets users pick multiple options. It displays selected values as chips and supports an overflow summary:

```tsx
"use client";

import { useState } from "react";
import { MultiSelect } from "@tomny-dev/uzi";

const tags = [
  { label: "Design", value: "design" },
  { label: "Engineering", value: "engineering" },
  { label: "Marketing", value: "marketing" },
  { label: "Sales", value: "sales" },
  { label: "Support", value: "support" },
];

export function TagSelector() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <MultiSelect
      options={tags}
      value={selected}
      onChange={setSelected}
      placeholder="Select tags..."
      maxVisibleValues={2}
    />
  );
}
```

When more than `maxVisibleValues` options are selected, the remaining count appears as a summary chip (e.g., `+2`). The dropdown uses checkbox-style items so users can toggle individual options.

Key props:

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `{ label: string; value: string; disabled?: boolean }[]` | — | Available choices. |
| `value` | `string[]` | — | Currently selected values (controlled). |
| `onChange` | `(value: string[]) => void` | — | Called with the updated array on toggle. |
| `placeholder` | `string` | `"Select options"` | Shown when no option is selected. |
| `maxVisibleValues` | `number` | `2` | Number of chips to show before collapsing into a summary. |
| `fullWidth` | `boolean` | `true` | Whether the component takes full container width. |

## SegmentedToggle for View Toggles

`SegmentedToggle` provides a radio-group-style control for switching between mutually exclusive views:

```tsx
"use client";

import { useState } from "react";
import { SegmentedToggle } from "@tomny-dev/uzi";

type ViewMode = "grid" | "list" | "table";

const viewOptions: Array<{ label: React.ReactNode; value: ViewMode }> = [
  { label: "Grid", value: "grid" },
  { label: "List", value: "list" },
  { label: "Table", value: "table" },
];

export function ViewModeToggle() {
  const [mode, setMode] = useState<ViewMode>("grid");

  return (
    <SegmentedToggle
      options={viewOptions}
      value={mode}
      onChange={setMode}
      aria-label="View mode"
    />
  );
}
```

Key props:

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `{ label: ReactNode; value: T; disabled?: boolean }[]` | — | Toggle options. Labels can be strings or JSX. |
| `value` | `T` (extends `string`) | — | Currently selected value (controlled). |
| `onChange` | `(value: T) => void` | — | Called with the new value on selection. |
| `aria-label` | `string` | — | Accessible label for the radiogroup. |
| `className` | `string` | — | Custom class for styling overrides via `cx`. |

The component supports keyboard navigation — arrow keys move focus and select, Home/End jump to first/last enabled option.

## Checkbox in a Form Group

`Checkbox` is a native HTML checkbox primitive. Pair it with `Label` for accessible form groups:

```tsx
"use client";

import { useState } from "react";
import { Checkbox, Label } from "@tomny-dev/uzi";

export function PreferencesForm() {
  const [preferences, setPreferences] = useState({
    newsletter: false,
    notifications: true,
    darkMode: false,
  });

  return (
    <fieldset style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <legend style={{ fontWeight: 600, marginBottom: 4 }}>Preferences</legend>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Checkbox
          id="newsletter"
          checked={preferences.newsletter}
          onChange={(e) =>
            setPreferences((prev) => ({ ...prev, newsletter: e.target.checked }))
          }
        />
        <Label htmlFor="newsletter">Subscribe to newsletter</Label>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Checkbox
          id="notifications"
          checked={preferences.notifications}
          onChange={(e) =>
            setPreferences((prev) => ({ ...prev, notifications: e.target.checked }))
          }
        />
        <Label htmlFor="notifications">Enable push notifications</Label>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Checkbox
          id="darkMode"
          checked={preferences.darkMode}
          onChange={(e) =>
            setPreferences((prev) => ({ ...prev, darkMode: e.target.checked }))
          }
        />
        <Label htmlFor="darkMode">Use dark mode</Label>
      </div>
    </fieldset>
  );
}
```

`Checkbox` accepts all standard `HTMLInputAttributes` — `id`, `name`, `checked`, `onChange`, `disabled`, `required`. It renders a native `<input type="checkbox">` with uzi's CSS module styling applied.