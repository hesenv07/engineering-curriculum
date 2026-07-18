# Contributing to Engineering Curriculum

---

## 1. Development Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Install and run

```bash
git clone <repo-url>
cd engineering-curriculum
npm install
npm run dev
```

Open http://localhost:3000.

### Available commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server with hot reload |
| `npm run build` | Production build (runs type compilation) |
| `npm run type-check` | TypeScript check without emitting |
| `npm run lint` | Run ESLint |

**Run `npm run type-check` before every commit.** This project has no CI type check — catching errors locally prevents broken builds.

---

## 2. Branch Naming

```
<type>/<short-description>
```

| Type | When to use |
|------|-------------|
| `feat` | New lesson, new UI feature, new component |
| `fix` | Bug fix |
| `refactor` | Code restructure without behavior change |
| `docs` | Documentation changes only |
| `chore` | Dependency updates, config, tooling |

**Examples:**

```
feat/lesson-floating-point
feat/lesson-transistors-logic-gates
fix/sidebar-mobile-toggle
docs/update-contributing
refactor/extract-sidebar-utils
chore/upgrade-next-15
```

**Rules:**
- Always branch off `main`
- One concern per branch — never mix lesson content with UI changes
- Delete your branch after the PR is merged
- Never push directly to `main`

---

## 3. Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>
```

The scope is optional but recommended. Summary: lowercase, imperative mood, no period at the end. Keep the summary line under 72 characters.

**Examples:**

```
feat(content): add floating point representation lesson
fix(sidebar): mobile panel not opening on small screens
fix(mdx): heading anchor scrolls behind sticky header
refactor(utils): extract parseSidebar to sidebar.ts
docs(readme): update architecture section
chore(deps): upgrade next-mdx-remote to v6
```

---

## 4. Pull Request Process

### Before opening a PR

- [ ] `npm run type-check` passes with no errors
- [ ] `npm run build` completes successfully
- [ ] Lesson added to **both** `src/shared/resources/json/sidebar.json` and `sidebar-en.json`
- [ ] Content files present in both locales: `src/content/az/learn/` and `src/content/en/learn/`
- [ ] No `console.log` statements left in code
- [ ] No `any` types introduced

### PR title

Use the same format as commit messages:

```
feat(content): add lesson on floating point representation
fix(sidebar): mobile panel hidden behind lg:block class
```

### PR description template

```markdown
## What

Short description of the change.

## Why

Reason for the change or the problem it solves.

## Checklist

- [ ] type-check passes
- [ ] build passes
- [ ] both sidebar JSON files updated
- [ ] both locale content files present
```

### Review

- At least one approval required before merging
- Resolve all review comments before merging
- Squash commits on merge is preferred for content PRs

---

## 5. Adding a New Lesson

A lesson is a single MDX file (`.md`). The course structure is defined in the sidebar JSON files — **do not add or remove routes**, the roadmap is frozen. You may only add metadata (`duration`, `wip`, etc.) to existing entries.

### Step 1 — Find the lesson in the sidebar

Open `src/shared/resources/json/sidebar-en.json` and find the target entry. Note its `path`.

```
sidebar path:  /learn/faza-0/modul-0-1/floating-point
EN file:       src/content/en/learn/faza-0/modul-0-1/floating-point.md
AZ file:       src/content/az/learn/faza-0/modul-0-1/floating-point.md
```

### Step 2 — Create the MDX file

The lesson skeleton:

```mdx
---
title: 'Lesson Title'
---

<Intro>

2–4 sentences. A specific story or sharp question — not an agenda.

</Intro>

<YouWillLearn>

- 4–6 concrete takeaways ("Why X causes Y", not "About X")

</YouWillLearn>

## Section Heading {/*section-heading*/}

Content...

<Note>

A useful, non-alarming clarification.

</Note>

<Pitfall>

State the mistake first, then the fix.

</Pitfall>

<DeepDive>

#### Deep Dive Title {/*deep-dive-anchor*/}

Optional deeper explanation. Reader can skip without losing prerequisites.

</DeepDive>

<Sandpack>

```js
import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

</Sandpack>

<Diagram
  name="diagram_name"
  height={320}
  width={680}
  alt="Drawing spec: describe every element, layout, labels, and highlights."
>

One-sentence caption.

</Diagram>

<Recap>

- **Key term**: a claim about it.
- **Another term**: what it means or does.

</Recap>

<Challenges>

#### Challenge Title {/*challenge-anchor*/}

Task description.

<Hint>

Optional nudge toward the solution.

</Hint>

<Solution>

Full worked answer — show every step, add the one extra insight.

</Solution>

</Challenges>
```

**Hard rules:**
- Frontmatter: `title` only
- Every `##` and `####` heading must have `{/*ascii-kebab-anchor*/}` — ASCII only
- Length: 1,800–3,000 words
- English only in lesson files — no Azerbaijani
- No raw HTML, no imports, no components other than those listed below

### Step 3 — Add diagrams (if needed)

For each `<Diagram name="x">` add two SVG files:

```
public/images/docs/diagrams/x.svg
public/images/docs/diagrams/x.dark.svg
```

The `alt` attribute is the design spec — write it so a designer can produce the SVG from the alt text alone. Name in `snake_case`, unique across the whole site.

### Step 4 — Update sidebar metadata

Once the lesson is written, add `"duration"` to its entry in both `sidebar.json` and `sidebar-en.json`. Duration is optional but useful for readers planning their session.

