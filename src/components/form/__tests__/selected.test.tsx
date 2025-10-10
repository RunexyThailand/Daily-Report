// src/components/form/__tests__/Selected.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Selected, { type optionType } from "../selector";

// --- Mock shadcn/ui Select into a controlled native <select> (typed) ---
jest.mock("@/components/ui/select", () => {
  // const React = require("react") as typeof import("react");

  type Item = { value: string; label: React.ReactNode; key?: string };

  const Ctx = React.createContext<{
    value?: string;
    onValueChange?: (v: string) => void;
    items: Item[];
    registerItem: (item: Item) => void;
  } | null>(null);

  function Select({
    value,
    onValueChange,
    children,
  }: {
    value?: string;
    onValueChange?: (v: string) => void;
    children: React.ReactNode;
  }) {
    const [items, setItems] = React.useState<Item[]>([]);
    const registerItem = (item: Item) => setItems((prev) => [...prev, item]);
    return (
      <Ctx.Provider value={{ value, onValueChange, items, registerItem }}>
        {children}
      </Ctx.Provider>
    );
  }

  function SelectTrigger({
    className,
    children,
  }: {
    className?: string;
    children?: React.ReactNode;
  }) {
    const ctx = React.useContext(Ctx)!;
    return (
      <div>
        <select
          aria-label="mock-select"
          className={className}
          value={ctx.value ?? ""}
          onChange={(e) => ctx.onValueChange?.(e.target.value)}
        >
          {ctx.items.map((it, i) => (
            <option key={it.key ?? String(i)} value={it.value}>
              {typeof it.label === "string" ? it.label : String(it.value)}
            </option>
          ))}
        </select>
        {children /* ignored in this mock */}
      </div>
    );
  }

  function SelectContent({ children }: { children?: React.ReactNode }) {
    return <>{children}</>;
  }

  function SelectItem({
    value,
    children,
  }: {
    value: string;
    children: React.ReactNode;
  }) {
    const ctx = React.useContext(Ctx)!;
    React.useEffect(() => {
      ctx.registerItem({ value, label: children });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, children]);
    return null;
  }

  // not needed for this mock
  function SelectValue({}: { placeholder?: string }) {
    return null;
  }

  return {
    __esModule: true,
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
  };
});

// --- Fixtures ---
const options: optionType[] = [
  { id: "p1", label: "Project A" },
  { id: "p2", label: "Project B" },
];

describe("<Selected />", () => {
  test("renders All + options (default includeAll) and selects 'all'", async () => {
    render(<Selected options={options} value="all" onChange={() => {}} />);

    const select = screen.getByLabelText("mock-select") as HTMLSelectElement;
    // wait for options registered via useEffect
    await screen.findAllByRole("option");

    const renderedOptions = Array.from(select.options).map((o) => o.text);
    expect(renderedOptions).toEqual(["All", "Project A", "Project B"]);
    expect(select.value).toBe("all");
    expect(select.className).toContain("w-[200px]");
  });

  test("custom allLabel is used", async () => {
    render(
      <Selected
        options={options}
        value="all"
        onChange={() => {}}
        allLabel="Everyone"
      />,
    );
    const select = screen.getByLabelText("mock-select") as HTMLSelectElement;
    await screen.findAllByRole("option");
    const renderedOptions = Array.from(select.options).map((o) => o.text);
    expect(renderedOptions[0]).toBe("Everyone");
  });

  test("does not render 'All' when includeAll is false", async () => {
    render(
      <Selected
        options={options}
        value="p1"
        onChange={() => {}}
        includeAll={false}
      />,
    );
    const select = screen.getByLabelText("mock-select") as HTMLSelectElement;
    await screen.findAllByRole("option");
    const renderedOptions = Array.from(select.options).map((o) => o.text);
    expect(renderedOptions).toEqual(["Project A", "Project B"]);
    expect(select.value).toBe("p1");
  });

  test("fires onChange with selected id and with 'all'", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<Selected options={options} value="all" onChange={onChange} />);

    const select = screen.getByLabelText("mock-select") as HTMLSelectElement;
    await screen.findAllByRole("option");

    await user.selectOptions(select, "p2");
    expect(onChange).toHaveBeenCalledWith("p2");

    await user.selectOptions(select, "all");
    expect(onChange).toHaveBeenCalledWith("all");
  });

  test("applies className on wrapper and triggerClassName on select (merged with default width)", async () => {
    const { container } = render(
      <Selected
        options={options}
        value="all"
        onChange={() => {}}
        className="outer-wrap"
        triggerClassName="inner-trigger"
      />,
    );

    expect(container.firstChild).toHaveClass("outer-wrap");

    const select = screen.getByLabelText("mock-select");
    await screen.findAllByRole("option");

    expect(select).toHaveClass("inner-trigger");
    expect(select).toHaveClass("w-[200px]");
  });

  test("when value is empty and includeAll=true, falls back to 'all'", async () => {
    render(<Selected options={options} value={""} onChange={() => {}} />);

    const select = screen.getByLabelText("mock-select") as HTMLSelectElement;
    await screen.findAllByRole("option");
    expect(select.value).toBe("all");
  });

  test("controlled value updates reflect in the select", async () => {
    const user = userEvent.setup();

    function Harness() {
      const [val, setVal] = React.useState<"all" | string>("all");
      return (
        <>
          <Selected options={options} value={val} onChange={(v) => setVal(v)} />
          <div data-testid="value">{val}</div>
        </>
      );
    }

    render(<Harness />);

    const select = screen.getByLabelText("mock-select") as HTMLSelectElement;
    await screen.findAllByRole("option");

    // initial
    expect(select.value).toBe("all");
    expect(screen.getByTestId("value")).toHaveTextContent("all");

    // change to p1
    await user.selectOptions(select, "p1");
    expect(select.value).toBe("p1");
    expect(screen.getByTestId("value")).toHaveTextContent("p1");

    // back to all
    await user.selectOptions(select, "all");
    expect(select.value).toBe("all");
    expect(screen.getByTestId("value")).toHaveTextContent("all");
  });
});
