#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const COMPONENTS = {
  Button: {
    description: "Polymorphic button. Renders as <button> by default or <a> with as='a'. Supports asChild for custom element composition.",
    props: {
      variant: { type: "ButtonVariant", default: "default", options: ["default", "primary", "secondary", "outline", "ghost", "destructive", "link"] },
      size: { type: "ButtonSize", default: "default", options: ["default", "sm", "md", "lg", "icon"] },
      as: { type: '"button" | "a"', default: '"button"' },
      asChild: { type: "boolean", default: false, description: "Merge props onto the immediate child element (Radix Slot pattern)" },
      className: { type: "string", optional: true },
      children: { type: "ReactNode" },
    },
    examples: [
      '<Button variant="primary" onClick={handleSubmit}>Save</Button>',
      '<Button variant="outline" size="sm">Cancel</Button>',
      '<Button as="a" href="/dashboard">Go to dashboard</Button>',
      '<Button variant="destructive">Delete</Button>',
      '<Button asChild><Link href="/home">Home</Link></Button>',
    ],
    notes: "variant='default' resolves to primary styling. size='default' resolves to md.",
  },

  Avatar: {
    description: "Profile image with fallback states. Built on Radix UI Avatar.",
    props: {
      src: { type: "string", optional: true },
      alt: { type: "string" },
      fallback: { type: "string", description: "Initials or short text shown when image fails" },
      size: { type: "AvatarSize", default: "md", options: ["sm", "md", "lg"] },
    },
    examples: [
      '<Avatar src={user.avatarUrl} alt={user.name} fallback="TM" />',
      '<Avatar alt="Jane Doe" fallback="JD" size="lg" />',
    ],
    notes: "Use AvatarImage and AvatarFallback sub-components for full Radix composition if needed.",
  },

  Card: {
    description: "Surface container with tone and padding control. Can render as div, section, or article.",
    props: {
      tone: { type: "CardTone", default: "default", options: ["default", "muted", "contrast"] },
      padding: { type: "CardPadding", default: "md", options: ["none", "sm", "md", "lg"] },
      as: { type: '"div" | "section" | "article"', default: '"div"' },
      interactive: { type: "boolean", default: false, description: "Adds hover/focus lift and outline affordance" },
      className: { type: "string", optional: true },
      children: { type: "ReactNode" },
    },
    examples: [
      '<Card tone="muted" padding="lg"><p>Content here</p></Card>',
      '<Card as="section" interactive onClick={handleClick}>Clickable card</Card>',
    ],
  },

  Pill: {
    description: "Inline badge or tag for statuses, labels, and counts.",
    props: {
      children: { type: "ReactNode" },
      size: { type: "PillSize", optional: true },
      tone: { type: "PillTone", optional: true },
      className: { type: "string", optional: true },
    },
    examples: [
      '<Pill>Beta</Pill>',
      '<Pill tone="success">Active</Pill>',
      '<Pill size="sm">New</Pill>',
    ],
  },

  Modal: {
    description: "Accessible overlay dialog with backdrop, header, body, and optional footer.",
    props: {
      open: { type: "boolean" },
      onClose: { type: "() => void" },
      title: { type: "string" },
      subtitle: { type: "string", optional: true },
      size: { type: "ModalSize", default: "md", options: ["sm", "md", "lg"] },
      children: { type: "ReactNode", description: "Body content between header and footer" },
      footer: { type: "ReactNode", optional: true, description: "Action buttons rendered in the footer row" },
    },
    examples: [
      `<Modal open={isOpen} onClose={() => setIsOpen(false)} title="Confirm delete" footer={
  <>
    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
    <Button variant="destructive" onClick={handleDelete}>Delete</Button>
  </>
}>
  <p>This action cannot be undone.</p>
</Modal>`,
    ],
    notes: "Backdrop click closes the modal. Close button is always shown in the header.",
  },

  ToastProvider: {
    description: "Context provider that enables useToast() throughout the subtree.",
    props: {
      children: { type: "ReactNode" },
      config: {
        type: "ToastConfig",
        optional: true,
        shape: {
          position: { type: "ToastPosition", default: "top-right", options: ["top-right", "top-left", "top-center", "bottom-right", "bottom-left", "bottom-center"] },
          maxToasts: { type: "number", default: 5 },
          defaultDuration: { type: "number", default: 4000, description: "ms" },
          pauseOnHover: { type: "boolean", default: true },
          pauseOnFocusLoss: { type: "boolean", default: true },
        },
      },
    },
    examples: [
      `// Wrap your app once
<ToastProvider config={{ position: "bottom-right", maxToasts: 3 }}>
  <App />
</ToastProvider>`,
    ],
  },

  useToast: {
    description: "Hook to trigger and dismiss toasts. Must be called within a ToastProvider.",
    returns: {
      push: "(message: string, options?: ToastOptions) => string — generic toast, returns id",
      success: "(message: string, options?: ToastOptions) => string",
      error: "(message: string, options?: ToastOptions) => string — default duration 6000ms",
      warning: "(message: string, options?: ToastOptions) => string",
      info: "(message: string, options?: ToastOptions) => string",
      dismiss: "(id: string) => void",
      dismissAll: "() => void",
      toasts: "Toast[] — current active toasts",
    },
    examples: [
      `const toast = useToast();
toast.success("Saved!");
toast.error("Something went wrong.");
toast.push("Custom message", { type: "warning", duration: 3000 });
const id = toast.info("Loading...", { dismissible: false });
toast.dismiss(id);`,
      `// With action button
toast.success("File uploaded", {
  action: { label: "View", onClick: () => navigate("/files") },
});`,
    ],
    notes: "ToastOptions: { type, duration, dismissible, action: { label, onClick } }",
  },

  Input: {
    description: "Styled text input primitive. Accepts all standard HTML input attributes.",
    props: {
      className: { type: "string", optional: true },
      "...rest": { type: "React.InputHTMLAttributes<HTMLInputElement>" },
    },
    examples: [
      '<Input type="text" placeholder="Enter name" value={name} onChange={e => setName(e.target.value)} />',
      '<Input type="email" required />',
    ],
  },

  Label: {
    description: "Semantic form label primitive.",
    props: {
      htmlFor: { type: "string", optional: true },
      children: { type: "ReactNode" },
      className: { type: "string", optional: true },
    },
    examples: [
      '<Label htmlFor="email">Email address</Label>',
    ],
  },

  Checkbox: {
    description: "Styled checkbox input primitive.",
    props: {
      checked: { type: "boolean", optional: true },
      onChange: { type: "React.ChangeEventHandler<HTMLInputElement>", optional: true },
      className: { type: "string", optional: true },
      "...rest": { type: "React.InputHTMLAttributes<HTMLInputElement>" },
    },
    examples: [
      '<Checkbox checked={agreed} onChange={e => setAgreed(e.target.checked)} />',
    ],
  },

  Select: {
    description: "Styled native select field for choosing one option. Use for forms and filters when you want native keyboard, accessibility, and mobile picker behavior.",
    props: {
      options: { type: "SelectOption[]", description: "Array of { label: string; value: string }" },
      value: { type: "string" },
      onChange: { type: "(value: string) => void" },
      placeholder: { type: "string", optional: true, description: "Placeholder label shown for the empty option" },
      allowEmptyOption: { type: "boolean", default: false, description: "When true, the placeholder remains selectable as the empty option" },
      fullWidth: { type: "boolean", default: true, description: "Stretch to fill the container. Set false for compact inline controls." },
      className: { type: "string", optional: true },
      "...rest": { type: "React.SelectHTMLAttributes<HTMLSelectElement>" },
    },
    examples: [
      `<Select
  options={[{ label: "Queued", value: "queued" }, { label: "Running", value: "running" }]}
  value={status}
  onChange={setStatus}
/>`,
      `<Select
  options={[{ label: "React", value: "react" }, { label: "Vue", value: "vue" }]}
  value={framework}
  onChange={setFramework}
  placeholder="All frameworks"
  allowEmptyOption
/>`,
    ],
    notes: "Prefer Select over Dropdown for value selection. Use DropdownMenu for action menus.",
  },

  Dropdown: {
    description: "Deprecated compatibility alias for Select. Use Select for value selection and DropdownMenu for action menus.",
    props: {
      options: { type: "DropdownOption[]", description: "Array of { label: string; value: string }" },
      value: { type: "string" },
      onChange: { type: "(value: string) => void" },
      placeholder: { type: "string", optional: true },
      allowClear: { type: "boolean", default: true },
      className: { type: "string", optional: true },
    },
    examples: [
      `<Dropdown
  options={[{ label: "React", value: "react" }, { label: "Vue", value: "vue" }]}
  value={framework}
  onChange={setFramework}
  placeholder="Select framework"
  allowClear
/>`,
    ],
    notes: "Deprecated during migration. Prefer Select for new code. For richer menu interactions (checkboxes, submenus, icons), use DropdownMenu instead.",
  },

  DropdownMenu: {
    description: "Radix-based action menu with full composition API. Use for context menus, action lists, and menus with icons or submenus.",
    subComponents: [
      "DropdownMenu (Root)",
      "DropdownMenuTrigger",
      "DropdownMenuContent",
      "DropdownMenuItem",
      "DropdownMenuCheckboxItem",
      "DropdownMenuRadioGroup",
      "DropdownMenuRadioItem",
      "DropdownMenuGroup",
      "DropdownMenuSeparator",
      "DropdownMenuLabel",
      "DropdownMenuSub",
      "DropdownMenuSubTrigger",
      "DropdownMenuSubContent",
      "DropdownMenuPortal",
    ],
    examples: [
      `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onSelect={() => handleEdit()}>Edit</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive" onSelect={() => handleDelete()}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
    ],
  },

  AppShell: {
    description: "Responsive app layout with collapsible sidebar and sticky topbar. Main area has no default padding — each page manages its own padding and max-width.",
    props: {
      sidebar: { type: "ReactNode" },
      brand: { type: "ReactNode", optional: true, description: "Brand/logo element in the topbar" },
      brandHref: { type: "string", optional: true },
      topbarStart: { type: "ReactNode", optional: true, description: "Content after the brand on the left of the topbar" },
      topbarEnd: { type: "ReactNode", optional: true, description: "Content aligned to the right of the topbar (e.g. user menu, theme toggle)" },
      children: { type: "ReactNode", description: "Main content area" },
      sidebarWidth: { type: "number | string", optional: true, description: "Sidebar width, e.g. '18rem' or 260" },
      mainClassName: { type: "string", optional: true },
      sidebarClassName: { type: "string", optional: true },
      topbarClassName: { type: "string", optional: true },
      className: { type: "string", optional: true },
      closeSidebarOnChangeKey: { type: "unknown", optional: true, description: "Close mobile sidebar when this value changes (e.g. pathname)" },
      onSidebarToggle: { type: "(open: boolean) => void", optional: true },
    },
    examples: [
      `<AppShell
  brand={<span>My App</span>}
  topbarEnd={<UserMenu />}
  sidebar={<SidebarNav items={navItems} currentPath={pathname} />}
  sidebarWidth="18rem"
  closeSidebarOnChangeKey={pathname}
>
  <div className="mx-auto w-full max-w-7xl px-4 py-6">
    {children}
  </div>
</AppShell>`,
    ],
  },

  SidebarNav: {
    description: "Sidebar navigation list. Typically used inside AppShell.",
    props: {
      items: { type: "SidebarNavItem[]", description: "Array of { label: string; href: string; icon?: ReactNode; active?: boolean }" },
      className: { type: "string", optional: true },
    },
    examples: [
      `<SidebarNav items={[
  { label: "Dashboard", href: "/", icon: <HomeIcon />, active: true },
  { label: "Settings", href: "/settings", icon: <GearIcon /> },
]} />`,
    ],
  },

  ThemeProvider: {
    description: "Theme context provider. Supports light/dark/system with accent color control and localStorage persistence.",
    props: {
      theme: { type: "UziTheme", optional: true, options: ["light", "dark", "system"], description: "Controlled theme" },
      defaultTheme: { type: "UziTheme", default: "system" },
      accent: { type: "UziAccent", optional: true, options: ["blue", "violet", "emerald", "amber", "rose"] },
      defaultAccent: { type: "UziAccent", default: "blue" },
      storageKey: { type: "string", default: '"uzi-theme"', description: "localStorage key" },
      onThemeChange: { type: "(theme: UziResolvedTheme) => void", optional: true },
      onAccentChange: { type: "(accent: UziAccent) => void", optional: true },
      children: { type: "ReactNode" },
    },
    examples: [
      `<ThemeProvider defaultTheme="system" defaultAccent="violet">
  <App />
</ThemeProvider>`,
    ],
    notes: "Sets data-uzi-theme and data-uzi-accent on <html>. Use useTheme() to read/set theme from within the tree.",
  },

  useTheme: {
    description: "Hook to read and control the current theme and accent.",
    returns: {
      theme: "UziTheme — current setting (light | dark | system)",
      resolvedTheme: "UziResolvedTheme — actual applied theme (light | dark)",
      accent: "UziAccent",
      setTheme: "(theme: UziTheme) => void",
      setAccent: "(accent: UziAccent) => void",
      toggleTheme: "() => void — toggles between light and dark",
    },
    examples: [
      `const { resolvedTheme, toggleTheme, setAccent } = useTheme();
<button onClick={toggleTheme}>{resolvedTheme === "dark" ? "Light" : "Dark"} mode</button>`,
    ],
  },

  cx: {
    description: "Utility for conditional class name merging. Filters falsy values and joins with spaces.",
    signature: "cx(...values: Array<string | false | null | undefined>): string",
    examples: [
      "cx('button', isPrimary && 'button-primary', className)",
      "cx(styles.base, isActive && styles.active, props.className)",
    ],
  },
};

const ALL_COMPONENT_NAMES = Object.keys(COMPONENTS);

const server = new McpServer({
  name: "uzi",
  version: "0.1.0",
});

server.tool(
  "get_component",
  "Get full API docs, props, and usage examples for a specific uzi component or hook.",
  { name: z.string().describe("Component or hook name, e.g. Button, useToast, Modal") },
  async ({ name }) => {
    const key = ALL_COMPONENT_NAMES.find(k => k.toLowerCase() === name.toLowerCase());
    if (!key) {
      return {
        content: [{
          type: "text",
          text: `Unknown component: "${name}". Available: ${ALL_COMPONENT_NAMES.join(", ")}`,
        }],
        isError: true,
      };
    }
    const doc = COMPONENTS[key];
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ component: key, ...doc }, null, 2),
      }],
    };
  }
);

server.tool(
  "list_components",
  "List all available components and hooks in @tomny-dev/uzi with a one-line description.",
  {},
  async () => {
    const list = ALL_COMPONENT_NAMES.map(name => {
      const doc = COMPONENTS[name];
      const desc = doc.description.split(".")[0];
      return `${name}: ${desc}`;
    }).join("\n");
    return {
      content: [{
        type: "text",
        text: list,
      }],
    };
  }
);

server.tool(
  "get_examples",
  "Get usage examples for one or more uzi components.",
  { names: z.array(z.string()).describe("Component or hook names") },
  async ({ names }) => {
    const results = names.map(name => {
      const key = ALL_COMPONENT_NAMES.find(k => k.toLowerCase() === name.toLowerCase());
      if (!key) return `${name}: not found`;
      const doc = COMPONENTS[key];
      const examples = doc.examples ?? [];
      return `### ${key}\n${examples.map(e => "```tsx\n" + e + "\n```").join("\n")}`;
    });
    return {
      content: [{
        type: "text",
        text: results.join("\n\n"),
      }],
    };
  }
);

