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

## Publishing

1. For the first publication of `@tomny-dev/ai`, authorize the package on npm (a scoped package may need an initial bootstrap publish using an npm granular access token stored as the repository secret `NPM_TOKEN`).
2. Prefer npm trusted publishing after bootstrap: configure the npm package's GitHub trusted publisher with repository `tomny-dev/uzi` and workflow file `publish-ai.yml`. This requires GitHub-hosted runners and the workflow's OIDC permission.
3. Run **Actions → Publish AI package → Run workflow** from `main` with the exact version in `packages/ai/package.json` (initially `0.1.0`). This workflow installs the frozen workspace lockfile, typechecks, tests, builds, smoke-tests the Node ESM exports, checks package contents, then publishes with provenance.
4. Do not merge a Tultr dependency change until the exact version is visible on npm. The UI's existing release-please configuration remains independent.

The workflow intentionally has **no push-triggered publishing**; a maintainer must explicitly dispatch it.
