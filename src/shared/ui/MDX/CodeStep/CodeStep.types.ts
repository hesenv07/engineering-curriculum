export type TCodeStepNumber = 1 | 2 | 3 | 4;

export interface ICodeStepProps {
  step: TCodeStepNumber;
  children: React.ReactNode;
}
