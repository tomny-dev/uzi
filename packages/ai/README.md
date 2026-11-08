# @tomny-dev/ai

Small server-side integration helpers around **AI SDK 7**. This package lives in the Uzi repository but does not import React or `@tomny-dev/uzi`.

> Published independently from the UI package. The dedicated GitHub Actions `Publish AI package` workflow automatically publishes an explicitly versioned release on merge to `main`; do not use the Uzi UI release job for this package.

## Usage in a workspace

```ts
import { createHarnessAgent, createEvidenceRegistry } from '@tomny-dev/ai';
import { tool } from 'ai';

// The application owns provider configuration, authorization and game tools.
const agent = createHarnessAgent({
  model: myLiteLLMModel,
  instructions: 'Use trusted game tools and answer clearly.',
  tools: { searchGame: tool({ description: '...', inputSchema: mySchema, execute: myLookup }) },
  maxSteps: 6,
});
const result = await agent.generate({ prompt: 'Is Create in Prominence II?' });

const citations = createEvidenceRegistry();
const accepted = citations.addVerified({ path: '/minecraft/modpacks/prominence-ii', title: 'Prominence II' });
// accepted === true; invalid paths, blank titles and sources exceeding the
// 100-distinct-source limit return false.
// Only previously verified paths may become answer citations:
const safe = citations.select(['/minecraft/modpacks/prominence-ii', '/invented']);
```

## Boundaries

- AI SDK owns the model loop, tools, provider adapters and streaming. This package **does not** implement a second agent runtime.
- Consumers own retrieval indexes, domain permissions, identity validation, source verification, conversation storage, rate limiting and deployment.
- `createEvidenceRegistry` returns a boolean from `addVerified` and defaults to at most three citations from `select` (configurable 0–20). It does not determine if a claim is true. `addVerified` is for sources validated by application data/tool execution; a model's suggested path must never be added unverified.
- The existing `@tomny-dev/uzi` package remains the UI layer. Uzi's `AIChat` can consume a normal AI SDK stream without depending on the server-side harness.
- Use `pnpm --filter @tomny-dev/ai lint`, `test`, `build`. No migration to the harness is included in this PR.

## Streaming and observability

For apps with existing streaming chat, construct an agent **per authenticated request**
when its tools capture user-specific database access or permissions:

```ts
const agent = createHarnessAgent({
  model: provider(modelId),
  instructions: trustedSystemPrompt,
  tools: authorizedTools,
  maxSteps: 10,
  timeout: { totalMs: 60_000 },
  onStepStart: telemetry.onStepStart,
  onToolExecutionStart: telemetry.onToolExecutionStart,
  onToolExecutionEnd: telemetry.onToolExecutionEnd,
  onStepEnd: telemetry.onStepEnd,
  onEnd: telemetry.onEnd,
  onAbort: telemetry.onAbort,
  onError: telemetry.onError,
});
const result = await agent.stream({
  messages: await convertToModelMessages(validatedMessages),
  abortSignal: request.signal,
});
return result.toUIMessageStreamResponse();
```

All callbacks and timeout options are forwarded to AI SDK 7. They do not
implement a custom loop or capture sensitive request data in Uzi. Pass
`abortSignal` per invocation, not into a globally shared agent. The consuming
app owns message validation, the stream error policy, native SDK approval
continuations, idempotency and authorization for every tool action. Avoid logging
raw prompts, tool arguments, screenshots or financial data.

## Optional web search (AI SDK 7)

The harness supports **model-selected, opt-in public web search** through the
`createWebSearchTool` export. No search provider or network request is activated
by default. A consumer must explicitly configure its backend and attach the
tool to the per-request agent.

```ts
import {
  createHarnessAgent, createSearxngSearch, createWebSearchTool,
} from '@tomny-dev/ai';

const search = createSearxngSearch({
  baseURL: process.env.SEARXNG_BASE_URL!, // trusted server-side HTTPS origin
  timeoutMs: 7_000,
});
const agent = createHarnessAgent({
  model: myLiteLLMModel,
  instructions: trustedApplicationPrompt,
  tools: {
    ...applicationTools, // application owns auth and business logic
    web_search: createWebSearchTool({
      search, maxResults: 5, maxSearchesPerTurn: 3,
      allowQuery: (query) => !query.includes(privateAuthenticatedUserId),
    }),
  },
  maxSteps: 10,
});
const response = await agent.stream({ messages: validatedMessages, abortSignal: request.signal });
return response.toUIMessageStreamResponse();
```

