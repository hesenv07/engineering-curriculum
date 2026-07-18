export interface IFileEntry {
  code: string;
  filename: string;
  language: string;
}

export interface ISandpackProps {
  children: React.ReactNode;
}

export type TNodeProps = {
  className?: string;
  children?: React.ReactNode;
};
