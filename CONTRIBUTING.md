# Contributing to Engineering Curriculum

Thank you for contributing. This guide covers everything you need to set up your environment, understand the project standards, and submit quality contributions.

---

## Table of Contents

1. [Development Setup](#1-development-setup)
2. [Branch Strategy](#2-branch-strategy)
3. [Commit Convention](#3-commit-convention)
4. [Pull Request Process](#4-pull-request-process)
5. [Adding a New Lesson](#5-adding-a-new-lesson)
6. [Code Standards](#6-code-standards)
7. [Review Guidelines](#7-review-guidelines)

---

## 1. Development Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Steps

```bash
# Clone the repository
git clone <repo-url>
cd engineering-curriculum

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open http://localhost:3000.

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server with hot reload |
| `npm run build` | Production build (runs type check + compilation) |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checker without emitting |

**Run `npm run type-check` before every commit.** The project has no CI type check yet — catching errors locally prevents broken builds.

---

## 2. Branch Strategy

### Branch Naming

```
<type>/<short-description>
```

| Type | When to use |
|------|-------------|
| `feat` | New lesson, new UI feature, new component |
| `fix` | Bug fix |
| `refactor` | Code restructuring with no behavior change |
| `docs` | Documentation changes (README, CLAUDE.md, etc.) |
| `chore` | Dependency updates, config changes, tooling |

**Examples:**

```
feat/lesson-binary-number-system
feat/lesson-transistors-logic-gates
fix/sidebar-active-link-highlight
docs/update-readme-architecture
refactor/extract-sidebar-utils
chore/upgrade-next-14
```

### Rules

- Branch off from `main`
- One concern per branch — do not mix lesson content with UI changes
- Delete your branch after the PR is merged
- Never push directly to `main`

---

## 3. Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>
```

The `scope` is optional but recommended. The summary is in lowercase, imperative mood, no period at the end.

**Examples:**

```
feat(content): add binary number system lesson in az and en
fix(sidebar): correct active link state on route change
refactor(utils): extract parseSidebar to sidebar.ts
docs(readme): update architecture section
chore(deps): upgrade next-mdx-remote to v6
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature or content |
| `fix` | Bug fix |
| `refactor` | Restructure without behavior change |
| `docs` | Documentation only |
| `style` | Formatting, whitespace (no logic change) |
| `chore` | Tooling, dependencies, config |
| `test` | Adding or fixing tests |

### Rules

- Keep the summary line under 72 characters
- Use body for context when the change needs explanation
- Reference issues with `Closes #123` in the body when applicable

---

## 4. Pull Request Process

### Before Opening a PR

- [ ] `npm run type-check` passes with no errors
- [ ] `npm run build` completes successfully
- [ ] New lesson is added to **both** `sidebar.json` and `sidebar-en.json`
- [ ] English and Azerbaijani content files are both present
- [ ] No `console.log` left in code
- [ ] No `any` types introduced

### PR Title

Use the same format as commit messages:

```
feat(content): add lesson on transistors and logic gates
```

### PR Description Template

```markdown
## What

Short description of the change.

## Why

Reason for the change or problem it solves.

## Checklist

- [ ] type-check passes
- [ ] build passes
- [ ] both locales updated (sidebar.json + sidebar-en.json)
- [ ] both language content files present (az + en)
```

### Review

- At least one approval is required before merging
- Resolve all review comments before merging
- Squash commits on merge is preferred for content PRs to keep history clean

---

## 5. Adding a New Lesson

### Overview

A lesson consists of:
- An MDX content file (or two, one per locale)
- A route entry in `sidebar.json` (az)
- A route entry in `sidebar-en.json` (en)

### Step-by-Step

**Step 1 — Determine the location**

Find the correct phase and module. Content lives at:

```
src/content/learn/faza-{N}/modul-{N}-{M}/{lesson-slug}.md
```

For a bilingual lesson:
```
src/content/learn/faza-0/modul-0-1/binary-say-sistemi.md   ← az (default)
src/content/learn/faza-0/modul-0-1/binary-number-system.md  ← en
```

Or a single shared file (az by default, en in the `en` locale folder if using separate paths).

**Step 2 — Create the MDX file**

```mdx
---
title: 'Lesson Title'
---

<Intro>

Brief introduction to what this lesson covers and why it matters.

</Intro>

<YouWillLearn>

- First thing you will learn
- Second thing you will learn
- Third thing you will learn

</YouWillLearn>

## Section Heading {/*section-id*/}

Content goes here.

<Note>

Important concept to highlight.

</Note>

<Pitfall>

Common mistake or misconception to warn about.

</Pitfall>

<DeepDive>

#### Deep Dive Title {/*deep-dive-id*/}

Optional deeper explanation for those who want more detail.

</DeepDive>

<Recap>

- Key point 1
- Key point 2
- Key point 3

</Recap>
```

**Step 3 — Register in sidebar.json (az)**

Find the correct module block in `src/sidebar.json` and add the route:

```json
{
  "title": "Binary Say Sistemi",
  "path": "/learn/faza-0/modul-0-1/binary-say-sistemi"
}
```

**Step 4 — Register in sidebar-en.json (en)**

Do the same in `src/sidebar-en.json`:

```json
{
  "title": "Binary Number System",
  "path": "/learn/faza-0/modul-0-1/binary-number-system"
}
```

Both files must have matching route positions — the sidebar renderer relies on order.

**Step 5 — Add any diagrams**

Place diagram images at:

```
public/images/docs/diagrams/{name}.png
```

Reference them in MDX:

```mdx
<Diagram name="binary-place-values" alt="Place value columns for binary: 128, 64, 32, 16, 8, 4, 2, 1" />
```

If the image is missing, the `alt` text renders as a visual placeholder — useful during drafting.

**Step 6 — Verify**

```bash
npm run type-check
npm run build
```

Check the lesson renders correctly at the expected URL, and that prev/next navigation works.

**Step 7 — Open a PR**

Follow the PR process in §4.

### MDX Components Reference

| Component | Usage |
|-----------|-------|
| `<Intro>` | Page introduction block — always first |
| `<YouWillLearn>` | Bulleted learning objectives |
| `<Recap>` | Bulleted lesson summary — always last before challenges |
| `<Note>` | Info callout (blue) — for important concepts |
| `<Pitfall>` | Warning callout (red) — for common mistakes |
| `<DeepDive>` | Collapsible deep-dive section |
| `<Challenges>` | Container for exercise blocks |
| `<Solution>` | Answer block inside `<Challenges>` |
| `<Hint>` | Optional hint inside `<Challenges>` |
| `<Diagram name="..." alt="...">` | Image from `/public/images/docs/diagrams/` |
| `<Sandpack>` | Interactive live code editor |

---

## 6. Code Standards

These rules apply to all `.ts` and `.tsx` files. Full details are in `.claude/rules/`.

### TypeScript

- No `any` — use `unknown` with a type guard
- Use `import type` for type-only imports
- Interface names: `I` prefix (`IButtonProps`, `ILearnPageProps`)
- Type alias names: `T` prefix (`TLessonLevel`, `TOption`)
- Enum names: no prefix (`BaseSizes`, `UserStatus`)

### Components

- One component per file — never define a component inside another component
- Props interface: `I[ComponentName]Props`
- Do not use `React.FC` — use plain functions with typed props
- Max ~250 lines per file — split when exceeded
- No array index as JSX key — use a stable unique identifier
- No inline `style={{}}` for static values — use Tailwind classes

### File Naming

| Pattern | Usage |
|---------|-------|
| `ComponentName.tsx` | React component |
| `ComponentName.types.ts` | Component-specific types |
| `useSomethingQuery.ts` | React Query read hooks |
| `useSomethingMutation.ts` | React Query write hooks |

### Import Order

1. External packages (`react`, `next`, etc.)
2. Internal absolute imports (`@/components/...`)
3. Relative imports (`./`, `../`)
4. Type-only imports (always last, `import type`)

Blank line between each group. Within a group, sort by total line length, shortest first.

### Server vs Client Boundary

`src/utils/mdx.ts` uses Node.js `fs` and `path` — **server-only**. Never import it from a React component. Client-safe utilities live in `src/utils/lesson.ts` and `src/utils/sidebar.ts`.

---

## 7. Review Guidelines

### For Authors

- Self-review your diff before requesting review — catch obvious issues yourself
- Keep PRs focused — one lesson or one fix per PR
- Explain non-obvious decisions in PR description or inline comments
- Respond to all review comments, even if just acknowledging

### For Reviewers

**Check for:**
- Correct MDX structure (components used as intended)
- Both locale files present and in sync
- No `any` types
- No hardcoded strings that should come from sidebar or locale
- Diagram paths correct and images present (or alt text descriptive enough)
- Lesson content is concept-first, not framework-first

**Not the reviewer's job:**
- Copyediting spelling (authors are responsible)
- Debating content depth in review — open an issue instead

### Approval Criteria

A PR is ready to merge when:

1. All CI checks pass (`type-check`, `build`)
2. At least one reviewer has approved
3. All review comments are resolved
4. Both locale entries are complete and verified
