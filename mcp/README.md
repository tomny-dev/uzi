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

### Consumer apps using the npm package

If your consumer app has `@tomny-dev/uzi` installed, point directly at the installed server:

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

## Example prompts

Once connected, ask Claude things like:

- *"What uzi component should I use for a notification banner?"*
- *"Show me how to use the Modal component with a confirmation footer."*
- *"What props does AppShell take?"*
- *"Give me examples for Button and useToast."*
