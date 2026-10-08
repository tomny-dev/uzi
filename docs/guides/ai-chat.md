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
| `prepareSendMessagesRequest` | AI SDK transport callback | — | Customize body serialization for APIs requiring a strict shape |
| `sessionKey` | `string \| number` | — | Reset the chat when the signed-in user or security principal changes |
| `messageLimit` | `number` | `8` | Maximum user turns before starting a new chat |
| `inputAriaLabel` | `string` | `Message` | Accessible name for the textarea |
| `inputPlaceholder` | `string` | `Ask a question...` | Message input prompt |
| `inputMaxLength` | `number` | `2000` | HTML textarea maximum length |
| `components` | `AIChatComponents` | built-in renderers | Override message, reasoning, source, data and error presentation |
| `onClose` | `() => void` | — | Optional close action |
| `className`, `style` | React props | — | Custom outer container styling |

By default, the transport includes AI SDK chat ID, messages and runtime context fields. When an API requires *only* `{ messages }` in the body, supply `prepareSendMessagesRequest={({ messages }) => ({ body: { messages } })}`. This callback replaces the default serializer: ensure any required scope or other authorized fields are explicitly included. Don't overwrite those fields when implementing middleware. If `scope` is set, requests include that identifier in the body. Labels are never sent as scope IDs.

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

## Existing / specialized runtimes: `AIChatView`

Use the exported **controlled** `AIChatView` when your application already
owns an AI SDK runtime, tool approvals, attachment adapters, persisted history,
or server-derived context. `AIChatView` is presentation-only: it does not
create `AuiProvider`, replace `useChat`, create a transport, reset history,
send messages or invoke tools. The application supplies messages, the draft,
status, actions and custom renderers.

```tsx
"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { AIChatView } from "@tomny-dev/uzi";

export function ExistingChat() {
  const chat = useChat({ /* keep your existing transport and adapters */ });
  const [draft, setDraft] = useState("");
  return (
    <div style={{ height: 520 }}>
      <AIChatView
        messages={chat.messages
          .filter((message) => message.role === "user" || message.role === "assistant")
          .map((message) => ({
            id: message.id,
            role: message.role as "user" | "assistant",
            parts: message.parts,
          }))}
        draft={draft}
        onDraftChange={setDraft}
        status={chat.status}
        error={chat.error}
        onSend={() => {
          if (!draft.trim()) return;
          void chat.sendMessage({ text: draft.trim() });
          setDraft("");
        }}
        onStop={() => void chat.stop()}
        onRetry={() => { chat.clearError(); void chat.regenerate(); }}
        onNewChat={() => { void chat.stop(); chat.setMessages([]); }}
      />
    </div>
  );
}
```

`AIChatView` defaults to **no question limit**. To opt in, pass
`messageLimit`; the simple `AIChat` wrapper still defaults to eight questions.
External consumers can also provide `components.MessageRenderer` for native
tool/approval displays, `composerLeading` for screenshot/attachment controls,
`composerTrailing` for extra actions, `header` for context indicators,
`toolbarActions` for application commands, or `composer` to render an
application-managed composer entirely. These are **render slots**, not
Uzi-owned state machines. No consumer callback is called automatically on
history hydration, identity changes or approval decisions.

For Betty-style workflows, keep `useChat` + `useAISDKRuntime`, the screenshot
attachment adapter, user-scoped storage, contextual prompt preparation,
`addToolApprovalResponse` and approval locks **in the application**. Pass the
existing message parts to `AIChatView` and implement
`components.MessageRenderer` using domain-specific tool/quote identities.
Never transform approvals into plain text or move authorization into Uzi.

The controlled view receives only the supplied messages, so resetting the
authenticated identity and loading history remain the app's responsibility.
No real provider, wager execution or sensitive local storage is needed for the
`ExternallyManagedRuntime` Storybook example.

`AIChat` remains the ready-to-use alternative for basic streaming chat; the
two components share renderers, theme styles and keyboard behavior.

## Standard capabilities shared across applications

The ready-to-use `AIChat` accepts the following **opt-in** capabilities:

- `attachments={{ accept: 'image/png,image/jpeg,image/webp', maxFiles: 3, maxBytesPerFile: 5_000_000 }}` enables a file picker, client validation, staged attachment names, removal and AI SDK `FileList` submissions. Provider and API support for image/text input varies; servers MUST independently validate media types, file sizes and permissions. Unsupported file types must not be enabled merely because the picker can select them.
- `history={{ load, save, clear }}` delegates storage to the application. Keys and access controls must include the authenticated principal and chat scope. The component loads before accepting input, saves complete turns, and clears storage before a new conversation. Avoid saving unsanitized tool outputs or sensitive data in browser storage.
- `sendAutomaticallyWhen` forwards the AI SDK's native continuation predicate to the runtime. When your backend uses approval-required tools, configure an approval-complete predicate (for example `lastAssistantMessageIsCompleteWithApprovalResponses` from `ai`), so continuation is performed by the SDK rather than by injecting JSON text.

For both the default `AIChat` and externally controlled `AIChatView`, tool parts with
`state: 'approval-requested'` and `approval.id` show **Approve/Deny** controls
when `onToolApproval` is available. The default `AIChat` calls the SDK's native
`addToolApprovalResponse({ id, approved })`. The controlled view delegates
to the application's supplied callback, which must invoke the corresponding
native SDK method with its own approval locking and authorization.
Applications can customize the UI using `components.ToolRenderer`, while
keeping the exact tool call and approval IDs intact.

`AIChatView` also supports `attachments`, `onSelectAttachments`,
`onRemoveAttachment`, `attachmentAccept` and `attachmentError` for
application-owned upload adapters.

**Responsibility boundaries:** Uzi provides presentation and forwards SDK
events, but never decides whether an application tool is authorized. Backend
authorization, trusted scoped context, transport persistence, model selection,
approval requirements and tool side effects remain entirely with each app.
Betforge must keep its existing screenshot adapter and bet-approval locking
until matching real-endpoint regression tests prove a migration safe.
