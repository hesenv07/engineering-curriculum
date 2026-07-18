import type { IPageContext, ITocItem } from "@/shared/types";

export interface IPageProps {
  toc?: ITocItem[];
  showSidebar?: boolean;
  children: React.ReactNode;
  pageContext?: IPageContext;
}
