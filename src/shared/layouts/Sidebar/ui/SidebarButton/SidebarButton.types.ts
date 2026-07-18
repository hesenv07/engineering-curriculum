export interface ISidebarButtonProps {
  level: number;
  title: string;
  heading: boolean;
  isExpanded?: boolean;
  isBreadcrumb?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}