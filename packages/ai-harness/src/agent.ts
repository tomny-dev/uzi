import { ToolLoopAgent, stepCountIs, type LanguageModel, type ToolSet } from 'ai';

export interface HarnessAgentOptions {
  /** Server-controlled model; use any AI SDK 7 provider or your LiteLLM model. */
  readonly model: LanguageModel;
  /** Trusted, application-owned instructions (never raw user text). */
  readonly instructions: string;
  /** Application-specific AI SDK tools; authorization remains with the application. */
  readonly tools?: ToolSet;
  /** Bounded SDK agent steps. Default: 6, maximum: 20. */
  readonly maxSteps?: number;
}

/**
 * Configure AI SDK's native agent loop without reimplementing streaming,
 * tool execution, retries, persistence, or provider adapters.
 */
export function createHarnessAgent(options: HarnessAgentOptions) {
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
    stopWhen: stepCountIs(maxSteps),
  });
}
