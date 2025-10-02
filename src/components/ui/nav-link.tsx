import Link from "next/link";
import { cn } from "@/lib/utils";

function NavLink({
  href,
  icon,
  children,
  collapsed = false,
  className,
}: {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  collapsed?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
        collapsed && "justify-center",
        className,
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className={cn("truncate", collapsed && "hidden")}>{children}</span>
    </Link>
  );
}

export { NavLink };
