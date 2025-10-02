"use client";

import { cn } from "@/lib/utils";
import { useLayout } from "@/components/layout/layout-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Menu } from "lucide-react";
import { NavLink } from "../ui/nav-link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { signOut } from "next-auth/react";
import clsx from "clsx";

export function Topbar({ className }: { className?: string }) {
  const { toggleSidebar } = useLayout();
  const pathname = usePathname();

  // helper: เช็ค active
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");
  return (
    <header className={cn("sticky top-0 z-40 w-full bg-[#234868]", className)}>
      <div className="flex justify-between items-center">
        <div className="flex h-14 items-center gap-2 px-4">
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden lg:block"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button> */}
          <div className="font-semibold">
            <Image
              src="/logos/runexy-logo.png"
              alt="Runexy Logo"
              width={130}
              height={130}
              className="rounded-md"
            />
          </div>
          <Separator orientation="vertical" className="mx-2 hidden lg:block" />
          <div className="text-1xl text-white font-bold hidden lg:block">
            Daily Report
          </div>
        </div>

        <div className="flex h-14 items-center px-5 py-2 justify-between">
          <nav className="hidden md:flex items-center gap-2">
            <NavLink
              href="/dashboard"
              className={clsx(
                isActive("/dashboard")
                  ? "text-[#ea340e]"
                  : "text-white hover:text-black",
                "hover:bg-gray-200",
              )}
            >
              Dashboard
            </NavLink>
            <NavLink
              href="/calendar"
              className={clsx(
                isActive("/calendar")
                  ? "text-[#ea340e] "
                  : "text-white hover:text-black",
                "hover:bg-gray-200",
              )}
            >
              Calendar
            </NavLink>
          </nav>
          <Separator
            orientation="vertical"
            className="mx-3 hidden md:block h-6 bg-white/20"
          />
          <div className="flex justify-end w-full font-bold space-x-2">
            <Badge
              onClick={() => {
                console.log("EN");
              }}
              variant="secondary"
              className="w-10 cursor-pointer bg-[#ea330b] text-[#ffffff]"
            >
              EN
            </Badge>
            <Badge
              variant="secondary"
              className="w-10 cursor-pointer"
              onClick={() => {
                console.log("JP");
              }}
            >
              JP
            </Badge>
          </div>
          <Separator
            orientation="vertical"
            className="mx-3 hidden md:block h-6 bg-white/20"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="ml-1 px-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="https://img.freepik.com/premium-vector/person-with-blue-shirt-that-says-name-person_1029948-7040.jpg"
                    alt="profile"
                  />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <NavLink href="/dashboard">Dashboard</NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink href="/calendar">Calendar</NavLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-destructive focus:text-destructive"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
