/**
 * Pure state→label resolution for the inline assistant activity indicator.
 * The approval special cases are handled exactly once: a requested approval
 * always shows the waiting label, and a denied response never shows the
 * application-supplied state label.
 */

export interface ChatActivityLabel {
  /** Name of the in-flight tool part; undefined while no tool is running. */
  readonly toolName?: string;
  /** State of the in-flight tool part (`input-available`, `approval-requested`, `approval-responded`, …). */
  readonly toolState?: string;
  /** True when the pending approval response was an approval. */
  readonly approved?: boolean;
  /** Application-owned labels keyed by tool name and by `tool:state`. */
  readonly toolActivityLabels?: Readonly<Record<string, string>>;
  /** Fallback label used while no tool is running. */
  readonly activityLabel: string;
}

const APPROVAL_REQUESTED_LABEL = 'Waiting for approval…';
const APPROVAL_RESPONSE_LABEL = 'Processing approval response…';
const GENERIC_TOOL_LABEL = 'Using a tool…';

export function resolveChatActivityLabel({
  toolName,
  toolState,
  approved = false,
  toolActivityLabels,
  activityLabel,
}: ChatActivityLabel): string {
  if (toolName === undefined) return activityLabel;
  if (toolState === 'approval-requested') return APPROVAL_REQUESTED_LABEL;
  if (toolState === 'approval-responded') {
    return approved
      ? toolActivityLabels?.[`${toolName}:${toolState}`] ?? toolActivityLabels?.[toolName] ?? GENERIC_TOOL_LABEL
      : APPROVAL_RESPONSE_LABEL;
  }
  return (toolState ? toolActivityLabels?.[`${toolName}:${toolState}`] : undefined)
    ?? toolActivityLabels?.[toolName]
    ?? GENERIC_TOOL_LABEL;
}
