export interface IShowProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  when: boolean | undefined | null | false;
}