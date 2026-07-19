"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";

import { isMdxTag } from "../../../lib/utils/mdxTag";
import { resolveLocale } from "@/shared/lib/utils/locale";

import type { TLocale } from "@/shared/types";
import type {
  IChallengeData,
  IChallengesProps,
  TElementProps,
} from "./Challenges.types";

const labels: Record<
  TLocale,
  {
    challenge: string;
    showHint: string;
    hideHint: string;
    showSolution: string;
    hideSolution: string;
    closeSolution: string;
    solution: string;
    previous: string;
    next: string;
  }
> = {
  az: {
    challenge: "Tapşırıq",
    showHint: "İpucu göstər",
    hideHint: "İpucunu gizlət",
    showSolution: "Cavabı göstər",
    hideSolution: "Cavabı gizlət",
    closeSolution: "Cavabı bağla",
    solution: "Cavab",
    previous: "← Əvvəlki",
    next: "Növbəti tapşırıq",
  },
  en: {
    challenge: "Challenge",
    showHint: "Show hint",
    hideHint: "Hide hint",
    showSolution: "Show solution",
    hideSolution: "Hide solution",
    closeSolution: "Close solution",
    solution: "Solution",
    previous: "← Previous",
    next: "Next Challenge",
  },
};

// ─── Inline SVG icons (from react.dev source) ────────────────────────────────

