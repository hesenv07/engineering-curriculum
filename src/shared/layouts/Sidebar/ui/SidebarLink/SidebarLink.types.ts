export interface ISidebarLinkProps {
  href: string;
  level: number;
  title: string;
  duration?: string;
  selected?: boolean;
  hideArrow?: boolean;
  isExpanded?: boolean;
  version?: "canary" | "major" | "experimental" | "rc";
}
