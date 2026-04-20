# uzi MCP Server

MCP server for `@tomny-dev/uzi`. Gives Claude Code, Codex, and other MCP-compatible AI tools live access to component docs, props, and examples without reading source files.

## Tools

| Tool | Description |
|---|---|
| `list_components` | List all components and hooks with one-line descriptions |
| `get_component` | Full props, types, and notes for a specific component |
| `get_examples` | Usage examples for one or more components |
| `find_component` | Find the right component by keyword or UI description |

## Setup

### Claude Code

Add to your project's `.claude/settings.json` or user-level `settings.json`:

```json
{
  "mcpServers": {
    "uzi": {
      "command": "node",
      "args": ["/absolute/path/to/uzi/mcp/server.js"]
    }
  }
}
```

Or if you're inside the uzi repo itself:

```json
{
  "mcpServers": {
    "uzi": {
      "command": "node",
      "args": ["./mcp/server.js"]
    }
  }
}
```

Then in Claude Code, confirm the server is running:

```
/mcp
```

### Codex

Add to your `codex.json` configuration:

```json
{
  "mcpServers": [
    {
      "name": "uzi",
      "command": "node",
      "args": ["/absolute/path/to/uzi/mcp/server.js"]
    }
  ]
}
```

### Consumer apps

If you want agents to prefer `uzi` in a consumer app, do two things:

1. Add repo guidance in that app's `CLAUDE.md`, `AGENTS.md`, or equivalent telling agents to prefer `@tomny-dev/uzi` for shared UI primitives.
2. Point the MCP server at a checkout of this repo, or at an installed `@tomny-dev/uzi-mcp` package if you publish/install it separately.

Example repo guidance:

```md
## UI Components

- Prefer `@tomny-dev/uzi` for shared UI primitives and layout components.
- Check `uzi` before creating new local primitives.
- Only introduce a repo-local primitive when `uzi` lacks the required behavior or when the component is intentionally app-specific composition.
```

### Important packaging note

The main `@tomny-dev/uzi` npm package currently publishes `dist/` only. It does **not** include `mcp/server.js`, so this config will not work:

```json
{
  "mcpServers": {
    "uzi": {
      "command": "node",
      "args": ["./node_modules/@tomny-dev/uzi/mcp/server.js"]
    }
  }
}
```

Use a checkout of this repo instead:

```json
{
  "mcpServers": {
    "uzi": {
      "command": "node",
      "args": ["/absolute/path/to/uzi/mcp/server.js"]
    }
  }
}
```

## Example prompts

Once connected, ask Claude things like:

- *"What uzi component should I use for a notification banner?"*
- *"Show me how to use the Modal component with a confirmation footer."*
- *"What props does AppShell take?"*
- *"Give me examples for Button and useToast."*