server.tool(
  "find_component",
  "Find which uzi component to use for a given UI need (search by keyword or description).",
  { query: z.string().describe("What you're trying to build, e.g. 'notification', 'dropdown menu', 'layout'") },
  async ({ query }) => {
    const q = query.toLowerCase();
    const keywords = {
      Button: ["button", "click", "action", "submit", "link", "cta"],
      Avatar: ["avatar", "profile", "user image", "initials", "photo"],
      Card: ["card", "surface", "container", "panel", "box"],
      Pill: ["badge", "tag", "pill", "label", "status", "chip"],
      Modal: ["modal", "dialog", "overlay", "popup", "confirmation"],
      ToastProvider: ["toast", "notification", "alert", "snackbar", "provider"],
      useToast: ["toast", "notification", "notify", "success", "error message"],
      Input: ["input", "text field", "form", "text"],
      Label: ["label", "form label"],
      Checkbox: ["checkbox", "check", "toggle", "boolean"],
      Select: ["select", "picker", "option", "form select", "native select"],
      Dropdown: ["dropdown", "deprecated select", "legacy picker"],
      DropdownMenu: ["menu", "context menu", "action menu", "radix dropdown", "submenu"],
      AppShell: ["layout", "shell", "app layout", "sidebar layout"],
      SidebarNav: ["sidebar", "navigation", "nav", "side menu"],
      ThemeProvider: ["theme", "dark mode", "light mode", "accent", "color scheme"],
      useTheme: ["theme", "dark mode", "toggle theme", "accent"],
      cx: ["classname", "class", "conditional style", "utility"],
    };

    const matches = ALL_COMPONENT_NAMES.filter(name => {
      const kws = keywords[name] ?? [];
      return kws.some(kw => q.includes(kw)) || name.toLowerCase().includes(q);
    });

    if (matches.length === 0) {
      return {
        content: [{
          type: "text",
          text: `No direct match for "${query}". Try list_components to browse all components.`,
        }],
      };
    }

    const results = matches.map(name => {
      const doc = COMPONENTS[name];
      return `**${name}**: ${doc.description}`;
    });

    return {
      content: [{
        type: "text",
        text: results.join("\n\n"),
      }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
