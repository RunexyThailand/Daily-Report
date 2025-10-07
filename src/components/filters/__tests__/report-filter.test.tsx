// src/components/filters/__tests__/report-filter.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Mock } from "jest-mock";
import * as nextNav from "next/navigation";
import ReportFilter from "../report-filter"; // <-- adjust if your file name differs

// ---- Mocks ----

// Make useSearchParams stable across renders to avoid loops
const stableParams = new URLSearchParams("");
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(() => stableParams),
}));
const mockedUseSearchParams = nextNav.useSearchParams as unknown as Mock<
  () => URLSearchParams
>;

// Popover → always render children; keep className so we can assert width
jest.mock("@/components/ui/popover", () => {
  const React = require("react") as typeof import("react");
  return {
    Popover: ({ children, open, onOpenChange }: any) => (
      <div data-popover data-open={String(!!open)}>
        {children}
      </div>
    ),
    PopoverTrigger: ({ children }: any) => <div>{children}</div>,
    PopoverContent: ({ children, className }: any) => (
      <div data-testid="popover-content" className={className}>
        {children}
      </div>
    ),
  };
});

// Calendar → simple button that calls onSelect with a known range
jest.mock("@/components/ui/calendar", () => {
  const React = require("react") as typeof import("react");
  return {
    Calendar: ({ onSelect }: any) => (
      <button
        aria-label="mock-calendar"
        onClick={() =>
          onSelect({
            from: new Date("2025-10-01T12:00:00Z"),
            to: new Date("2025-10-03T12:00:00Z"),
          })
        }
      >
        Pick Range
      </button>
    ),
  };
});

// Selected (lowercase path) → render a native <select> for easy testing
jest.mock("@/components/form/selected", () => {
  const React = require("react") as typeof import("react");
  return {
    __esModule: true,
    default: ({
      options,
      value,
      onChange,
      includeAll,
      allLabel,
      placeholder,
      triggerClassName,
    }: any) => (
      <select
        aria-label={placeholder ?? allLabel ?? "select"}
        className={triggerClassName}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {includeAll && <option value="all">{allLabel ?? "All"}</option>}
        {options?.map((o: any) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    ),
  };
});

// ---- Fixtures ----
const projects = [
  { id: "p1", label: "Project A" },
  { id: "p2", label: "Project B" },
];
const tasks = [
  { id: "t1", label: "Task A" },
  { id: "t2", label: "Task B" },
];
const users = [
  { id: "u1", label: "Alice" },
  { id: "u2", label: "Bob" },
];

function setup(onChange = jest.fn()) {
  return render(
    <ReportFilter
      projects={projects}
      tasks={tasks}
      users={users}
      onChange={onChange}
    />,
  );
}

// ---- Tests ----
describe("<ReportFilter />", () => {
  test("renders default state with 'Pick date range'", () => {
    setup();
    expect(screen.getByText("Pick date range")).toBeInTheDocument();
  });

  test("calendar selection then Apply emits correct ISO with Bangkok timezone", async () => {
    const onChange = jest.fn();
    setup(onChange);

    // Pick range (onRangeChange emits once immediately)
    await userEvent.click(screen.getByLabelText("mock-calendar"));
    // Click Apply (emit again with same values)
    await userEvent.click(screen.getByRole("button", { name: /apply/i }));

    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1)![0];

    // "all" maps to empty string
    expect(last.projectId).toBe("");
    expect(last.taskId).toBe("");
    expect(last.userId).toBe("");

    // from: 2025-10-01T00:00:00+07:00
    // to:   2025-10-03T23:59:59.999+07:00
    expect(last.from).toMatch(/^2025-10-01T00:00:00/);
    expect(last.from).toMatch(/\+07:00$/);
    expect(last.to).toMatch(/^2025-10-03T23:59:59\.999/);
    expect(last.to).toMatch(/\+07:00$/);
  });

  test("changing project to a concrete ID emits that ID (others empty)", async () => {
    const onChange = jest.fn();
    setup(onChange);

    const projectSelect = screen.getByRole("combobox", {
      name: /All projects/i,
    });
    await userEvent.selectOptions(projectSelect, "p1");

    const last = onChange.mock.calls.at(-1)![0];
    expect(last.projectId).toBe("p1");
    expect(last.taskId).toBe("");
    expect(last.userId).toBe("");
  });

  test("reset clears everything and emits empty strings", async () => {
    const onChange = jest.fn();
    setup(onChange);

    // choose a user first
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: /Everyone/i }),
      "u2",
    );

    await userEvent.click(screen.getByRole("button", { name: /reset/i }));

    const last = onChange.mock.calls.at(-1)![0];
    expect(last).toEqual({
      projectId: "",
      taskId: "",
      userId: "",
      from: "",
      to: "",
    });
    expect(screen.getByText("Pick date range")).toBeInTheDocument();
  });

  test("PopoverContent has the width classes we set", () => {
    setup();
    const pop = screen.getByTestId("popover-content");
    expect(pop).toHaveClass("w-[560px]");
    expect(pop).toHaveClass("sm:w-[640px]");
  });

  test("initial range is read from search params and shown on the button", () => {
    // Make the next call of useSearchParams return query with dates
    mockedUseSearchParams.mockReturnValueOnce(
      new URLSearchParams("from=2025-10-01&to=2025-10-02"),
    );
    setup();
    expect(screen.getByText(/2025-10-01\s—\s2025-10-02/)).toBeInTheDocument();
  });
});
