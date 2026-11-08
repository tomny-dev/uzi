import { ToolLoopAgent, stepCountIs, type LanguageModel, type ToolSet } from 'ai';

type SDKAgentSettings = ConstructorParameters<typeof ToolLoopAgent>[0];

export interface HarnessAgentOptions {
  /** Server-controlled model; use any AI SDK 7 provider or your LiteLLM model. */
  readonly model: LanguageModel;
  /** Trusted, application-owned instructions (never raw user text). */
  readonly instructions: string;
  /** Application-specific AI SDK tools; authorization remains with the application. */
  readonly tools?: ToolSet;
  /** AI SDK native per-step policy (e.g. reserve a tool-free final answer). */
  readonly prepareStep?: SDKAgentSettings['prepareStep'];
  /** Optional output and retry limits passed directly to AI SDK. */
  readonly maxOutputTokens?: number;
  readonly maxRetries?: number;
  /** AI SDK native total/step/chunk timeout; request cancellation belongs in stream(). */
  readonly timeout?: SDKAgentSettings['timeout'];
  /** SDK lifecycle events. Do not log prompt text, tool inputs or sensitive outputs by default. */
  readonly onStart?: SDKAgentSettings['onStart'];
  readonly onStepStart?: SDKAgentSettings['onStepStart'];
  readonly onToolExecutionStart?: SDKAgentSettings['onToolExecutionStart'];
  readonly onToolExecutionEnd?: SDKAgentSettings['onToolExecutionEnd'];
  readonly onStepEnd?: SDKAgentSettings['onStepEnd'];
  readonly onEnd?: SDKAgentSettings['onEnd'];
  readonly onAbort?: SDKAgentSettings['onAbort'];
  readonly onError?: SDKAgentSettings['onError'];
  /** Bounded SDK agent steps. Default: 6, maximum: 20. */
  readonly maxSteps?: number;
}

/**
 * Configure AI SDK's native agent loop without reimplementing streaming,
 * tool execution, retries, persistence, or provider adapters.
 *
 * Create the agent inside each authenticated request if its tools or callbacks
 * close over user-specific data. Pass the request abortSignal to agent.stream().
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
    ...(options.maxOutputTokens !== undefined ? { maxOutputTokens: options.maxOutputTokens } : {}),
    ...(options.maxRetries !== undefined ? { maxRetries: options.maxRetries } : {}),
    ...(options.timeout !== undefined ? { timeout: options.timeout } : {}),
    ...(options.onStart ? { onStart: options.onStart } : {}),
    ...(options.onStepStart ? { onStepStart: options.onStepStart } : {}),
    ...(options.onToolExecutionStart ? { onToolExecutionStart: options.onToolExecutionStart } : {}),
    ...(options.onToolExecutionEnd ? { onToolExecutionEnd: options.onToolExecutionEnd } : {}),
    ...(options.onStepEnd ? { onStepEnd: options.onStepEnd } : {}),
    ...(options.onEnd ? { onEnd: options.onEnd } : {}),
    ...(options.onAbort ? { onAbort: options.onAbort } : {}),
    ...(options.onError ? { onError: options.onError } : {}),
    stopWhen: stepCountIs(maxSteps),
  });
}