function IconHint() {
  return (
    <svg
      className="inline -mt-0.5 me-1.5"
      width="12"
      height="14"
      viewBox="0 0 12 15"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.53487 11H5.21954V7.66665H6.55287V11H7.23754C7.32554 10.1986 7.7342 9.53732 8.39754 8.81532C8.47287 8.73398 8.9522 8.23732 9.00887 8.16665C9.47973 7.5784 9.77486 6.86913 9.86028 6.1205C9.9457 5.37187 9.81794 4.61434 9.4917 3.93514C9.16547 3.25594 8.65402 2.6827 8.01628 2.28143C7.37853 1.88016 6.64041 1.66719 5.88692 1.66703C5.13344 1.66686 4.39523 1.87953 3.75731 2.28052C3.11939 2.68152 2.60771 3.25454 2.28118 3.9336C1.95465 4.61266 1.82656 5.37014 1.91167 6.1188C1.99677 6.86747 2.2916 7.57687 2.7622 8.16532C2.81954 8.23665 3.3002 8.73398 3.3742 8.81465C4.0382 9.53732 4.44687 10.1986 4.53487 11ZM4.55287 12.3333V13H7.21954V12.3333H4.55287ZM1.7222 8.99998C1.09433 8.21551 0.700836 7.26963 0.587047 6.2713C0.473258 5.27296 0.643804 4.26279 1.07904 3.35715C1.51428 2.4515 2.19649 1.68723 3.04711 1.15237C3.89772 0.617512 4.88213 0.333824 5.88692 0.333984C6.89172 0.334145 7.87604 0.61815 8.72648 1.15328C9.57692 1.68841 10.2589 2.4529 10.6938 3.35869C11.1288 4.26447 11.299 5.27469 11.1849 6.27299C11.0708 7.27129 10.677 8.21705 10.0489 9.00132C9.63554 9.51598 8.55287 10.3333 8.55287 11.3333V13C8.55287 13.3536 8.41239 13.6927 8.16235 13.9428C7.9123 14.1928 7.57316 14.3333 7.21954 14.3333H4.55287C4.19925 14.3333 3.86011 14.1928 3.61006 13.9428C3.36001 13.6927 3.21954 13.3536 3.21954 13V11.3333C3.21954 10.3333 2.1362 9.51598 1.7222 8.99998Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconSolution() {
  return (
    <svg
      className="inline me-1.5"
      width="0.75em"
      height="0.75em"
      viewBox="0 0 13 13"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.21908 8.74479V12.7448H0.885742V0.078125H7.14041C7.26418 0.0781911 7.3855 0.112714 7.49076 0.177827C7.59602 0.242939 7.68108 0.336071 7.73641 0.446792L8.21908 1.41146H12.2191C12.3959 1.41146 12.5655 1.4817 12.6905 1.60672C12.8155 1.73174 12.8857 1.90131 12.8857 2.07812V9.41146C12.8857 9.58827 12.8155 9.75784 12.6905 9.88286C12.5655 10.0079 12.3959 10.0781 12.2191 10.0781H7.96441C7.84063 10.0781 7.71932 10.0435 7.61406 9.97842C7.50879 9.91331 7.42374 9.82018 7.36841 9.70946L6.88574 8.74479H2.21908ZM2.21908 1.41146V7.41146H7.70974L8.37641 8.74479H11.5524V2.74479H7.39508L6.72841 1.41146H2.21908Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg
      className="block ms-1.5"
      width="1em"
      height="1em"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.86612 13.6161C6.37796 14.1043 6.37796 14.8957 6.86612 15.3839C7.35427 15.872 8.14572 15.872 8.63388 15.3839L13.1339 10.8839C13.622 10.3957 13.622 9.60428 13.1339 9.11612L8.63388 4.61612C8.14572 4.12797 7.35427 4.12797 6.86612 4.61612C6.37796 5.10428 6.37796 5.89573 6.86612 6.38388L10.4822 10L6.86612 13.6161Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg
      className="rotate-90"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
    >
      <g fill="none" fillRule="evenodd" transform="translate(-446 -398)">
        <path
          fill="currentColor"
          fillRule="nonzero"
          d="M95.8838835,240.366117 C95.3957281,239.877961 94.6042719,239.877961 94.1161165,240.366117 C93.6279612,240.854272 93.6279612,241.645728 94.1161165,242.133883 L98.6161165,246.633883 C99.1042719,247.122039 99.8957281,247.122039 100.383883,246.633883 L104.883883,242.133883 C105.372039,241.645728 105.372039,240.854272 104.883883,240.366117 C104.395728,239.877961 103.604272,239.877961 103.116117,240.366117 L99.5,243.982233 L95.8838835,240.366117 Z"
          transform="translate(356.5 164.5)"
        />
        <polygon points="446 418 466 418 466 398 446 398" />
      </g>
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg
      className="-rotate-90"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
    >
      <g fill="none" fillRule="evenodd" transform="translate(-446 -398)">
        <path
          fill="currentColor"
          fillRule="nonzero"
          d="M95.8838835,240.366117 C95.3957281,239.877961 94.6042719,239.877961 94.1161165,240.366117 C93.6279612,240.854272 93.6279612,241.645728 94.1161165,242.133883 L98.6161165,246.633883 C99.1042719,247.122039 99.8957281,247.122039 100.383883,246.633883 L104.883883,242.133883 C105.372039,241.645728 105.372039,240.854272 104.883883,240.366117 C104.395728,239.877961 103.604272,239.877961 103.116117,240.366117 L99.5,243.982233 L95.8838835,240.366117 Z"
          transform="translate(356.5 164.5)"
        />
        <polygon points="446 418 466 418 466 398 446 398" />
      </g>
    </svg>
  );
}

// ─── Shared button (matches react.dev Button exactly) ────────────────────────

interface IActionButtonProps {
  onClick: () => void;
  active?: boolean;
  className?: string;
  children: React.ReactNode;
}

function ActionButton({
  onClick,
  active = false,
  className = "",
  children,
}: IActionButtonProps) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={onClick}
      className={[
        "text-base leading-tight font-bold rounded-full py-2 px-4 inline-flex items-center my-1 transition-colors",
        active
          ? "bg-link dark:bg-link-dark text-white hover:opacity-90"
          : "bg-transparent text-primary dark:text-primary-dark border border-gray-20 dark:border-gray-60 hover:bg-gray-40/5 dark:hover:bg-gray-60/5",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// ─── Parsing (h4 headings only — Solution/Hint self-manage) ──────────────────

function getTextContent(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getTextContent).join("");
  if (React.isValidElement(node)) {
    return getTextContent(
      (node.props as { children?: React.ReactNode }).children,
    );
  }
  return "";
}

function parseChallenges(children: React.ReactNode): IChallengeData[] {
  const result: IChallengeData[] = [];
  const childArray = React.Children.toArray(children);
  let current: IChallengeData | null = null;

  for (const child of childArray) {
    if (!React.isValidElement(child)) continue;

    const type = child.type;
    const props = child.props as TElementProps;

    if (isMdxTag(type, "h4") || type === "h4") {
      if (current) result.push(current);
      const titleText = getTextContent(props.children).trim();
      const id = props.id ?? titleText.toLowerCase().replace(/\s+/g, "-");
      current = { id, title: titleText, content: [] };
      continue;
    }

    if (!current) continue;
    current.content.push(child);
  }

  if (current) result.push(current);
  return result;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Challenges({ children }: IChallengesProps) {
  const challenges = parseChallenges(children);
  const [current, setCurrent] = useState(0);

  const { locale } = useParams<{ locale: string }>();
  const lang = resolveLocale(locale);
  const t = labels[lang];

  if (challenges.length === 0) return null;

  const challenge = challenges[current];
  const isFirst = current === 0;
  const isLast = current === challenges.length - 1;
  const hasMultiple = challenges.length > 1;

  const handleChallengeChange = (index: number) => {
    setCurrent(index);
  };

  return (
    <div className="border border-gray-10 dark:border-gray-80 bg-card dark:bg-card-dark shadow-inner-border dark:shadow-inner-border-dark rounded-2xl mb-8 overflow-hidden">
      {/* Tab navigation */}
      {hasMultiple && (
        <div className="flex items-center justify-between py-2 px-5 sm:px-8 pb-0">
          <div className="overflow-hidden flex-1">
            <div className="flex overflow-x-auto">
              {challenges.map((ch, i) => (
                <button
                  key={ch.id}
                  onClick={() => handleChallengeChange(i)}
                  className={[
                    "py-2 me-4 text-base border-b-4 duration-100 ease-in transition whitespace-nowrap shrink-0",
                    i === current
                      ? "text-link dark:text-link-dark border-link dark:border-link-dark"
                      : "text-primary dark:text-primary-dark border-transparent hover:text-secondary dark:hover:text-secondary-dark",
                  ].join(" ")}
                >
                  {i + 1}. {ch.title}
                </button>
              ))}
            </div>
          </div>
          <div className="flex z-10 pb-2 ps-2 shrink-0">
            <button
              onClick={() => handleChallengeChange(Math.max(0, current - 1))}
              aria-label={t.previous}
              className={[
                "bg-gray-10 dark:bg-gray-80 h-8 px-2 rounded-l border-r border-gray-20 dark:border-gray-60",
                !isFirst
                  ? "text-primary dark:text-primary-dark"
                  : "text-gray-30 dark:text-gray-60",
              ].join(" ")}
            >
              <IconChevronLeft />
            </button>
            <button
              onClick={() =>
                handleChallengeChange(
                  Math.min(challenges.length - 1, current + 1),
                )
              }
              aria-label={t.next}
              className={[
                "bg-gray-10 dark:bg-gray-80 h-8 px-2 rounded-r",
                !isLast
                  ? "text-primary dark:text-primary-dark"
                  : "text-gray-30 dark:text-gray-60",
              ].join(" ")}
            >
              <IconChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5 sm:py-8 sm:px-8">
        <h4
          className="text-xl text-primary dark:text-primary-dark mb-2 mt-0 font-medium"
          id={challenge.id}
        >
          {hasMultiple && (
            <span className="font-bold">
              {t.challenge} {current + 1} of {challenges.length}
              <span>: </span>
            </span>
          )}
          {challenge.title}
        </h4>

        <div className="prose-docs">{challenge.content}</div>

        {/* Next challenge button — rendered below hint/solution buttons in content */}
        {hasMultiple && !isLast && (
          <div className="flex justify-end mt-4">
            <ActionButton onClick={() => handleChallengeChange(current + 1)} active>
              {t.next}
              <IconArrow />
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Solution — self-managing with react.dev Button style ────────────────────

export function Solution({ children }: { children: React.ReactNode }) {
  const [shown, setShown] = useState(false);
  const { locale } = useParams<{ locale: string }>();
  const t = labels[resolveLocale(locale)];

  return (
    <div className="mt-4">
      <ActionButton onClick={() => setShown((v) => !v)} active={shown}>
        <IconSolution />
        {shown ? t.hideSolution : t.showSolution}
      </ActionButton>

      {shown && (
        <div className="mt-6">
          <h3 className="text-2xl font-bold text-primary dark:text-primary-dark mb-2">
            {t.solution}
          </h3>
          <div className="prose-docs">{children}</div>
          <div className="mt-4">
            <ActionButton onClick={() => setShown(false)}>
              {t.closeSolution}
            </ActionButton>
          </div>
        </div>
      )}
    </div>
  );
}
Solution.displayName = "Solution";

// ─── Hint — self-managing with react.dev Button style ────────────────────────

export function Hint({ children }: { children: React.ReactNode }) {
  const [shown, setShown] = useState(false);
  const { locale } = useParams<{ locale: string }>();
  const t = labels[resolveLocale(locale)];

  return (
    <div className="mt-4">
      <ActionButton onClick={() => setShown((v) => !v)} active={shown}>
        <IconHint />
        {shown ? t.hideHint : t.showHint}
      </ActionButton>

      {shown && (
        <div className="mt-3 rounded-lg bg-wash dark:bg-wash-dark border border-border dark:border-border-dark p-4 prose-docs">
          {children}
        </div>
      )}
    </div>
  );
}
Hint.displayName = "Hint";
