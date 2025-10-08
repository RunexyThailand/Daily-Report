/**
 * @file DatePicker unit tests (TS-safe)
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import DatePicker from "@/components/form/date-picker"; // <-- adjust if needed

let __lastCalendarProps: any | null = null;

// Icons -> simple spans
jest.mock("lucide-react", () => ({
    Calendar: () => <span data-testid="icon-calendar" />,
    X: () => <span data-testid="icon-x" />,
}));

// ---- Popover mock (typed) ----
jest.mock("@/components/ui/popover", () => {
    const React = require("react") as typeof import("react");

    type Ctx = { isOpen: boolean; setOpen: (o: boolean) => void };
    const PopCtx = React.createContext<Ctx | null>(null);

    function Popover({
        open,
        onOpenChange,
        children,
    }: {
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
        children: React.ReactNode;
    }) {
        const [isOpen, setIsOpen] = React.useState(!!open);
        React.useEffect(() => {
            if (typeof open !== "undefined") setIsOpen(!!open);
        }, [open]);

        const api: Ctx = {
            isOpen,
            setOpen: (o) => {
                setIsOpen(o);
                onOpenChange?.(o);
            },
        };

        return (
            <PopCtx.Provider value={api}>
                <div data-testid="popover-root">{children}</div>
            </PopCtx.Provider>
        );
    }

    // ✅ Fix TS18046: type the child’s props before accessing `onClick`
    type Clickable = { onClick?: React.MouseEventHandler<unknown> };

    function PopoverTrigger({
        asChild,
        children,
    }: {
        asChild?: boolean;
        children: React.ReactElement;
    }) {
        const ctx = React.useContext(PopCtx)!;
        const child = React.Children.only(
            children,
        ) as React.ReactElement<Clickable>;

        const handleClick: React.MouseEventHandler = (e) => {
            child.props.onClick?.(e);
            ctx.setOpen(!ctx.isOpen);
        };

        return React.cloneElement(child, { onClick: handleClick });
    }

    function PopoverContent({ children }: { children: React.ReactNode }) {
        const ctx = React.useContext(PopCtx)!;
        return ctx.isOpen ? (
            <div data-testid="popover-content">{children}</div>
        ) : null;
    }

    return { Popover, PopoverTrigger, PopoverContent };
});

// ---- Calendar mock (typed) ----
jest.mock("@/components/ui/calendar", () => {
    const React = require("react") as typeof import("react");
    function Calendar(props: any) {
        __lastCalendarProps = props;
        return (
            <div data-testid="calendar-mock">
                <button
                    type="button"
                    onClick={() => props.onSelect?.(new Date("2025-06-18T11:22:00"))}
                >
                    Pick 2025-06-18
                </button>
                <button type="button" onClick={() => props.onSelect?.(undefined)}>
                    Pick undefined
                </button>
            </div>
        );
    }
    (Calendar as any).__getLastProps = () => __lastCalendarProps;
    return { Calendar };
});

// ---- helpers ----
function ymdhm(d: Date) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
        `${d.getFullYear()}-` +
        `${pad(d.getMonth() + 1)}-` +
        `${pad(d.getDate())} ` +
        `${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
}

// ---- tests ----
describe("<DatePicker />", () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    test("renders a formatted label using displayFormat", () => {
        const value = new Date("2025-06-10T14:30:00");
        render(
            <DatePicker
                value={value}
                onChange={() => { }}
                displayFormat="yyyy-MM-dd HH:mm"
            />,
        );

        expect(
            screen.getByRole("button", { name: "2025-06-10 14:30" }),
        ).toBeInTheDocument();
        expect(screen.getByTestId("icon-calendar")).toBeInTheDocument();
    });

    test("opens/closes popover via trigger and calls onOpenChange", async () => {
        const user = userEvent.setup();
        const onOpenChange = jest.fn();
        const value = new Date("2025-06-10T14:30:00");

        render(
            <DatePicker
                value={value}
                onChange={() => { }}
                onOpenChange={onOpenChange}
                displayFormat="yyyy-MM-dd" // 👈 make label predictable
            />,
        );

        // Initially closed
        expect(screen.queryByTestId("popover-content")).not.toBeInTheDocument();

        // Click to open
        await user.click(screen.getByRole("button", { name: "2025-06-10" })); // 👈 matches displayFormat
        expect(screen.getByTestId("popover-content")).toBeInTheDocument();
        expect(onOpenChange).toHaveBeenLastCalledWith(true);

        // Click again to close
        await user.click(screen.getByRole("button", { name: "2025-06-10" }));
        expect(screen.queryByTestId("popover-content")).not.toBeInTheDocument();
        expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    test("selecting a date snaps to start of day by default", async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();

        render(
            <DatePicker
                value={new Date("2025-06-10T14:30:00")}
                onChange={onChange}
                displayFormat="yyyy-MM-dd HH:mm"
            />,
        );

        await user.click(screen.getByRole("button", { name: /2025-06-10 14:30/ }));
        await user.click(screen.getByRole("button", { name: "Pick 2025-06-18" }));

        expect(onChange).toHaveBeenCalledTimes(1);
        const picked = onChange.mock.calls[0][0] as Date;
        expect(ymdhm(picked)).toBe("2025-06-18 00:00");
    });

    test("selecting a date keeps exact time when snapToStartOfDay=false", async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();

        render(
            <DatePicker
                value={new Date("2025-06-10T14:30:00")}
                onChange={onChange}
                snapToStartOfDay={false}
                displayFormat="yyyy-MM-dd HH:mm"
            />,
        );

        await user.click(screen.getByRole("button", { name: /2025-06-10 14:30/ }));
        await user.click(screen.getByRole("button", { name: "Pick 2025-06-18" }));

        expect(onChange).toHaveBeenCalledTimes(1);
        const picked = onChange.mock.calls[0][0] as Date;
        expect(ymdhm(picked)).toBe("2025-06-18 11:22");
    });

    test("clear button resets to today's startOfDay", async () => {
        // ✅ modern fake timers (default)
        jest.useFakeTimers(); // or: jest.useFakeTimers('modern')
        const user = userEvent.setup({
            // let user-event advance Jest timers so clicks don't hang
            advanceTimers: (ms) => jest.advanceTimersByTime(ms),
        });

        const onChange = jest.fn();
        // freeze "now" for the test
        jest.setSystemTime(new Date("2025-07-01T15:47:00"));

        render(
            <DatePicker
                value={new Date("2025-06-10T14:30:00")}
                onChange={onChange}
                displayFormat="yyyy-MM-dd HH:mm"
            />,
        );

        // open popover then click Today
        await user.click(screen.getByRole("button", { name: /2025-06-10 14:30/ }));
        await user.click(screen.getByRole("button", { name: "Today" }));

        expect(onChange).toHaveBeenCalledTimes(1);
        const cleared = onChange.mock.calls[0][0] as Date;
        const pad = (n: number) => String(n).padStart(2, "0");
        const ymdhm = (d: Date) =>
            `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
        expect(ymdhm(cleared)).toBe("2025-07-01 00:00");

        // your afterEach will restore real timers
    });

    test("hides clear section when showClear=false", async () => {
        const user = userEvent.setup();

        render(
            <DatePicker
                value={new Date("2025-06-10T14:30:00")}
                onChange={() => { }}
                showClear={false}
            />,
        );

        await user.click(screen.getByRole("button"));
        expect(
            screen.queryByRole("button", { name: "Today" }),
        ).not.toBeInTheDocument();
    });

    test("passes disabled to trigger and respects className", () => {
        render(
            <DatePicker
                value={new Date("2025-06-10T14:30:00")}
                onChange={() => { }}
                disabled
                className="my-extra-class"
            />,
        );

        const btn = screen.getByRole("button");
        expect(btn).toBeDisabled();
        expect(btn).toHaveClass("my-extra-class");
    });

    test("forwards dayDisabled to Calendar", async () => {
        const user = userEvent.setup();
        const dayDisabled = (d: Date) => d.getDay() === 0;

        // (optional) clear any stale props from previous tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (global as any).__lastCalendarProps = null;

        render(
            <DatePicker
                value={new Date("2025-06-10T14:30:00")}
                onChange={() => { }}
                dayDisabled={dayDisabled}
            />,
        );

        // 🔑 Open the popover so <Calendar> mounts with props
        await user.click(screen.getByRole("button"));

        // read captured props from the mock
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { Calendar } = require("@/components/ui/calendar");
        const last = (Calendar as any).__getLastProps?.();

        expect(last).toBeTruthy();
        expect(last.disabled).toBe(dayDisabled);
    });

    test("respects defaultOpen (content visible initially)", () => {
        render(
            <DatePicker
                value={new Date("2025-06-10T14:30:00")}
                onChange={() => { }}
                defaultOpen
            />,
        );

        expect(screen.getByTestId("popover-content")).toBeInTheDocument();
        expect(screen.getByTestId("calendar-mock")).toBeInTheDocument();
    });

    test("shows placeholder when value=null and Clear sets value to null", async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();

        render(<DatePicker value={null} onChange={onChange} />);

        // Placeholder should be rendered on the trigger button
        const trigger = screen.getByRole("button", { name: /pick a date/i });
        expect(trigger).toBeInTheDocument();

        // Open the popover
        await user.click(trigger);

        // Click "Clear" and expect onChange(null)
        await user.click(screen.getByRole("button", { name: /clear/i }));
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(null);
    });

    test.todo(
        "snapToStartOfDay=false preserves the existing time-of-day from current value (not implemented currently)",
    );
});
