import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  EmptyState,
  Inline,
  PageContainer,
  PageHeader,
  SectionHeader,
  Stack,
  Stat,
  StatGroup,
} from "../index";

describe("application scaffolding primitives", () => {
  it("renders page and section headings with requested semantics", () => {
    render(
      <>
        <PageHeader title="Dashboard" description="Overview" eyebrow="Workspace" headingLevel={5} />
        <SectionHeader title="Recent activity" headingLevel={6} />
      </>,
    );

    expect(screen.getByRole("heading", { level: 5, name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 6, name: "Recent activity" })).toBeInTheDocument();
    expect(screen.getByText("Workspace")).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
  });

  it("renders empty-state actions and configurable heading semantics", () => {
    render(
      <>
        <EmptyState
          title="No results"
          description="Try another filter."
          headingLevel={1}
          primaryAction={<button type="button">Clear filters</button>}
        />
        <StatGroup columns={2}>
          <Stat label="Wins" value="12" detail="This month" />
          <Stat label="Losses" value="4" />
        </StatGroup>
      </>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "No results" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
    expect(screen.getByText("Wins")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("renders generic layout composition without requiring domain props", () => {
    render(
      <PageContainer data-testid="container" maxWidth="xl">
        <Stack gap="lg">
          <Inline justify="between" align="baseline" wrap={false}>
            <span>Left</span>
            <span>Right</span>
          </Inline>
        </Stack>
      </PageContainer>,
    );

    expect(screen.getByTestId("container")).toBeInTheDocument();
    expect(screen.getByText("Left")).toBeInTheDocument();
    expect(screen.getByText("Right")).toBeInTheDocument();
  });
});
