# CLAUDE.md — Engineering Curriculum

> **If you are Claude (or any AI agent):** read this file in full before touching any code or
> writing any lesson. Read at least one reference lesson listed in §7 before writing a new one.

---

## 1. Rules

@.claude/rules/general.md
@.claude/rules/code-style.md
@.claude/rules/components.md
@.claude/rules/types.md

---

## 2. What This Project Is

A public, free engineering-education website. It teaches **how computers, networks, databases,
and distributed systems actually work** — never "how to use framework X". The site is a fork of
the [react.dev](https://react.dev) codebase, so it uses the same MDX pipeline and the same
custom components (`<Intro>`, `<DeepDive>`, `<Sandpack>`, etc.).

**What it is not:** a React tutorial, a framework guide, or a language reference. Every lesson
is concept-based and language-agnostic.

Tech stack: Next.js 14 (Pages Router, SSG) · Tailwind CSS · next-mdx-remote · TypeScript ·
@codesandbox/sandpack-react

---

## 3. Folder Structure

```
engineering-curriculum/
├── public/
│   └── images/docs/diagrams/   # SVG diagrams for lessons (light + dark pairs)
│       ├── light_switches.svg
│       └── light_switches.dark.svg
├── src/
│   ├── content/                # MDX lesson files (the actual course content)
│   │   ├── az/learn/           # Azerbaijani content (mirrors EN structure)
│   │   └── en/learn/           # English content — primary
│   │       └── faza-0/
│   │           └── modul-0-1/
│   │               ├── bit-ve-byte.md          ← reference lesson 1
│   │               ├── binary-say-sistemi.md   ← reference lesson 2
│   │               └── menfi-ededler.md        ← reference lesson 3
│   ├── components/
│   │   ├── Icon/               # SVG icon components
│   │   ├── Layout/
│   │   │   ├── Footer/
│   │   │   ├── Sidebar/        # SidebarRouteTree, SidebarLink, SidebarButton
│   │   │   └── TopNav/         # Language selector, theme toggle
│   │   └── MDX/
│   │       └── MDXComponents/  # Maps MDX tag names → React components
│   ├── hooks/
│   │   └── usePendingRoute.ts
│   ├── pages/
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   ├── index.tsx           # Home page — dynamic via getStaticProps
│   │   └── learn/
│   │       └── [...path].tsx   # Catch-all lesson page
│   ├── plugins/                # remark / rehype plugins
│   ├── styles/                 # Global CSS
│   ├── types/
│   │   └── index.ts            # Shared TypeScript types (ISidebarRoute, etc.)
│   └── utils/
│       ├── mdx.ts              # Server-only: reads and serializes MDX files
│       ├── lesson.ts           # Client-safe: getLessonLevel, computeDuration
│       └── sidebar.ts          # Client-safe: parseSidebar, IPhaseCard, ISidebarStats
├── sidebar.json                # Course structure — Azerbaijani
├── sidebar-en.json             # Course structure — English
├── .claude/rules/              # Code rules (read before editing any file)
└── CLAUDE.md                   # This file
```

---

## 4. Core Data Structures

### 4.1 `sidebar.json` / `sidebar-en.json`

The sidebar files define the **complete course structure**. They are the single source of truth
for navigation, stats, and the home page phase grid. **Do not add or remove lesson entries**
— the course roadmap is frozen. You may only add metadata fields.

```jsonc
{
  "title": "Mühəndislik Kurikulumu",
  "path": "/learn",
  "routes": [
    // Phase header — separates phases. Metadata may be added here.
    {
      "hasSectionHeader": true,
      "sectionHeader": "FAZA 0 — Kompüterlər necə işləyir",
      "description": "Transistordan CPU-ya, RAM-dan diskə — metal səviyyəsindən başla.",
      "label": "Finallar"       // optional — shown as badge instead of "FAZA N"
    },
    // Module group — no path, just child routes
    {
      "title": "Modul 0.1 — Məlumatın Təmsili",
      "routes": [
        // Leaf lesson — has a path
        {
          "title": "Bit və bayt: informasiya nədir",
          "path": "/learn/faza-0/modul-0-1/bit-ve-byte",
          "duration": "20 dəq"  // optional
        }
      ]
    }
  ]
}
```

**All `ISidebarRoute` fields** (`src/types/index.ts`):

| Field | Type | Purpose |
|-------|------|---------|
| `title` | `string?` | Display name |
| `path` | `string?` | URL (leaf lessons only) |
| `routes` | `ISidebarRoute[]?` | Child routes (modules or lessons) |
| `heading` | `boolean?` | Renders as a heading, not a link |
| `hasSectionHeader` | `boolean?` | Phase separator — carries section metadata |
| `sectionHeader` | `string?` | Phase header text, e.g. `"FAZA 0 — ..."` |
| `description` | `string?` | Phase description for home page cards |
| `label` | `string?` | Override badge text (e.g. `"Finallar"`) |
| `duration` | `string?` | Reading time, e.g. `"20 dəq"` / `"20 min"` |
| `level` | `TLessonLevel?` | `"Fundamental"` \| `"Intermediate"` \| `"Deep"` |
| `version` | `string?` | `"canary"` \| `"major"` \| `"experimental"` \| `"rc"` |
| `wip` | `boolean?` | Work-in-progress marker |

### 4.2 `ISidebarStats` (`src/utils/sidebar.ts`)

Returned by `parseSidebar(routes)`. Used by the home page `getStaticProps`:

```typescript
interface ISidebarStats {
  phases: IPhaseCard[];     // one entry per phase (section header)
  totalPhases: number;
  totalModules: number;
  totalLessons: number;
}

interface IPhaseCard {
  id: string;               // "0", "1", … "11"
  badgeText: string;        // "FAZA 0" or label override
  title: string;            // extracted from sectionHeader after "—"
  desc: string;             // from description field
  lessonCount: number;      // total leaves in this phase
  path: string;             // first available lesson path, or "/learn"
}
```

---

## 5. Key Utilities

### `src/utils/mdx.ts` — **server-only**
> Contains `import fs from 'fs'` — never import in client components.

| Export | Purpose |
|--------|---------|
| `getAllContentPaths(locale?)` | Returns all `string[][]` path segments for `getStaticPaths` |
| `getContentByPath(slugParts, locale?)` | Reads, parses, and serializes one MDX file. Returns `{ mdxSource, meta, toc, lineCount }` or `null` |

### `src/utils/lesson.ts` — **client-safe**
> Pure functions, no Node.js imports. Safe to use in components.

| Export | Purpose |
|--------|---------|
| `getLessonLevel(urlPath)` | Derives `TLessonLevel` from faza number in URL |
| `computeDuration(lineCount, locale?)` | `Math.ceil(lines / 75) * 5` → `"20 min"` or `"20 dəq"` |

**Level mapping:** faza 0–1 → `"Fundamental"` · faza 2–5 → `"Intermediate"` · faza 6+ → `"Deep"`

### `src/utils/sidebar.ts` — **client-safe**
| Export | Purpose |
|--------|---------|
| `parseSidebar(routes)` | Groups routes by phase, counts modules/lessons, extracts first paths. Returns `ISidebarStats` |
| `IPhaseCard` | Interface for a single phase card |
| `ISidebarStats` | Interface for the full parsed result |

---

## 6. Key Components

### `src/pages/index.tsx`
Home page. Uses `getStaticProps` to call `parseSidebar` on the locale-appropriate sidebar JSON.
All stats and phase cards are dynamic — derived from `sidebar.json` at build time. Static content
(hero copy, badge text, CTAs) lives in the `CONTENT` constant inside the file.

### `src/pages/learn/[...path].tsx`
Catch-all lesson page. `getStaticPaths` reads all content files. `getStaticProps` calls
`getContentByPath`, then computes `lessonLevel` and `duration` from `@/utils/lesson`.
Renders `<h1>`, an optional level/duration badge row, then `<MDXRemote>`.

### `src/components/Layout/Sidebar/SidebarRouteTree.tsx`
Recursive tree that renders the sidebar. Reads `duration` from sidebar routes and passes it to
`SidebarLink`. Levels are no longer shown in the sidebar — only on the lesson page itself.

### `src/components/MDX/MDXComponents`
Maps MDX component names to React implementations. Every custom MDX tag (`<Intro>`, `<Note>`,
`<DeepDive>`, `<Sandpack>`, `<Diagram>`, etc.) is registered here.

---

## 7. Adding a New Lesson — Step by Step

> **Before writing anything:** read at least one reference lesson in full.
> The three completed lessons are the **gold standard** for format, voice, and quality:
>
> - `src/content/en/learn/faza-0/modul-0-1/bit-ve-byte.md` — Lesson 1 (bits & bytes)
> - `src/content/en/learn/faza-0/modul-0-1/binary-say-sistemi.md` — Lesson 2 (binary numbers)
> - `src/content/en/learn/faza-0/modul-0-1/menfi-ededler.md` — Lesson 3 (two's complement)
>
> Match their structure. Match their voice. Match their quality bar.
> **Do not modify these files under any circumstance.**

### Step 1 — Locate the lesson in the sidebar

Find the target entry in `sidebar-en.json` (or `sidebar.json`). Note:
- Its position in the course (what the reader already knows above it, what comes after)
- The exact `path` value — the file slug is the last segment, e.g. `floating-point`

The sidebar structure is **frozen**: no entries may be added or removed. Only metadata fields
(`description`, `duration`, `level`, `label`) may be added to existing entries.

### Step 2 — Create the MDX file

Place the file at the exact path derived from the sidebar entry:

```
sidebar path:  /learn/faza-0/modul-0-1/floating-point
EN file:       src/content/en/learn/faza-0/modul-0-1/floating-point.md
AZ file:       src/content/az/learn/faza-0/modul-0-1/floating-point.md
```

If only writing English first, the site will fall back to AZ content automatically for
`az` locale users (see `[...path].tsx` `getStaticProps`).

### Step 3 — Write the lesson

Follow the **LESSON-AUTHORING PROMPT** in §8 of this document exactly. Key constraints:
- Frontmatter: `title` only
- Every `##` and `####` heading must have an ASCII anchor `{/*like-this*/}`
- 1,800–3,000 words
- English throughout

### Step 4 — Add diagrams (if needed)

For each `<Diagram name="x" ...>`, provide two SVG files:
```
public/images/docs/diagrams/x.svg
public/images/docs/diagrams/x.dark.svg
```
The `alt` attribute on `<Diagram>` is the drawing spec — write it so a designer can produce
the SVG from the alt text alone.

### Step 5 — Optionally update sidebar metadata

If the lesson has actual content, you may add `"duration"` to its sidebar entry
(both `sidebar.json` and `sidebar-en.json`). The duration on the lesson page itself is
computed automatically from line count — no manual entry needed there.

### Step 6 — Type-check

```bash
npx tsc --noEmit
```

No errors before committing.

---

## 8. Lesson-Authoring Prompt

> Give this entire section as the system prompt (or first message) to whoever writes lessons —
> a person or an AI. It defines the format, the voice, the quality bar, and the workflow.
> Three finished lessons exist and are the gold standard:
> `bit-ve-byte`, `binary-say-sistemi`, `menfi-ededler` (negative numbers / two's complement).
> Read at least one of them before writing anything. Match them. Do not modify them.

---

### 8.1 Who you are and what you're making

You are writing lessons for a public engineering-education website. The site is a fork of the
react.dev codebase, so lessons are MDX files using react.dev's built-in components. The
curriculum is **concept-based**: it teaches how computers, networks, databases, and distributed
systems actually work — never "how to use framework X". A reader starts from zero (bits and
bytes) and walks a fixed path defined in `sidebar-en.json` all the way to system design case
studies.

**All lessons are written in English.** Technical terms stay in their standard English form.

The reader: a developer who can write code but doesn't know what happens underneath it.
Assume they have read **every previous lesson in the sidebar order and nothing else**. Check the
lesson's position in the sidebar before writing — you may use any concept taught earlier, and
you must not depend on anything taught later (a one-line forward tease with "we'll see in the X
phase" is fine and encouraged).

### 8.2 The file: react.dev MDX conventions

Every lesson is one `.md` file. Skeleton:

```mdx
---
title: 'Lesson Title'
---

<Intro>

2–4 sentences. Usually the hook's opening. No headings inside.

</Intro>

<YouWillLearn>

- 4–6 bullets, each a concrete takeaway ("Why X does Y", not "About X")

</YouWillLearn>

## Section Title {/*section-title*/}

Body...

<Note>...</Note>

<DeepDive>

#### Deep dive title {/*deep-dive-anchor*/}

...

</DeepDive>

<Pitfall>...</Pitfall>

<Sandpack>

```js
// one App component
```

</Sandpack>

<Diagram name="diagram_name" height={320} width={680} alt="Detailed drawing spec — see §8.5.">

One-sentence caption.

</Diagram>

<Recap>

- 5–8 bullets

</Recap>

<Challenges>

#### Challenge title {/*challenge-anchor*/}

The task.

<Solution>

Full worked answer.

</Solution>

</Challenges>
```

Hard rules:

- Frontmatter contains **only** `title`.
- **Every** heading (`##`, `####` in DeepDives and Challenges) carries an anchor:
  `{/*ascii-kebab-case*/}`. ASCII only — no unicode characters in anchors, ever.
- Allowed components: `Intro`, `YouWillLearn`, `Note`, `Pitfall`, `DeepDive`, `Recap`,
  `Challenges`/`Solution`, `Sandpack`, `Diagram`. Nothing else — no custom components, no raw
  HTML, no `<Illustration>`.
- Tables are plain markdown tables. Math/derivations go in plain ``` code blocks with aligned
  ASCII (see the worked examples in the finished lessons) — no LaTeX.

### 8.3 The anatomy of a lesson (the formula — follow it)

1. **Hook (the Intro + often the first paragraphs).** Open with a true, specific, dramatic
   story or a sharp everyday question that the lesson will resolve. The finished lessons open
   with the Pac-Man level-256 kill screen, and the Ariane 5 explosion. Specifics matter: dates,
   numbers, names. The hook must genuinely depend on the lesson's concept — not decoration.
2. **The problem before the solution.** Never present a mechanism before the reader feels the
   problem it solves. If the topic is a fix (two's complement, TCP, cache, consensus), first
   show the naive approaches and *why they fail* — walk through the failure concretely.
3. **A physical analogy.** Every abstract mechanism gets one everyday-object analogy, developed
   over several sentences: the odometer for number wrapping, light switches for bits. One good
   analogy, not three weak ones. Reuse the site's established analogies when the topic connects
   to them (see §8.6).
4. **Worked examples.** At least two, in ASCII code blocks, every step shown, with a `✓` check
   at the end. Numbers small enough to verify mentally.
5. **Real-world stories.** Every rule, limit, or trade-off is anchored to at least one true
   production incident, historical decision, or piece of engineering folklore. This is the
   site's signature. (Accuracy rules in §8.7.)
6. **1–2 `<DeepDive>`s.** Optional-depth material: the more elegant mental model, the historical
   tangent, the "where did the loser technology go" story. A reader who skips them loses no
   prerequisites.
7. **At least one `<Pitfall>`.** The misconception or bug pattern practitioners actually hit.
   Phrase it as the mistake first, then the correction.
8. **One `<Sandpack>` where interaction helps** (most Phase 0–1 lessons; use judgment later —
   a TLS lesson may not need one). Rules in §8.4.
9. **2–4 `<Diagram>`s.** Rules in §8.5.
10. **`<Recap>`** — 5–8 bullets that could serve as the reader's permanent notes. Bold the key
    terms. Each bullet is a claim, not a topic name.
11. **3–5 `<Challenges>`,** each with a full `<Solution>`. Range from mechanical practice to a
    transfer task (apply the concept in a scenario the lesson didn't show). Solutions teach:
    show the work, add the one extra insight.

Length: **1,800–3,000 words** (15–22 minutes of reading). If the outline honestly exceeds that,
the topic needs to be split — flag it instead of compressing.

### 8.4 Sandpack rules

- Plain React + JS only: `import { useState } from 'react'` — **no external libraries, no
  TypeScript, no localStorage, no fetch, no timers unless essential.**
- One default-exported component, under ~80 lines, inline styles only.
- Colors: accent `#087ea4`, danger `#c1554d` — nothing else.
- The toy must let the reader *cause* the lesson's core phenomenon (flip bits, trigger the
  overflow, race two writers), and it should echo the hook when possible (the overflow counter
  starts at 250 so the reader personally re-creates Pac-Man's death).
- Add a one-line printed explanation inside the toy for the moment the phenomenon fires.
- Continuity trick: later toys may extend earlier ones (the signed/unsigned panel reuses the
  8-switch byte toy from lesson 1). Prefer extending an established toy over inventing a new
  metaphor.

### 8.5 Diagram rules

`<Diagram name="x" height={H} width={W} alt="...">caption</Diagram>` expects two SVG files in
`public/images/docs/diagrams/`: `x.svg` (light) and `x.dark.svg`.

- **The `alt` text is the drawing spec.** Write it so a designer (or an AI) can produce the SVG
  from the alt alone: what elements, what layout, what is highlighted, what the labels say.
- Text **inside** the SVG is minimal and in English (assets are shared across locales); the
  caption under the diagram carries the explanation.
- Style: transparent background, monospace font for digits/code, sans-serif for annotations,
  1.5–2px strokes, rounded rects (6–10px radius). Light palette: text `#23272F`, muted
  `#99A1B3`, accent `#087EA4`, danger `#C1554D`. Dark palette: `#F6F7F9`, `#99A1B3`, `#149ECA`,
  `#E06C60`. The dark file is the light file with those colors substituted.
- Name in `snake_case`, unique across the whole site (check existing diagram names).
- Diagram when structure/flow/highlighting is the point; code block when sequential arithmetic
  is the point. Don't diagram what a table says better.

### 8.6 Voice, style, and continuity

- Second person, present tense, confident and warm. Contractions welcome. Occasional dry humor
  (one per lesson, maximum).
- **Why before what, always.** Ban openers like "In this lesson we will discuss..." — the Intro
  is a story, not an agenda.
- Bold a key term at its **first** appearance only. Prefer short paragraphs (2–5 sentences).
  Prose carries the lesson; bullets appear only in `YouWillLearn`, `Recap`, and genuinely
  list-shaped content.
- **Numbers over adjectives**: "≈248 days", "2,147,483,647", "37 seconds" — not "a long time",
  "a huge number".
- **Spiral references.** Connect backward explicitly at least once ("the 'everything is
  interpretation' idea from Lesson 1 strikes again") and tease forward at least once ("we'll
  see why at the circuit level in the CPU lesson"). The site's recurring motifs — reuse them
  when honest: *everything is bytes, interpretation gives meaning* (L1); *the odometer/dial and
  carry* (L2); *"2ⁿ−1 = n ones"* (L2); *limits look unreachable at design time, systems outlive
  their designers' assumptions* (L2–L3); *correct algorithm, broken implementation* (L3).
- Paired lessons exist by design (Cookies 3.4 ↔ browser storage 6.5; OS cron 2.6 ↔ distributed
  scheduled jobs 5.4; Git mental model 1.4 ↔ Git internals 8.7; XSS mechanics 9.2 ↔ browser
  defenses 6.5; serialization 5.4 ↔ schema evolution 7.3). When writing one half, name the
  other half and draw the boundary explicitly — do not re-teach it.

### 8.7 Truth rules (non-negotiable)

- Use only well-documented incidents and history. Verified examples already in use: Pac-Man
  level 256 (1980), ENIAC decimal design (1945), Leibniz binary paper (1703), IBM System/360
  8-bit byte (1964), Gangnam Style 32-bit counter (2014), Boeing 787 248-day directive (2015),
  Y2038, IPv4 exhaustion (2011–2019), Ariane 5 flight 501 (1996), Bloch's Java `binarySearch`
  overflow post (2006).
- If you are not certain of a date, number, or attribution: **generalize or omit. Never
  invent.** No fabricated quotes, no made-up statistics, no "studies show".
- Simplification is allowed; falsehood is not. When you simplify, don't state the simplified
  model as the full truth if a later lesson will correct it — hedge with "at this level of
  detail" or promise the refinement.

### 8.8 Hard "don't"s

- Don't teach tools or frameworks ("how to configure X") — concepts only.
- Don't copy text from react.dev, Wikipedia, books, or blogs. Everything is written fresh.
- Don't touch the three finished lessons or any existing file.
- Don't change slugs, paths, or the sidebar — the roadmap is frozen.
- Don't exceed one Sandpack per lesson; don't ship a Sandpack that needs a library.
- Don't end a lesson without Recap + Challenges.
- Don't write Azerbaijani in lesson files — lessons are English end to end.

### 8.9 Workflow per lesson

1. Locate the lesson in `sidebar-en.json`; list what the reader already knows (everything
   above it) and what's coming (for teases).
2. Outline: hook candidate → problem → mechanism → 2 worked examples → real-world stories →
   DeepDive/Pitfall candidates → toy idea → diagram list → challenge list.
3. Write the full MDX in one file named exactly after the sidebar slug (`<slug>.md`).
4. Write each Diagram alt as a complete drawing spec; produce `x.svg` + `x.dark.svg` if you're
   also generating art, otherwise the alt is the handoff.
5. Self-review against the checklist below. Fix, then deliver.

### 8.10 Final checklist (verify every box before delivering)

- [ ] Frontmatter has only `title`; every heading has an ASCII anchor
- [ ] Intro is a hook (story/question), not an agenda
- [ ] Naive/failed approach shown before the real mechanism (where applicable)
- [ ] ≥1 developed physical analogy; ≥2 worked examples with a `✓` check
- [ ] ≥1 true real-world story with specific numbers; nothing invented
- [ ] 1–2 DeepDives, ≥1 Pitfall, 2–4 Diagrams with spec-grade alt text
- [ ] Sandpack (if present): plain React, ≤80 lines, reader can trigger the core phenomenon
- [ ] ≥1 backward reference to an earlier lesson, ≥1 forward tease
- [ ] Recap: 5–8 claim-shaped bullets; Challenges: 3–5 with full solutions, last one is a transfer task
- [ ] 1,800–3,000 words; English throughout; no tool tutorials; paired lesson (if any) linked, not re-taught