### Step 5 — Type-check and verify

```bash
npm run type-check
npm run build
```

Check the lesson renders at its expected URL with correct prev/next navigation.

### Step 6 — Open a PR

Follow the PR process in §4.

---

## 6. MDX Components Reference

These are the only components allowed in lesson files. All are registered in `src/shared/ui/MDX/MDXComponents.tsx`.

### Structure

| Component | Purpose |
|-----------|---------|
| `<Intro>` | Opening hook — always the very first element. 2–4 sentence story or question. |
| `<YouWillLearn>` | Bulleted learning outcomes. Place after `<Intro>`. 4–6 bullets. |
| `<Recap>` | Lesson summary. Always the last element before `<Challenges>`. 5–8 claim bullets. |
| `<Challenges>` | Container for one or more challenge blocks (`####` heading + task + `<Solution>`). |
| `<Solution>` | Full worked answer inside `<Challenges>`. Always present. |
| `<Hint>` | Optional nudge inside `<Challenges>`, placed before `<Solution>`. |
| `<DeepDive>` | Collapsible optional-depth block. Must contain a `####` heading inside. |

### Callouts

| Component | Color | Purpose |
|-----------|-------|---------|
| `<Note>` | Blue | Useful clarification or non-alarming aside |
| `<Pitfall>` | Yellow/red | Common mistake — state the mistake first, then the fix |
| `<Wip>` | Purple | Lesson placeholder — content not yet written |

### Code and interactive

| Component | Key props | Purpose |
|-----------|-----------|---------|
| `<Sandpack>` | *(code block child)* | Interactive code editor. Plain React + JS. One per lesson. ≤80 lines. |
| `<TerminalBlock>` | `level?: 'info'\|'warning'\|'error'` | Dark terminal block for shell commands and output |
| `<ConsoleBlock>` | `level?: 'info'\|'warning'\|'error'` | Single browser console line |
| `<ConsoleBlockMulti>` | — | Multiple console lines — wraps `<ConsoleLogLine>` children |
| `<ConsoleLogLine>` | `level?` | One line inside `<ConsoleBlockMulti>` |
| `<CodeStep>` | `step: 1\|2\|3\|4` | Color-coded inline step highlight in prose |
| `<PackageImport>` | — | Install command (left) + import statement (right) in a two-column layout |

### Diagrams and media

| Component | Key props | Purpose |
|-----------|-----------|---------|
| `<Diagram>` | `name` `alt` `height` `width` `captionPosition?` | SVG from `public/images/docs/diagrams/`. Light + dark pair required. |
| `<DiagramGroup>` | — | Wraps two or more `<Diagram>`s side by side for comparison |
| `<CodeDiagram>` | `flip?: boolean` | Code block and diagram split layout. `flip` puts diagram on the left. |
| `<Illustration>` | `src` `alt` `caption?` `author?` `authorLink?` | Centered raster image with optional caption |
| `<IllustrationBlock>` | `sequential?: boolean` `author?` | Row of `<Illustration>` images |
| `<YouTubeIframe>` | `src` `title?` | Responsive 16:9 YouTube embed |

### Navigation

| Component | Key props | Purpose |
|-----------|-----------|---------|
| `<YouWillLearnCard>` | `title` `path` | Module overview page card linking to a lesson |
| `<LearnMore>` | `title` `path?` | Cross-lesson bridge section at the end of a topic |
| `<InlineToc>` | — | Auto-generated in-page anchor list for long lessons |

---

## 7. Code Standards

Full details in `.claude/rules/`. Key rules:

### TypeScript

- No `any` — use `unknown` + a type guard
- `import type` for type-only imports
- Interface names: `I` prefix (`IButtonProps`, `ISidebarRoute`)
- Type alias names: `T` prefix (`TLessonLevel`, `TOption`)
- Enum names: no prefix, PascalCase (`BaseSizes`, `UserStatus`)

### Components

- One component per file — never define a component inside another component
- Props interface named `I[ComponentName]Props`
- Do not use `React.FC` — plain functions with typed props only
- Max ~250 lines per file — split when exceeded
- No array index as JSX key — use a stable unique identifier
- No inline `style={{}}` for static values — use Tailwind classes
- `useEffect` dependency array must never be empty without an inline comment explaining why

### Imports

Sorted by total line length (shortest first) within each group, with blank lines between groups:

1. External packages
2. Internal absolute imports (`@/...`)
3. Relative imports (`./`, `../`)
4. Type-only imports (always last)

### Server vs client

`src/shared/lib/utils/mdx.ts` uses Node.js `fs` — **server-only**. Never import it from client components or shared utilities. `lesson.ts` and `sidebar.ts` are client-safe.

---

## 8. Review Guidelines

### For authors

- Self-review your diff before requesting review
- Keep PRs focused — one lesson or one UI fix per PR
- Explain non-obvious decisions in the PR description

### For reviewers

**Check for:**
- Correct MDX structure — components used as intended
- Both locale files present (`az` + `en`)
- Lesson follows the required structure (Intro → YouWillLearn → ... → Recap → Challenges)
- No `any` types
- Diagram alt text is a real drawing spec
- Lesson content is concept-first — no framework tutorials

**A PR is ready to merge when:**
1. All checks pass (`type-check`, `build`)
2. At least one reviewer approved
3. All review comments resolved
4. Both locale sidebar entries and content files are complete
