import type { DIAGRAM_CAPTION_POSITIONS } from './Diagram.const';

export type TDiagramCaptionPosition =
  (typeof DIAGRAM_CAPTION_POSITIONS)[keyof typeof DIAGRAM_CAPTION_POSITIONS];

export interface IDiagramProps {
  name: string;
  alt: string;
  width?: number;
  height?: number;
  children?: React.ReactNode;
  captionPosition?: TDiagramCaptionPosition;
}
