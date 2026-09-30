import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Conversation,
  ConversationMessage,
  ConversationMessages,
  ConversationStatus,
} from "./Conversation";

describe("Conversation", () => {
  it("renders composable conversation content", () => {
    render(
      <Conversation aria-label="Conversation">
        <ConversationMessages>
          <ConversationMessage role="assistant" label="Assistant">Hello</ConversationMessage>
          <ConversationMessage role="user">Hi</ConversationMessage>
          <ConversationStatus>Thinking</ConversationStatus>
        </ConversationMessages>
      </Conversation>,
    );

    expect(screen.getByLabelText("Conversation")).toBeInTheDocument();
    expect(screen.getByText("Assistant")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Hi")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Thinking");
  });

  it("exposes message roles as data attributes without imposing chat behavior", () => {
    const { container } = render(<ConversationMessage role="system">Context updated</ConversationMessage>);
    expect(container.firstElementChild).toHaveAttribute("data-role", "system");
  });
});
