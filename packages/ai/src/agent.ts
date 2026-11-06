import { ToolLoopAgent, stepCountIs, type LanguageModel, type ToolSet } from 'ai';

export interface HarnessAgentOptions {
  /** Server-controlled model; use any AI SDK 7 provider or your LiteLLM model. */
  readonly model: LanguageModel;
  /** Trusted, application-owned instructions (never raw user text). */
  readonly instructions: string;
  /** Application-specific AI SDK tools; authorization remains with the application. */
  readonly tools?: ToolSet;
  /** AI SDK native per-step policy (e.g. reserve a tool-free final answer). */
  readonly prepareStep?: ConstructorParameters<typeof ToolLoopAgent>[0]['prepareStep'];
  /** Optional output and retry limits passed directly to AI SDK. */
  readonly maxOutputTokens?: number;
  readonly maxRetries?: number;
  /** Bounded SDK agent steps. Default: 6, maximum: 20. */
  readonly maxSteps?: number;
}

/**
 * Configure AI SDK's native agent loop without reimplementing streaming,
 * tool execution, retries, persistence, or provider adapters.
 */
export function createHarnessAgent(options: HarnessAgentOptions): ToolLoopAgent<never, ToolSet> {
  const maxSteps = options.maxSteps ?? 6;
  if (!Number.isInteger(maxSteps) || maxSteps < 1 || maxSteps > 20) {
    throw new RangeError('maxSteps must be an integer from 1 to 20');
  }
  if (!options.instructions.trim()) {
    throw new Error('Trusted instructions must not be empty');
  }
  return new ToolLoopAgent({
    model: options.model,
    instructions: options.instructions,
    tools: options.tools ?? {},
    ...(options.prepareStep ? { prepareStep: options.prepareStep } : {}),
    ...(options.maxOutputTokens !== undefined
      ? { maxOutputTokens: options.maxOutputTokens }
      : {}),
    ...(options.maxRetries !== undefined ? { maxRetries: options.maxRetries } : {}),
    stopWhen: stepCountIs(maxSteps),
  });
}
