# CLAUDE.md — Engineering Curriculum

> **AI agent:** read this entire file before touching any code or writing any lesson. Read at least one reference lesson before writing content.

---

## 1. Rules

@.claude/rules/general.md
@.claude/rules/code-style.md
@.claude/rules/components.md
@.claude/rules/types.md

---

## 2. What This Project Is

A free, public engineering-education website teaching how computers, networks, databases, and distributed systems actually work — concept-based, language-agnostic, never "how to use framework X". It is a fork of [react.dev](https://react.dev) rebuilt with Next.js 15 App Router.

**Stack:** Next.js 15 (App Router) · Tailwind CSS · next-mdx-remote · TypeScript · next-intl · @codesandbox/sandpack-react

**What it is NOT:** a React tutorial, a framework guide, or a bootcamp. Every lesson teaches a concept, not a tool.

---

## 3. Folder Structure

```
src/
├── app/[locale]/                        # App Router (next-intl routing: az / en)
│   ├── layout.tsx                       # Root layout — theme script, font vars
│   ├── page.tsx                         # Home page
│   └── learn/[...path]/page.tsx         # Lesson page (SSG)
├── content/
│   ├── az/learn/                        # Azerbaijani MDX lessons
│   └── en/learn/                        # English MDX lessons (primary)
│       └── faza-0/modul-0-1/
│           ├── bit-ve-byte.md           ← reference lesson 1
│           ├── binary-say-sistemi.md    ← reference lesson 2
│           └── menfi-ededler.md         ← reference lesson 3
├── modules/                             # Page-level feature modules (Home, Learn, LearnDetails)
├── shared/
│   ├── layouts/                         # AppLayout, Sidebar, TopNav, Footer, DocsFooter
│   ├── lib/utils/
│   │   ├── mdx.ts                       # server-only: reads/serializes MDX files
│   │   ├── lesson.ts                    # getLessonLevel, computeDuration (client-safe)
│   │   └── sidebar.ts                   # parseSidebar, getSidebarRouteTree (client-safe)
│   ├── resources/json/
│   │   ├── sidebar.json                 # course structure — Azerbaijani
│   │   └── sidebar-en.json             # course structure — English
│   ├── types/index.ts                   # ISidebarRoute, ITocItem, TLocale, TLessonLevel…
│   └── ui/MDX/                          # all MDX components (see §5)
│       └── MDXComponents.tsx            # central registry — maps tag names → components
└── styles/globals.css                   # global CSS + .prose-docs styles
public/images/docs/diagrams/             # SVG diagrams — light + dark pairs (x.svg / x.dark.svg)
```

### Server vs client boundary

`src/shared/lib/utils/mdx.ts` uses Node.js `fs` and `path` — **server-only**. Never import it from React components or client utilities. Everything in `lesson.ts` and `sidebar.ts` is safe on both sides.

---

## 4. Sidebar JSON

Both `sidebar.json` and `sidebar-en.json` use the same schema. **The sidebar is frozen** — no routes may be added or removed. Only metadata fields may be updated on existing entries.

```jsonc
{
  "hasSectionHeader": true,           // phase separator
  "sectionHeader": "FAZA 0 — ...",
  "description": "Phase description shown on home page card",
  "routes": [
    {
      "title": "Modul 0.1 — ...",
      "routes": [
        {
          "title": "Bit and Byte",
          "path": "/learn/faza-0/modul-0-1/bit-ve-byte",
          "duration": "20 dəq"         // optional — add after lesson is written
        }
      ]
    }
  ]
}
```

**Editable metadata fields:** `duration` · `level` · `wip` · `label` · `description`

---

## 5. MDX Components

All registered in `src/shared/ui/MDX/MDXComponents.tsx`. Use **only** these in lesson files — no raw HTML, no custom components, no imports.

### Structure components

| Component | Props | When to use |
|-----------|-------|-------------|
| `<Intro>` | — | Opening hook — always the first thing in a lesson. 2–4 sentences, story not agenda. |
| `<YouWillLearn>` | — | Learning outcomes — 4–6 concrete bullets, immediately after `<Intro>` |
| `<Recap>` | — | Lesson summary — always last before `<Challenges>`. 5–8 claim-shaped bullets. |
| `<Challenges>` | — | Exercise container — wraps one or more `####` challenge blocks |
| `<Solution>` | — | Full worked answer inside `<Challenges>` — always present |
| `<Hint>` | — | Optional nudge inside `<Challenges>`, before `<Solution>` |
| `<DeepDive>` | — | Optional depth block — reader can skip without losing prerequisites. Needs `####` heading inside. |

### Callout components

| Component | Props | Appearance |
|-----------|-------|------------|
| `<Note>` | — | Blue — useful clarification or non-alarming aside |
| `<Pitfall>` | — | Yellow/red — common mistake. State the mistake first, then the correction. |
| `<Wip>` | — | Purple — marks a lesson that exists in the sidebar but has no content yet |

### Code & interactive

| Component | Props | When to use |
|-----------|-------|-------------|
| `<Sandpack>` | *(code block inside)* | Interactive toy. One per lesson. Plain React + JS, no libraries, ≤80 lines, inline styles only. |
| `<TerminalBlock>` | `level?: 'info'\|'warning'\|'error'` | Shell commands and terminal output |
| `<ConsoleBlock>` | `level?: 'info'\|'warning'\|'error'` | Single browser/Node console line |
| `<ConsoleBlockMulti>` | — | Multiple console lines — wraps `<ConsoleLogLine>` children |
| `<ConsoleLogLine>` | `level?: 'info'\|'warning'\|'error'` | One line inside `<ConsoleBlockMulti>` |
| `<CodeStep>` | `step: 1\|2\|3\|4` | Inline step-numbered highlight in prose |
| `<PackageImport>` | — | Install command left + import statement right, in two columns |

### Diagram & media

| Component | Props | When to use |
|-----------|-------|-------------|
| `<Diagram>` | `name` `alt` `height` `width` `captionPosition?` | SVG from `public/images/docs/diagrams/{name}.svg` + `{name}.dark.svg` |
| `<DiagramGroup>` | — | Wraps two or more `<Diagram>`s in a side-by-side row for comparison |
| `<CodeDiagram>` | `flip?: boolean` | Code block and diagram side by side. `flip` puts diagram on the left. |
| `<Illustration>` | `src` `alt` `caption?` `author?` `authorLink?` | Raster image, centered with optional caption |
| `<IllustrationBlock>` | `sequential?: boolean` `author?` | Row of `<Illustration>`s |
| `<YouTubeIframe>` | `src` `title?` | Responsive 16:9 YouTube embed |

### Navigation & reference

| Component | Props | When to use |
|-----------|-------|-------------|
| `<YouWillLearnCard>` | `title` `path` | Module overview pages — card linking to a lesson |
| `<LearnMore>` | `title` `path?` | Cross-lesson bridge at end of a section |
| `<InlineToc>` | — | Auto-generated anchor list for long lessons — reads from TocContext |

---

## 6. Adding a Lesson

> Read all three reference lessons in `src/content/en/learn/faza-0/modul-0-1/` before writing. Match their structure, voice, and quality. Do not modify them.

### Step 1 — Locate in sidebar

Find the entry in `src/shared/resources/json/sidebar-en.json`. The file slug is the last path segment.

```
sidebar path:  /learn/faza-0/modul-0-1/floating-point
EN file:       src/content/en/learn/faza-0/modul-0-1/floating-point.md
AZ file:       src/content/az/learn/faza-0/modul-0-1/floating-point.md
```

### Step 2 — Write the lesson (MDX skeleton)

```mdx
---
title: 'Lesson Title'
---

<Intro>

2–4 sentence hook — a specific story or sharp question that the lesson resolves.

</Intro>

<YouWillLearn>

- 4–6 concrete takeaways (e.g. "Why X does Y", not "About X")

</YouWillLearn>

## Section Title {/*section-title*/}

Body text...

<Note>

A useful clarification.

</Note>

<Pitfall>

The mistake first, then the fix.

</Pitfall>

<DeepDive>

#### Deep Dive Title {/*deep-dive-anchor*/}

Optional depth.

</DeepDive>

<Sandpack>

```js
import { useState } from 'react';

export default function App() {
  return <div>toy here</div>;
}
```

</Sandpack>

<Diagram name="diagram_name" height={320} width={680} alt="Detailed drawing spec.">

Caption sentence.

</Diagram>

<Recap>

- **Key term**: claim about it.

</Recap>

<Challenges>

#### Challenge Title {/*challenge-anchor*/}

Task description.

<Hint>

Optional nudge.

</Hint>

<Solution>

Full worked answer.

</Solution>

</Challenges>
```

**Hard rules:**
- Frontmatter: `title` only — no other fields
- Every `##` and `####` heading carries `{/*ascii-kebab-anchor*/}` — ASCII only, no unicode
- Length: 1,800–3,000 words · English only · no raw HTML · no imports

### Step 3 — Add diagrams

For each `<Diagram name="x">` provide:
```
public/images/docs/diagrams/x.svg
public/images/docs/diagrams/x.dark.svg
```

The `alt` attribute is the drawing spec. Write it so a designer can produce the SVG from the alt text alone. Name in `snake_case`, unique across the whole site.

**Light palette:** `#23272F` / `#99A1B3` / `#087EA4` / `#C1554D`
**Dark palette:** `#F6F7F9` / `#99A1B3` / `#149ECA` / `#E06C60`

### Step 4 — Update sidebar metadata (optional)

Once the lesson has real content, add `"duration"` to the sidebar entry in both JSON files.

### Step 5 — Type-check

```bash
npx tsc --noEmit
```

No errors before committing.

---

## 7. Lesson Quality Rules

### Structure (required elements)

Every lesson must have: `<Intro>` · `<YouWillLearn>` · `<Recap>` · `<Challenges>` (3–5 with `<Solution>`)

Recommended pattern:
1. Hook (story or sharp question) in `<Intro>`
2. Problem before the solution — show naive approaches and why they fail
3. One developed physical analogy (not three weak ones)
4. At least two worked examples in ASCII code blocks with a `✓` at the end
5. At least one true real-world incident with specific numbers
6. 1–2 `<DeepDive>`s for optional depth
7. At least one `<Pitfall>` — state the mistake first
8. One `<Sandpack>` where it helps the reader trigger the core phenomenon
9. 2–4 `<Diagram>`s
10. `<Recap>` with 5–8 claim-shaped bullets (bold the key terms)
11. 3–5 `<Challenges>` — range from mechanical to transfer tasks

### Sandpack rules

- Plain React + JS only — `import { useState } from 'react'`
- No external libraries · no TypeScript · no `localStorage` · no `fetch` · no timers unless essential
- One default-exported component · ≤80 lines · inline styles only
- Colors: accent `#087ea4`, danger `#c1554d` — nothing else
- The toy must let the reader *cause* the lesson's core phenomenon

### Voice and style

- Second person, present tense, confident and warm
- **Why before what, always.** Never open with "In this lesson we will discuss..."
- Bold a key term at its **first** appearance only
- Numbers over adjectives: "≈248 days", "2,147,483,647" — not "a long time", "a huge number"
- At least one backward reference to an earlier lesson, one forward tease to a later one
- Occasional dry humor — one per lesson, maximum

### Truth rules

- Only well-documented incidents and history
- If uncertain of a date, number, or attribution — generalize or omit. Never invent.
- Simplification is allowed; falsehood is not

### Don'ts

- No tool tutorials or framework "how to"
- No copying from other sources
- No sidebar changes (frozen)
- No `<Sandpack>` with external libraries
- No Azerbaijani in EN lesson files
- Do not modify the three reference lessons under any circumstance

### Final checklist

- [ ] Frontmatter has only `title`; every `##`/`####` heading has an ASCII anchor
- [ ] Intro is a story/hook, not an agenda
- [ ] Problem shown before solution (where applicable)
- [ ] ≥1 physical analogy; ≥2 worked examples with `✓`
- [ ] ≥1 real-world story with specific numbers; nothing invented
- [ ] 1–2 DeepDives; ≥1 Pitfall; 2–4 Diagrams with drawing-spec alt text
- [ ] Sandpack: plain React, ≤80 lines, reader can trigger the core phenomenon
- [ ] ≥1 backward reference; ≥1 forward tease
- [ ] Recap: 5–8 claim bullets; Challenges: 3–5 with full solutions, last one is a transfer task
- [ ] 1,800–3,000 words; English; no tool tutorials
- [ ] `npx tsc --noEmit` passes
