# Engineering Curriculum

> No frameworks. Engineering. A free, public resource for software engineers who want to understand how things actually work — from transistors to distributed systems.

## What This Is

This is a teaching site inspired by [react.dev](https://react.dev) in style, but it does not teach React. Instead, it explains the foundational knowledge of software engineering — computer architecture, operating systems, networking, databases, distributed systems, and AI engineering — in depth, without framework abstractions.

**Goal:** Not to use frameworks, but to understand how they work.

**What this is NOT:**
- A bootcamp or quick-start guide
- A framework tutorial
- A course that requires registration or payment

---

## Curriculum Structure

| Phase | Topic |
|-------|-------|
| 0 | How Computers Work (transistors to CPU) |
| 1 | Programming Foundations (language-agnostic) |
| 2 | Operating Systems |
| 3 | Networks |
| 4 | Databases |
| 5 | Backend Engineering |
| 6 | Frontend Internals (framework-free) |
| 7 | Distributed Systems |
| 8 | DevOps and Infrastructure |
| 9 | Security |
| 10 | AI Engineering |
| 11 | System Design Case Studies |

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Next.js 14](https://nextjs.org/) Pages Router | SSG with i18n routing (az / en) |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) | MDX content rendering |
| [@codesandbox/sandpack-react](https://sandpack.codesandbox.io/) | Interactive code editor |
| TypeScript | Type safety throughout |

---

## Architecture

```
src/
├── components/
│   └── Layout/
│       ├── Page.tsx              # Root layout wrapper
│       ├── Nav/                  # Top navigation bar
│       ├── Sidebar/
│       │   ├── SidebarLink.tsx   # Leaf route link (with duration)
│       │   └── SidebarRouteTree.tsx  # Recursive sidebar renderer
│       └── MDXComponents/        # Custom MDX component map
├── content/
│   └── learn/
│       └── faza-{N}/
│           └── modul-{N}-{M}/
│               └── {lesson-slug}.md   # Lesson MDX files
├── pages/
│   ├── index.tsx                 # Home page (fully dynamic from sidebar.json)
│   └── learn/
│       └── [...path].tsx         # Lesson page (SSG, reads MDX + computes duration/level)
├── utils/
│   ├── mdx.ts                    # Server-only: reads MDX from disk, extracts TOC, frontmatter
│   ├── lesson.ts                 # Client-safe: getLessonLevel, computeDuration
│   └── sidebar.ts                # Client-safe: parseSidebar, IPhaseCard, ISidebarStats
├── types/
│   └── index.ts                  # Shared TypeScript interfaces and types
├── sidebar.json                  # Azerbaijani sidebar structure and metadata
└── sidebar-en.json               # English sidebar structure and metadata
```

### Key Boundary: Server vs Client Utils

`src/utils/mdx.ts` uses Node.js `fs` and `path` — it is **server-only** and must never be imported by React components. All client-safe utility logic lives in `lesson.ts` and `sidebar.ts`.

---

## Sidebar JSON Structure

Both `sidebar.json` and `sidebar-en.json` share the same schema. The sidebar is a flat array of `ISidebarRoute` objects. The nesting is represented by `hasSectionHeader` and nested `routes` arrays.

### ISidebarRoute Fields

| Field | Type | Description |
|-------|------|-------------|
| `hasSectionHeader` | `boolean` | Marks a phase separator entry |
| `sectionHeader` | `string` | Raw phase title, e.g. `"FAZA 0 — How Computers Work"` |
| `label` | `string` | Override badge text shown on the home page card (optional) |
| `description` | `string` | Short description shown on the home page phase card |
| `title` | `string` | Display title for a module or lesson |
| `path` | `string` | URL path for a leaf lesson, e.g. `"/learn/faza-0/modul-0-1/bit-ve-byte"` |
| `routes` | `ISidebarRoute[]` | Child routes (lessons within a module) |
| `wip` | `boolean` | Marks a lesson as work-in-progress |
| `level` | `TLessonLevel` | `'Fundamental' \| 'Intermediate' \| 'Deep'` — currently unused in sidebar rendering |
| `duration` | `string` | Estimated read time — currently unused in sidebar rendering (computed dynamically on lesson page) |

### Example Phase Block

```json
{
  "hasSectionHeader": true,
  "sectionHeader": "PHASE 0 — How Computers Work",
  "description": "From transistors to CPUs and RAM — the physical and logical foundations of all computing.",
  "routes": []
},
{
  "title": "Bits and Bytes",
  "routes": [
    { "title": "Bit and Byte", "path": "/learn/faza-0/modul-0-1/bit-ve-byte" },
    { "title": "Binary Number System", "path": "/learn/faza-0/modul-0-1/binary-say-sistemi" }
  ]
}
```

---

## How the Home Page Works

`src/pages/index.tsx` uses `getStaticProps` to call `parseSidebar(routes)` from `src/utils/sidebar.ts`. This function:

1. Iterates the sidebar routes
2. Groups lessons by phase (identified by `hasSectionHeader`)
3. Counts total modules and lessons
4. Extracts the first lesson path per phase for the CTA link
5. Returns `{ phases, totalPhases, totalModules, totalLessons }`

All stats and phase cards on the home page are computed at build time — no hardcoded values.

---

## How Lesson Pages Work

`src/pages/learn/[...path].tsx` uses `getStaticProps` to:

1. Read the MDX file from `src/content/learn/` via `getContentByPath` in `mdx.ts`
2. Serialize the MDX with `next-mdx-remote`
3. Compute `lessonLevel` from the URL path (faza number → `Fundamental / Intermediate / Deep`)
4. Compute `duration` from line count (`Math.ceil(lineCount / 75) * 5` minutes)
5. Build prev/next navigation from the sidebar

Level and duration are rendered as a badge row below the `<h1>` on the lesson page.

---

## i18n

The site supports two locales configured in `next.config.js`:

- `az` (default) — Azerbaijani, uses `sidebar.json`
- `en` — English, uses `sidebar-en.json`

Locale is passed to `getStaticProps` via `context.locale`. Both sidebar files must stay in sync for route parity.

---

## Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd engineering-curriculum

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open http://localhost:3000 in your browser.

```bash
# Type-check
npm run type-check

# Production build
npm run build
npm start
```

---

## Adding a New Lesson

See `CLAUDE.md` at the project root for the full step-by-step guide and the lesson-authoring prompt. The short version:

1. Create `src/content/learn/faza-{N}/modul-{N}-{M}/{lesson-slug}.md`
2. Add the MDX frontmatter and content using standard components
3. Add the route entry to both `sidebar.json` and `sidebar-en.json`
4. Run `npm run build` to verify no type or compile errors

### MDX Components Reference

| Component | Purpose |
|-----------|---------|
| `<Intro>` | Page introduction block |
| `<YouWillLearn>` | Learning objectives list |
| `<Recap>` | Lesson summary |
| `<Note>` | Info callout (blue) |
| `<Pitfall>` | Warning callout (red) |
| `<DeepDive>` | Collapsible deep-dive section |
| `<Challenges>` | Interactive exercises block |
| `<Solution>` | Answer inside `<Challenges>` |
| `<Hint>` | Hint inside `<Challenges>` |
| `<Diagram name="..." alt="...">` | Image / diagram |
| `<Sandpack>` | Interactive code editor |

### Diagrams

`<Diagram>` reads images from `/public/images/docs/diagrams/{name}.png`. If the image is missing, the `alt` text is shown as a visual placeholder box.

---

## Deployment

Deployable to Vercel, Netlify, or any Node.js hosting platform:

```bash
npm run build
npm start
```

---

## Contributing

Before contributing, read `CLAUDE.md` for the full project guide including coding standards, naming conventions, and the lesson-authoring prompt.

Key principles:

1. **Concept-first:** Explain how things work, not just how to use them
2. **Bilingual parity:** Every lesson added to `sidebar.json` must also be added to `sidebar-en.json`
3. **No framework abstractions:** Examples use fundamentals, not framework shortcuts
4. **Interactive where possible:** Use `<Sandpack>` for live code examples

---

## License

[MIT License](./LICENSE) © 2025 Engineering Curriculum Contributors

Content (lessons, diagrams) may be shared under **CC BY 4.0**.
