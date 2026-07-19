export interface IChallengesProps {
  children: React.ReactNode;
}

export interface IChallengeData {
  id: string;
  title: string;
  content: React.ReactNode[];
}

export type TElementProps = {
  id?: string;
  children?: React.ReactNode;
};
