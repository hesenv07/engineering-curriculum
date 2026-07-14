'use client';
import * as React from 'react';

interface ChallengesProps {
  children: React.ReactNode;
}

interface ChallengeData {
  title: string;
  id: string;
  content: React.ReactNode[];
  solution: React.ReactNode | null;
  hint: React.ReactNode | null;
}

function parseChallenges(children: React.ReactNode): ChallengeData[] {
  const result: ChallengeData[] = [];
  const childArray = React.Children.toArray(children);

  let current: ChallengeData | null = null;

  for (const child of childArray) {
    if (!React.isValidElement(child)) continue;

    const type = child.type;
    const props = child.props as any;

    // h4 starts a new challenge
    if (type === 'h4' || props?.mdxType === 'h4') {
      if (current) result.push(current);
      const titleText = String(props?.children || '');
      const id = props?.id || titleText.toLowerCase().replace(/\s+/g, '-');
      current = { title: titleText, id, content: [], solution: null, hint: null };
      continue;
    }

    if (!current) continue;

    const componentName =
      typeof type === 'function' ? (type as any).displayName || type.name : String(type);

    if (componentName === 'Solution') {
      current.solution = props?.children;
    } else if (componentName === 'Hint') {
      current.hint = props?.children;
    } else {
      current.content.push(child);
    }
  }

  if (current) result.push(current);
  return result;
}

export function Challenges({ children }: ChallengesProps) {
  const challenges = parseChallenges(children);
  const [current, setCurrent] = React.useState(0);
  const [showSolution, setShowSolution] = React.useState(false);
  const [showHint, setShowHint] = React.useState(false);

  const challenge = challenges[current];

  React.useEffect(() => {
    setShowSolution(false);
    setShowHint(false);
  }, [current]);

  if (challenges.length === 0) return null;

  return (
    <div className="rounded-xl border border-[#EBECF0] dark:border-[#343A46] mb-8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#EDF5FA] dark:bg-[#1A2333] px-5 py-3 border-b border-[#EBECF0] dark:border-[#343A46]">
        <span className="text-[#087EA4] dark:text-[#149ECA] font-bold uppercase text-xs tracking-widest">
          {challenges.length > 1 ? `Tapşırıq ${current + 1} / ${challenges.length}` : 'Tapşırıq'}
        </span>
        {challenges.length > 1 && (
          <div className="flex gap-1">
            {challenges.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-7 h-7 rounded-full text-xs font-medium transition-colors ${
                  i === current
                    ? 'bg-[#087EA4] text-white'
                    : 'bg-white dark:bg-[#2B3245] text-[#404756] dark:text-[#99A1B3] border border-[#EBECF0] dark:border-[#343A46] hover:border-[#087EA4]'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Challenge content */}
      <div className="p-5">
        <h4 className="font-bold text-[#23272F] dark:text-[#F6F7F9] text-lg mb-4">
          {challenge.title}
        </h4>
        <div className="prose-docs">{challenge.content}</div>

        {/* Hint */}
        {challenge.hint && (
          <div className="mt-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-sm text-[#087EA4] dark:text-[#149ECA] hover:underline font-medium"
            >
              {showHint ? 'İpucunu gizlət' : 'İpucu göstər'}
            </button>
            {showHint && (
              <div className="mt-2 rounded-lg bg-[#F9FBFC] dark:bg-[#2B3245] border border-[#EBECF0] dark:border-[#343A46] p-4 prose-docs">
                {challenge.hint}
              </div>
            )}
          </div>
        )}

        {/* Solution */}
        {challenge.solution && (
          <div className="mt-4">
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="text-sm text-[#087EA4] dark:text-[#149ECA] hover:underline font-medium"
            >
              {showSolution ? 'Cavabı gizlət' : 'Cavabı göstər'}
            </button>
            {showSolution && (
              <div className="mt-2 rounded-lg bg-[#F9FBFC] dark:bg-[#2B3245] border border-[#EBECF0] dark:border-[#343A46] p-4 prose-docs">
                {challenge.solution}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      {challenges.length > 1 && (
        <div className="flex justify-between items-center px-5 py-3 border-t border-[#EBECF0] dark:border-[#343A46] bg-[#F9FBFC] dark:bg-[#2B3245]">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="text-sm text-[#087EA4] dark:text-[#149ECA] disabled:opacity-40 disabled:cursor-not-allowed hover:underline font-medium"
          >
            ← Əvvəlki
          </button>
          <button
            onClick={() => setCurrent((c) => Math.min(challenges.length - 1, c + 1))}
            disabled={current === challenges.length - 1}
            className="text-sm text-[#087EA4] dark:text-[#149ECA] disabled:opacity-40 disabled:cursor-not-allowed hover:underline font-medium"
          >
            Növbəti →
          </button>
        </div>
      )}
    </div>
  );
}

export function Solution({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
Solution.displayName = 'Solution';

export function Hint({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
Hint.displayName = 'Hint';
