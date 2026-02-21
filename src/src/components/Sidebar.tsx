"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  LayoutDashboard,
  Presentation,
  PanelLeftClose,
  PanelLeft,
  Settings,
  Zap,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/presentations", label: "Presentations", icon: Presentation },
  { href: "/setup", label: "Setup", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <Tooltip.Provider delayDuration={200}>
      <aside
        className={cn(
          "h-screen sticky top-0 flex flex-col border-r border-border bg-card transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm text-foreground truncate">
              Presentation Ninja
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip.Root key={item.href}>
                  <Tooltip.Trigger asChild>
                    {linkContent}
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="right"
                      className="rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md"
                      sideOffset={8}
                    >
                      {item.label}
                      <Tooltip.Arrow className="fill-popover" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              );
            }

            return linkContent;
          })}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-border space-y-0.5">
          {collapsed ? (
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={() => setCollapsed(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent w-full transition-colors"
                >
                  <PanelLeft className="w-4 h-4 shrink-0" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="right"
                  className="rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md"
                  sideOffset={8}
                >
                  Expand
                  <Tooltip.Arrow className="fill-popover" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          ) : (
            <button
              onClick={() => setCollapsed(true)}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent w-full transition-colors"
            >
              <PanelLeftClose className="w-4 h-4 shrink-0" />
              <span>Collapse</span>
            </button>
          )}
          {collapsed ? (
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-accent w-full transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="right"
                  className="rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md"
                  sideOffset={8}
                >
                  Sign Out
                  <Tooltip.Arrow className="fill-popover" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          ) : (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-accent w-full transition-colors w-full"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>
    </Tooltip.Provider>
  );
}
