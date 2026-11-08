# @tomny-dev/ai

Small server-side integration helpers around **AI SDK 7**. This package lives in the Uzi repository but does not import React or `@tomny-dev/uzi`.

> Published independently from the UI package. Use the dedicated GitHub Actions `Publish AI package` workflow; do not run the existing Uzi release job to publish this package.

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

## Publishing

1. The initial `@tomny-dev/ai@0.1.0` version is already published. In npm package settings, keep the GitHub trusted publisher connected to repository `tomny-dev/uzi` and workflow `publish-ai.yml`.
2. Update `packages/ai/package.json` with the new version in a reviewed PR. The package manifest is the only version source.
3. Run **Actions → Publish AI package → Run workflow** from `main` without inputs. The workflow checks whether that exact version exists, validates the package, then publishes with npm trusted publishing and provenance. Existing versions are not republished; unexpected registry errors stop the workflow.
4. No `NPM_TOKEN` secret is required for this dedicated workflow. The UI's release-please process remains independent.

The workflow intentionally has **no push-triggered publishing**; a maintainer must explicitly dispatch it.
