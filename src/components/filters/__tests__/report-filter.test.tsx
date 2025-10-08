// __tests__/ReportFilter.test.tsx
import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// 👉 UPDATE THIS PATH:
import ReportFilter from "@/components/filters/report-filter";

// --------------------
// Mocks
// --------------------

// mock for @/lib/utils (no `any`)
jest.mock("@/lib/utils", () => ({
  cn: (...args: Array<string | number | false | null | undefined>): string =>
    args.filter(Boolean).map(String).join(" "),
}));

// Minimal <Button>
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

// in __tests__/ReportFilter.test.tsx (or wherever you mocked Popover)
jest.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: any) => <div data-testid="popover">{children}</div>,
  PopoverTrigger: ({ children }: any) => (
    <div data-testid="trigger">{children}</div>
  ),
  PopoverContent: ({ children }: any) => (
    <div data-testid="content">{children}</div>
  ),
}));

// Simplified Calendar with buttons to simulate range selection/clear
jest.mock("@/components/ui/calendar", () => ({
  Calendar: ({ onSelect }: any) => (
    <div>
      <button
        data-testid="pickRange"
        onClick={() =>
          onSelect?.({
            from: new Date("2025-06-10T14:30:00+07:00"),
            to: new Date("2025-06-18T09:15:00+07:00"),
          })
        }
      >
        pickRange
      </button>
      <button data-testid="clearRange" onClick={() => onSelect?.(undefined)}>
        clearRange
      </button>
    </div>
  ),
}));

// Replace <Selected> with a simple <select>
jest.mock("@/components/form/selected", () => ({
  __esModule: true,
  default: ({
    options,
    value,
    onChange,
    includeAll,
    allLabel,
    placeholder,
  }: any) => (
    <select
      data-testid={placeholder || allLabel || "selected"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {includeAll ? <option value="all">{allLabel || "All"}</option> : null}
      {options?.map((o: any) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));

// Icon noop
jest.mock("lucide-react", () => ({
  Calendar: () => <span />,
  CalendarIcon: () => <span />,
}));

// next-intl: provide deterministic labels
const dict = {
  DailyReportPage: {
    selectDateLabel: "Pick date range",
    allProjectsLabel: "All projects",
    allTasksLabel: "All tasks",
    everyone: "Everyone",
    clear: "Clear",
    apply: "Apply",
    reset: "Reset",
  },
};
jest.mock("next-intl", () => ({
  useTranslations: (ns?: string) => (key: string) =>
    (dict as any)[ns || "DailyReportPage"]?.[key] ?? key,
  useLocale: () => "en",
}));

// next/navigation: configurable mock for search params
const mockSearchParams = new URLSearchParams();
jest.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

// --------------------
// Helpers
// --------------------
const baseOptions = {
  projects: [
    { id: "p1", label: "Project 1" },
    { id: "p2", label: "Project 2" },
  ],
  tasks: [
    { id: "t1", label: "Task 1" },
    { id: "t2", label: "Task 2" },
  ],
  users: [
    { id: "u1", label: "User 1" },
    { id: "u2", label: "User 2" },
  ],
};

function renderFilter(
  overrides: Partial<Parameters<typeof ReportFilter>[0]> = {},
) {
  const onChange = jest.fn();
  render(
    <ReportFilter
      projects={baseOptions.projects}
      tasks={baseOptions.tasks}
      users={baseOptions.users}
      onChange={onChange}
      {...overrides}
    />,
  );
  return { onChange };
}

// --------------------
// Tests
// --------------------
describe("ReportFilter", () => {
  beforeEach(() => {
    mockSearchParams.forEach((_, k) => mockSearchParams.delete(k));
  });

  test("renders placeholder when no date is chosen", () => {
    renderFilter();
    expect(screen.getByTestId("pickDate")).toBeInTheDocument();
    expect(screen.getByTestId("pickDate")).toHaveTextContent("Pick date range");
  });

  test("selecting project/task/user emits combined filters (mapping 'all' → '')", async () => {
    const user = userEvent.setup();
    const { onChange } = renderFilter();

    // change project → p1
    await user.selectOptions(screen.getByTestId("All projects"), "p1");
    // change task → t2
    await user.selectOptions(screen.getByTestId("All tasks"), "t2");
    // change user → u2
    await user.selectOptions(screen.getByTestId("Everyone"), "u2");

    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(last).toMatchObject({
      projectId: "p1",
      taskId: "t2",
      userId: "u2",
      from: "",
      to: "",
    });
  });

  test("applying a picked date range emits ISO with startOfDay/endOfDay (Asia/Bangkok)", async () => {
    const user = userEvent.setup();
    const { onChange } = renderFilter();

    // Simulate selecting range in mocked Calendar
    await user.click(screen.getByTestId("pickRange"));
    // Apply
    await user.click(screen.getByRole("button", { name: "Apply" }));

    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    // start: 2025-06-10T00:00:00+07:00
    // end:   2025-06-18T23:59:59.999+07:00 (we assert only seconds part to avoid ms fragility)
    expect(last.from).toContain("2025-06-10T00:00:00");
    expect(last.to).toContain("2025-06-18T23:59:59");
  });

  test("clearing the range then applying emits empty from/to", async () => {
    const user = userEvent.setup();
    const { onChange } = renderFilter();

    await user.click(screen.getByTestId("pickRange")); // set a range
    await user.click(screen.getByTestId("clearRange")); // clear (onRangeChange(undefined))
    await user.click(screen.getByRole("button", { name: "Apply" })); // emit

    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(last.from).toBe("");
    expect(last.to).toBe("");
  });

  test("Reset button resets everything and emits empty filters", async () => {
    const user = userEvent.setup();
    const { onChange } = renderFilter();

    // Change some filters first
    await user.selectOptions(screen.getByTestId("All projects"), "p2");
    await user.selectOptions(screen.getByTestId("All tasks"), "t1");
    await user.selectOptions(screen.getByTestId("Everyone"), "u1");
    await user.click(screen.getByTestId("pickRange"));
    await user.click(screen.getByRole("button", { name: "Apply" }));

    // Now reset
    await user.click(screen.getByRole("button", { name: "Reset" }));

    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(last).toEqual({
      projectId: "",
      taskId: "",
      userId: "",
      from: "",
      to: "",
    });
  });

  test("reads initial from/to from search params and shows formatted label", () => {
    // Preload URL params
    mockSearchParams.set("from", "2025-06-01T00:00:00+07:00");
    mockSearchParams.set("to", "2025-06-10T23:59:59+07:00");

    renderFilter();

    // The trigger renders yyyy-MM-dd — yyyy-MM-dd when hasDate=true
    expect(screen.getByText("2025-06-01 — 2025-06-10")).toBeInTheDocument();
  });
});
