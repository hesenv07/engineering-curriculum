export type TCalloutType = 'note' | 'pitfall' | 'wip';

export interface IExpandableCalloutProps {
  type: TCalloutType;
  children: React.ReactNode;
}
