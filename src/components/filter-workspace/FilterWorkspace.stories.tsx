import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FilterBar, FilterChips, FilterPopover } from "./FilterWorkspace";
import { Input } from "../input/Input";
import { Select } from "../select/Select";

const meta = {
  title: "Foundations/Filter Workspace",
  component: FilterBar,
  tags: ["autodocs"],
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OddsExplorer: Story = {
  render: () => {
    function Example() {
      const [history, setHistory] = useState("80");
      const [odds, setOdds] = useState("-300");
      const chips = [
        ...(history ? [{ id: "history", label: `History ≥ ${history}%` }] : []),
        ...(odds ? [{ id: "odds", label: `Odds ≥ ${odds}` }] : []),
      ];
      return <FilterBar
        leading={<Select aria-label="Sportsbooks" value="all" onChange={() => {}} fullWidth={false}
          options={[{ value: "all", label: "All sportsbooks" }]} />}
        search={<Input type="search" aria-label="Find market" placeholder="Search players or markets" />}
        actions={<>
          <FilterPopover activeCount={chips.length}>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <label>Minimum historical % <Input type="number" value={history}
                onChange={event => setHistory(event.target.value)} /></label>
              <label>Minimum odds <Input type="number" value={odds}
                onChange={event => setOdds(event.target.value)} /></label>
            </div>
          </FilterPopover>
          <Select aria-label="Sort odds" value="default" onChange={() => {}} fullWidth={false}
            options={[{ value: "default", label: "Default" }, { value: "best", label: "Best odds" }]} />
        </>}
        activeFilters={<FilterChips chips={chips} onRemove={id => {
          if (id === "history") setHistory("");
          else setOdds("");
        }} onClear={() => { setHistory(""); setOdds(""); }} />}
      />;
    }
    return <Example />;
  },
};