### Behavior and boundaries

- The AI decides **when** current public information is needed. Keep it available
  for public facts and news; avoid unnecessary queries for application data or
  general questions. Search is disabled (tool not registered) when the backend
  is not configured; the app should not claim fresh web access in that case.
- Configure only trusted server-side search endpoints and secrets; never build
  a provider URL from model input. SearXNG uses `GET /search?format=json`
  and requires `json` in its `search.formats` setting (otherwise HTTP 403).
  HTTPS is the default; insecure HTTP requires an explicit opt-in for trusted
  internal deployments. The adapter rejects redirects and oversized responses.
- The provider-neutral `search` callback can instead use a licensed/custom
  API: `({query,limit,timeRange,signal}) => Promise<WebSearchSource[]>`.
  Use the per-request `signal` to honor user cancellation.
- Web search enforces 1–8 sources, 1–5 queries per assistant response, strict
  query lengths, basic secret/PII screening, HTTPS-only public URL validation,
  URL deduplication, stripped tracking parameters, and bounded snippets.
  These safeguards **cannot guarantee privacy**: each application must prevent
  private tool output and attached data from becoming search queries, use its
  own rate limits, control allowed domains/topics if necessary, and monitor usage.
- Results are **untrusted metadata/snippets**, not fully fetched articles.
  Treat search content as data, never instructions; do not infer that snippets
  prove a fact or the date of publication. Present verified source links and
  dates when available, and acknowledge uncertainty if search is empty or fails.
  Do not derive live sportsbook prices, calibrated win probabilities or
  permission to execute financial actions from public search snippets.
- Render `web_search` activity as a short, understandable progress state and
  show clickable sources in the product's chat UI. Search failures should not
  break the entire chat or invite fabricated current facts.
- Add mock-backend tests for results, unsafe URLs, query budgets, backend failure,
  cancellation, invalid JSON and publication-date handling; perform a live
  authenticated search smoke test before enabling in production.

## Shared LiteLLM MCP search provider

Use the existing LiteLLM model gateway's MCP REST API without an extra model
invocation or a new MCP client. Applications only supply the trusted proxy
origin and an authorized virtual key; LiteLLM owns the private MCP connection:

```ts
import { createLiteLLMMcpSearch, createWebSearchTool } from '@tomny-dev/ai';

const search = createWebSearchTool({
  search: createLiteLLMMcpSearch({
    baseURL: process.env.LITELLM_BASE_URL!, // gateway origin only; no /v1 or other path
    apiKey: process.env.LITELLM_API_KEY!, // application-scoped key
  }),
  maxResults: 5,
  maxSearchesPerTurn: 3,
  allowQuery: (query) => appAllowsPublicQuery(query),
});
```

The adapter makes one fixed `POST /mcp-rest/tools/call` request to
`server_id: searxng`, `name: web_search` with `response_format: json`.
It does **not** discover other tools, execute arbitrary MCP operations, or
create an agent. The generic `createWebSearchTool` remains responsible for
validating public query terms, per-response budgets, public HTTPS source URLs,
source deduplication, and cancellation. Each application owns its own
authorization and private-data search policy.

Enable web search explicitly in each application's tool set. Do not assume
that registering an MCP server in LiteLLM automatically injects search into
every ordinary model completion. Verify the deployed LiteLLM gateway and
scoped key can execute the search tool before removing any previous backend.

## Publishing

1. Change the version in `packages/ai/package.json` in a reviewed PR. The
   package manifest is the source of truth; versions are not bumped implicitly.
2. Merge to `main` after CI passes. The dedicated
   `.github/workflows/publish-ai.yml` workflow automatically validates and
   publishes an unpublished version through npm trusted publishing (OIDC).
3. The workflow skips versions already on npm and preserves manual
   `workflow_dispatch` for recovery. No `NPM_TOKEN` is required, and the
   UI package's release workflow is independent.

For MCP clients, use the official `@ai-sdk/mcp` package in the consuming
application. Keep this shared package focused on the AI SDK agent harness,
provider-neutral search tools, and evidence validation; do not implement a
second MCP protocol client in Uzi.
