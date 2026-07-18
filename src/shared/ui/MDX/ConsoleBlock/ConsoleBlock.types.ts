export type TConsoleLevel = 'info' | 'warning' | 'error';

export interface IConsoleBlockProps {
  level?: TConsoleLevel;
  children: React.ReactNode;
}

export interface IConsoleBlockMultiProps {
  children: React.ReactNode;
}
