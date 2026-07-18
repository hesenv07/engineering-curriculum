export type TTerminalLevel = 'info' | 'warning' | 'error';

export interface ITerminalBlockProps {
  level?: TTerminalLevel;
  children: React.ReactNode;
}
