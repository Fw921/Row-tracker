import type { SVGProps } from "react";

/**
 * Monitor showing an upward performance trend — used for the Dashboard nav
 * link and page header instead of lucide's generic `LayoutDashboard`.
 * Hand-drawn to match lucide's icon conventions (24x24 viewBox, 2px stroke,
 * round caps/joins) so it drops in anywhere a lucide icon is used.
 */
export function DashboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M5 13 9 9 12 12 19 6" />
      <path d="M12 17v4" />
      <path d="M8 21h8" />
    </svg>
  );
}
