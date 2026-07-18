export interface IChallengesProps {
  children: React.ReactNode;
}

export interface IChallengeData {
  id: string;
  title: string;
  content: React.ReactNode[];
  hint: React.ReactNode | null;
  solution: React.ReactNode | null;
}

export type TElementProps = {
    id?: string;
    children?: React.ReactNode;
};