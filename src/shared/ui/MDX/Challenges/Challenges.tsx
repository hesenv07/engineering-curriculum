"use client";

import React, { useState, useEffect } from "react";

import { isMdxTag } from "../../../lib/utils/mdxTag";

import type {
  IChallengeData,
  IChallengesProps,
  TElementProps,
} from "./Challenges.types";

function getComponentName(type: unknown): string {
  if (typeof type !== "function") return String(type);
  const fn = type as { displayName?: string; name?: string };
  return fn.displayName ?? fn.name ?? "";
}

function parseChallenges(children: React.ReactNode): IChallengeData[] {
  const result: IChallengeData[] = [];
  const childArray = React.Children.toArray(children);
  let current: IChallengeData | null = null;

  for (const child of childArray) {
    if (!React.isValidElement(child)) continue;

    const type = child.type;
    const props = child.props as TElementProps;

    if (isMdxTag(type, "h4")) {
      if (current) result.push(current);
      const titleText = String(props.children ?? "");
      const id = props.id ?? titleText.toLowerCase().replace(/\s+/g, "-");
      current = {
        id,
        title: titleText,
        content: [],
        hint: null,
        solution: null,
      };
      continue;
    }

    if (!current) continue;

    const componentName = getComponentName(type);

    if (componentName === "Solution") {
      current.solution = props.children ?? null;
    } else if (componentName === "Hint") {
      current.hint = props.children ?? null;
    } else {
      current.content.push(child);
    }
  }

  if (current) result.push(current);
  return result;
}

export default function Challenges({ children }: IChallengesProps) {
  const challenges = parseChallenges(children);
  const [current, setCurrent] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const challenge = challenges[current];

  useEffect(() => {
    setShowSolution(false);
    setShowHint(false);
  }, [current]);

  if (challenges.length === 0) return null;

  return (
    <div className="rounded-xl border border-border dark:border-border-dark mb-8 overflow-hidden">
      <div className="flex items-center justify-between bg-card dark:bg-card-dark px-5 py-3 border-b border-border dark:border-border-dark">
        <span className="text-link dark:text-link-dark font-bold uppercase text-xs tracking-widest">
          {challenges.length > 1
            ? `Tapşırıq ${current + 1} / ${challenges.length}`
            : "Tapşırıq"}
        </span>
        {challenges.length > 1 && (
          <div className="flex gap-1">
            {challenges.map((ch, i) => (
              <button
                key={ch.id}
                onClick={() => setCurrent(i)}
                className={
                  i === current
                    ? "w-7 h-7 rounded-full text-xs font-medium bg-link text-white"
                    : "w-7 h-7 rounded-full text-xs font-medium bg-wash dark:bg-card-dark text-secondary dark:text-secondary-dark border border-border dark:border-border-dark hover:border-link"
                }
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-5">
        <h4 className="font-bold text-primary dark:text-primary-dark text-lg mb-4">
          {challenge.title}
        </h4>
        <div className="prose-docs">{challenge.content}</div>

        {challenge.hint && (
          <div className="mt-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-sm text-link dark:text-link-dark hover:underline font-medium"
            >
              {showHint ? "İpucunu gizlət" : "İpucu göstər"}
            </button>
            {showHint && (
              <div className="mt-2 rounded-lg bg-card dark:bg-card-dark border border-border dark:border-border-dark p-4 prose-docs">
                {challenge.hint}
              </div>
            )}
          </div>
        )}

        {challenge.solution && (
          <div className="mt-4">
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="text-sm text-link dark:text-link-dark hover:underline font-medium"
            >
              {showSolution ? "Cavabı gizlət" : "Cavabı göstər"}
            </button>
            {showSolution && (
              <div className="mt-2 rounded-lg bg-card dark:bg-card-dark border border-border dark:border-border-dark p-4 prose-docs">
                {challenge.solution}
              </div>
            )}
          </div>
        )}
      </div>

      {challenges.length > 1 && (
        <div className="flex justify-between items-center px-5 py-3 border-t border-border dark:border-border-dark bg-card dark:bg-card-dark">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="text-sm text-link dark:text-link-dark disabled:opacity-40 disabled:cursor-not-allowed hover:underline font-medium"
          >
            ← Əvvəlki
          </button>
          <button
            onClick={() =>
              setCurrent((c) => Math.min(challenges.length - 1, c + 1))
            }
            disabled={current === challenges.length - 1}
            className="text-sm text-link dark:text-link-dark disabled:opacity-40 disabled:cursor-not-allowed hover:underline font-medium"
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
Solution.displayName = "Solution";

export function Hint({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
Hint.displayName = "Hint";
