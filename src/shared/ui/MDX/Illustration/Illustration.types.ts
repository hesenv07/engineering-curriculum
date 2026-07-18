export interface IIllustrationProps {
  src: string;
  alt: string;
  caption?: string;
  author?: string;
  authorLink?: string;
}

export interface IIllustrationBlockProps {
  author?: string;
  authorLink?: string;
  sequential?: boolean;
  children: React.ReactNode;
}
