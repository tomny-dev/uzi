# AI Chat

`AIChat` is a shared, client-side chat interface based on `@assistant-ui/react` and `@assistant-ui/ai-sdk`. Use it when an application needs a consistent streaming-chat surface while keeping authentication, prompt construction, retrieval, tools and access control in the application.

## Quick start

Install Uzi and load its theme/style sheet as documented in [Getting Started](../getting-started.md).

```tsx
"use client";

import { AIChat } from "@tomny-dev/uzi";

export function ProjectChat({ projectId, projectName }: {
  projectId: string;
  projectName: string;
}) {
  return (
    <div style={{ height: 520, width: "100%" }}>
      <AIChat
        api="/api/chat"
        scope={projectId}
        scopeLabel={projectName}
        inputPlaceholder="Ask about this project..."
        messageLimit={8}
      />
    </div>
  );
}
```

Give the component a **bounded parent height**. It uses the available height for its scrollable transcript and pinned composer.

The client posts AI SDK UI messages to `api` and expects a **UI-message stream**, including the `x-vercel-ai-ui-message-stream: v1` response header. A plain JSON response or text stream without the UI-message protocol will not work.

## API contract

| Prop | Type | Default | Description |
|---|---|---|---|
| `api` | `string` | required | URL for the application's chat endpoint |
| `scope` | `string` | — | Opaque resource/workspace identifier sent in request body; the API must authorize it |
| `scopeLabel` | `string` | — | Display-only label; **not** an authorization value |
| `fetch` | `typeof fetch` | browser fetch | Optional custom request implementation; useful for auth or demos |
| `headers` | `Record<string, string>` | — | Additional request headers |
| `credentials` | `RequestCredentials` | browser default | Fetch credentials mode |
| `sessionKey` | `string \| number` | — | Reset the chat when the signed-in user or security principal changes |
| `messageLimit` | `number` | `8` | Maximum user turns before starting a new chat |
| `inputPlaceholder` | `string` | `Ask a question...` | Message input prompt |
| `inputMaxLength` | `number` | `2000` | HTML textarea maximum length |
| `components` | `AIChatComponents` | built-in renderers | Override message, reasoning, source, data and error presentation |
| `onClose` | `() => void` | — | Optional close action |
| `className`, `style` | React props | — | Custom outer container styling |

The transport also includes the AI SDK chat ID, messages and assistant-ui context fields. Don't overwrite those fields when implementing middleware. If `scope` is set, requests include that identifier in the body. Labels are never sent as scope IDs.

### Server responsibilities

Your endpoint must:

1. Authenticate the caller and authorize the supplied `scope`; **do not** trust a client-provided resource ID by itself.
2. Validate the request (including `messages`, role/part structure, size limits and allowed context).
3. Use the authenticated scope to restrict retrieval, tool access and other server-side data.
4. Produce an AI SDK UI-message stream. In an AI SDK route, return `result.toUIMessageStreamResponse()`.
5. Apply rate limits, quotas and logging/retention policies appropriate to your application.

For example, a Next.js route can use `convertToModelMessages(messages)` with `streamText` from `ai` and return `toUIMessageStreamResponse()`. The provider/model and your application's validation, authentication and authorization must be supplied by the consumer. Uzi intentionally does **not** implement those concerns.

For protocol details, see the [AI SDK stream protocol](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol) and [assistant-ui AI SDK runtime](https://www.assistant-ui.com/docs/runtimes/ai-sdk/overview).

## Authenticated requests

For cookie-authenticated same-origin routes, no custom fetch is normally needed. For a custom authorization layer, you can inject a stable fetch callback:

```tsx
"use client";

import { useCallback } from "react";
import { AIChat } from "@tomny-dev/uzi";

export function AuthenticatedChat({ token, userId }: { token: string; userId: string }) {
  const authenticatedFetch = useCallback<typeof fetch>(
    (input, init) => {
      const headers = new Headers(init?.headers);
      headers.set("Authorization", `Bearer ${token}`);
      return fetch(input, { ...init, headers });
    },
    [token],
  );

  return (
    <div style={{ height: 500 }}>
      <AIChat api="/api/chat" fetch={authenticatedFetch} sessionKey={userId} />
    </div>
  );
}
```

Keep authentication on the server regardless of the client configuration. If the auth token changes, recreate the callback so the new value is used. Updating fetch/headers/credentials updates the live transport configuration without discarding the conversation. **When the signed-in identity changes**, change `sessionKey` (or remount `AIChat` from the parent) to discard the prior user's transcript. Do not use a request token or the entire headers object as the session key, because routine token refreshes should not reset the conversation.

## Renderers and UX

`AIChatComponents` provides optional `MessageRenderer`, `ReasoningRenderer`, `SourceRenderer`, `DataRenderer`, and `ErrorRenderer` overrides. A custom `MessageRenderer` should call its provided `renderMessagePart` callback for each message part if you want to retain the standard source/reasoning/data fallback handling.

Supported built-in parts include plain text, collapsible reasoning, linked sources, structured `data-*` parts, tool call payloads and attachments. Text is presented as text (not automatically parsed as Markdown). Only HTTP(S) source/attachment URLs become links. Do not send credentials or internal-only tool output to the browser.

- **Enter** sends a prompt; **Shift+Enter** inserts a newline.
- **Stop** cancels an in-flight response.
- **Retry response** regenerates a failed response without appending the user's question twice.
- **New chat** resets the in-memory session; the user-turn cap also offers a reset.
- Messages are not persisted by the component. **Your endpoint or other infrastructure may still retain requests**.

## Storybook

Open **Components / AIChat** in `pnpm storybook`. The `Default`, `ScopedChat`, `ShortSession`, `CustomRenderers` and `ErrorAndRetry` stories use a dedicated injected mock fetch implementation. You can submit prompts and inspect UI states without providing a real API key or setting up a backend.

Before adopting the component in production, test at least one consumer app against its real streaming endpoint (including auth, multi-part responses, cancellation and error recovery). Storybook mocks and component unit tests do not replace that integration test.
