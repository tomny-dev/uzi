import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button/Button";
import { Inline, Stack } from "../layout-primitives/LayoutPrimitives";
import {
  Conversation,
  ConversationAttachments,
  ConversationComposer,
  ConversationHeader,
  ConversationMessage,
  ConversationMessages,
  ConversationStatus,
} from "./Conversation";

const meta = {
  title: "Layout/Conversation",
  component: Conversation,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Conversation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ height: "36rem" }}>
      <Conversation>
        <ConversationHeader>
          <div style={{ padding: "0.75rem 1rem" }}>
            <Inline justify="between" align="center">
              <strong>Assistant</strong>
              <Button size="sm" variant="ghost">New</Button>
            </Inline>
          </div>
        </ConversationHeader>
        <ConversationMessages>
          <ConversationMessage role="assistant" label="Assistant">
            How can I help?
          </ConversationMessage>
          <ConversationMessage role="user" label="You">
            Compare these options for me.
          </ConversationMessage>
          <ConversationStatus>Assistant is thinking…</ConversationStatus>
        </ConversationMessages>
        <ConversationAttachments>
          <div style={{ padding: "0.5rem 1rem" }}>2 attachments</div>
        </ConversationAttachments>
        <ConversationComposer>
          <div style={{ padding: "0.75rem 1rem" }}>
            <Stack gap="sm">
              <div>Application-provided composer goes here.</div>
              <Inline justify="end"><Button size="sm">Send</Button></Inline>
            </Stack>
          </div>
        </ConversationComposer>
      </Conversation>
    </div>
  ),
};
