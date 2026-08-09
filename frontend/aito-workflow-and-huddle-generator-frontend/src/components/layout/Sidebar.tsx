// Displays the application's left navigation menu.

import {
  FolderOpen,
  HeartPulse,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import {
  NavLink,
} from "react-router";

interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
  end?: boolean;
}

const navigationItems:
  NavigationItem[] = [
    {
      label: "Workflow Builder",
      path: "/workflow",
      icon: Workflow,
    },

    {
      label: "My Workflows",
      path: "/workflows",
      icon: FolderOpen,
    },

    {
      label: "API Diagnostics",
      path: "/diagnostics",
      icon: HeartPulse,
    },
  ];

export function Sidebar() {
  return (
    <aside
      style={{
        width: "240px",
        minHeight:
          "calc(100vh - 64px)",
        padding: "20px",
        borderRight:
          "1px solid #e5e7eb",
        background: "white",
      }}
    >
      <nav
        aria-label="Main navigation"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {navigationItems.map(
          item => {
            const Icon =
              item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                style={({
                  isActive,
                }) => ({
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "10px",
                  padding:
                    "10px 12px",
                  borderRadius:
                    "6px",
                  color: isActive
                    ? "#1d4ed8"
                    : "#374151",
                  background:
                    isActive
                      ? "#eff6ff"
                      : "transparent",
                  fontWeight:
                    isActive
                      ? 600
                      : 400,
                  textDecoration:
                    "none",
                  transition:
                    "background-color 150ms ease, color 150ms ease",
                })}
              >
                <Icon
                  size={18}
                  aria-hidden="true"
                />

                <span>
                  {item.label}
                </span>
              </NavLink>
            );
          },
        )}
      </nav>
    </aside>
  );
}