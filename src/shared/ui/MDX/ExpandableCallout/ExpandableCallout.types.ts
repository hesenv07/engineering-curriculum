export type TCalloutType = 'note' | 'pitfall';

export interface IExpandableCalloutProps {
  type: TCalloutType;
  children: React.ReactNode;
}
