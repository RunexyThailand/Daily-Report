/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  RangeDatePicker,
  type RangeDatePickerProps,
} from "@/components/filters/range-date-picker";

// ---------- Utilities & polyfills ----------
function mockMatchMedia({ matches }: { matches: boolean }) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches: query.includes("(max-width: 639px)") ? matches : false,
      media: query,
      onchange: null,
      addEventListener: () => void 0,
      removeEventListener: () => void 0,
      // legacy
      addListener: () => void 0,
      removeListener: () => void 0,
      dispatchEvent: () => false,
    }),
  });
}

// ---------- Mocks (type-safe) ----------
jest.mock("@/lib/utils", () => {
  const cn = (...args: Array<string | false | null | undefined>): string =>
    args.filter((v): v is string => typeof v === "string").join(" ");
  return { cn };
});

jest.mock("@/components/ui/popover", () => {
  type PopoverProps = React.PropsWithChildren<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }>;

  const Popover: React.FC<PopoverProps> = ({ children }) => (
    <div data-testid="popover-root">{children}</div>
  );

  const PopoverTrigger: React.FC<React.PropsWithChildren<unknown>> = ({
    children,
  }) => <>{children}</>;

  type PopoverContentProps = React.PropsWithChildren<
    React.HTMLAttributes<HTMLDivElement> & {
      align?: "start" | "center" | "end";
      side?: "top" | "right" | "bottom" | "left";
      sideOffset?: number;
    }
  >;

  const PopoverContent: React.FC<PopoverContentProps> = ({
    children,
    align, // omit from DOM
    side, // omit from DOM
    sideOffset, // omit from DOM
    ...divProps // only DOM-safe props remain
  }) => (
    <div
      role="dialog"
      // ถ้าอยาก assert ค่าเหล่านี้ ก็ใส่เป็น data-* ได้ (ไม่โดนเตือน)
      data-align={align}
      data-side={side}
      data-sideoffset={sideOffset}
      {...divProps}
    >
      {children}
    </div>
  );

  return { Popover, PopoverTrigger, PopoverContent };
});

/** Calendar mock — exposes numberOfMonths via data attribute and two buttons to pick ranges */
jest.mock("@/components/ui/calendar", () => {
  type DateRange = import("react-day-picker").DateRange;
  type Locale = import("date-fns").Locale;

  interface CalendarProps {
    onSelect: (range: DateRange | undefined) => void;
    selected?: DateRange;
    numberOfMonths?: number;
    locale?: Locale;
  }

  const Calendar: React.FC<CalendarProps> = ({ onSelect, numberOfMonths }) => {
    const from = new Date(2025, 5, 10); // 2025-06-10
    const to = new Date(2025, 5, 18); // 2025-06-18
    return (
      <div data-testid="calendar" data-months={numberOfMonths ?? 2}>
        <button onClick={() => onSelect({ from, to })}>pickRange</button>
        <button onClick={() => onSelect({ from, to: undefined })}>
          pickPartial
        </button>
      </div>
    );
  };

  return { Calendar };
});

// ---------- Helpers ----------
function setup(props?: Partial<RangeDatePickerProps>) {
  const onChange = jest.fn<
    void,
    [import("react-day-picker").DateRange | undefined]
  >();
  const defaultProps: RangeDatePickerProps = {
    value: undefined,
    onChange,
    labels: undefined,
    disabled: false,
    responsive: true,
  };
  render(<RangeDatePicker {...defaultProps} {...props} />);
  return { onChange };
}

// ---------- Tests ----------
describe("RangeDatePicker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMatchMedia({ matches: false }); // start as ≥ sm
  });

  test("shows default placeholder when no value is set", () => {
    setup();
    expect(screen.getByTestId("pickDate")).toBeInTheDocument();
    expect(screen.getByText("Select date range")).toBeInTheDocument();
  });

  test("supports custom labels", () => {
    setup({
      labels: {
        selectDateLabel: "Please select a date range",
        clear: "Reset",
        apply: "Confirm",
      },
    });
    expect(screen.getByText("Please select a date range")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  test("formats trigger text when value (from/to) is provided", () => {
    const from = new Date(2025, 5, 10);
    const to = new Date(2025, 5, 18);
    setup({ value: { from, to } });
    expect(screen.getByText("2025-06-10 — 2025-06-18")).toBeInTheDocument();
  });

  test("clicking Clear calls onChange(undefined)", async () => {
    const user = userEvent.setup();
    const { onChange } = setup({
      value: { from: new Date(2025, 5, 10), to: new Date(2025, 5, 18) },
      labels: { clear: "Clear" },
    });
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBeUndefined();
  });

  test("selecting a range then clicking Apply calls onChange with the picked range", async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ labels: { apply: "Apply" } });

    await user.click(screen.getByRole("button", { name: "pickRange" }));
    await user.click(screen.getByRole("button", { name: "Apply" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = onChange.mock.calls[0][0];
    expect(arg?.from).toEqual(new Date(2025, 5, 10));
    expect(arg?.to).toEqual(new Date(2025, 5, 18));
  });

  test("pending selection does not fire onChange until Apply is clicked", async () => {
    const user = userEvent.setup();
    const { onChange } = setup();
    await user.click(screen.getByRole("button", { name: "pickRange" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  test("passes custom numberOfMonths (overrides responsive behavior)", () => {
    setup({ numberOfMonths: 3 });
    const cal = screen.getByTestId("calendar");
    expect(cal.getAttribute("data-months")).toBe("3");
  });

  test("responsive: large screens (≥ sm) default to numberOfMonths = 2", () => {
    mockMatchMedia({ matches: false });
    setup({ numberOfMonths: undefined, responsive: true });
    const cal = screen.getByTestId("calendar");
    expect(cal.getAttribute("data-months")).toBe("2");
  });

  test("responsive: small screens (< sm) default to numberOfMonths = 1", () => {
    mockMatchMedia({ matches: true });
    setup({ numberOfMonths: undefined, responsive: true });
    const cal = screen.getByTestId("calendar");
    expect(cal.getAttribute("data-months")).toBe("1");
  });

  test("uses custom formatString", () => {
    const from = new Date(2025, 5, 1);
    const to = new Date(2025, 5, 2);
    setup({ value: { from, to }, formatString: "dd/MM/yyyy" });
    expect(screen.getByText("01/06/2025 — 02/06/2025")).toBeInTheDocument();
  });

  test("disables the trigger button when disabled=true", () => {
    setup({ disabled: true });
    const label = screen.getByTestId("pickDate");
    const trigger = label.closest("button") as HTMLButtonElement | null;
    expect(trigger).not.toBeNull();
    expect(trigger!).toBeDisabled();
  });
});
