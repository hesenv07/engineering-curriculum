import type { IPageContext, ITocItem } from "@/shared/types";

export interface IPageProps {
  toc?: ITocItem[];
  children: React.ReactNode;
  showSidebar?: boolean;
  pageContext?: IPageContext;
  defaultSidebarOpen?: boolean;
}
