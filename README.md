# Engineering Curriculum

> No frameworks. Engineering. A free, public resource for software engineers who want to understand how things actually work — from transistors to distributed systems.

---

## What This Is

A teaching site inspired by [react.dev](https://react.dev) in structure, rebuilt with Next.js 15 App Router. It does **not** teach React. It teaches the foundational knowledge of software engineering — computer architecture, operating systems, networking, databases, distributed systems — concept-first and language-agnostic.

The reader: a developer who can write code but doesn't know what happens underneath it. Every lesson starts from first principles, assumes only what was covered in previous lessons, and never says "use framework X to do Y".

**What it is NOT:**
- A bootcamp or quick-start guide
- A framework tutorial
- A course that requires registration or payment

---

## Curriculum

| Phase | Topic |
|-------|-------|
| 0 | How Computers Work — transistors to CPU |
| 1 | Programming Foundations — language-agnostic |
| 2 | Operating Systems |
| 3 | Networks |
| 4 | Databases |
| 5 | Backend Engineering |
| 6 | Frontend Internals — framework-free |
| 7 | Distributed Systems |
| 8 | DevOps & Infrastructure |
| 9 | Security |
| 10 | AI Engineering |
| 11 | System Design Case Studies |

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Next.js 15](https://nextjs.org/) (App Router) | SSG with i18n routing (`az` / `en`) via next-intl |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) | MDX content rendering |
| [@codesandbox/sandpack-react](https://sandpack.codesandbox.io/) | Interactive in-browser code editor |
| TypeScript | Type safety throughout |

---

## Folder Structure

```
src/
├── app/[locale]/                        # App Router — next-intl locale routing
│   ├── layout.tsx                       # Root layout: theme script, font variables
│   ├── page.tsx                         # Home page — dynamic from sidebar.json
│   └── learn/[...path]/page.tsx         # Lesson page (SSG, reads MDX + computes metadata)
├── content/
│   ├── az/learn/                        # Azerbaijani MDX lesson files
│   └── en/learn/                        # English MDX lesson files (primary)
│       └── faza-0/modul-0-1/
│           ├── bit-ve-byte.md           # reference lesson 1
│           ├── binary-say-sistemi.md    # reference lesson 2
│           └── menfi-ededler.md         # reference lesson 3
├── modules/                             # Page-level feature modules
│   ├── home/                            # Home page layout and phase grid
│   ├── learn/                           # Lesson listing page
│   └── learning-details/               # Individual lesson page
├── shared/
│   ├── layouts/
│   │   ├── AppLayout/                   # Root layout: sidebar + content + TOC grid
│   │   ├── Sidebar/                     # SidebarNav + SidebarRouteTree (recursive)
│   │   ├── TopNav/                      # Header bar: logo, sidebar toggle, theme, language
│   │   └── Footer/                      # Site footer
│   ├── lib/utils/
│   │   ├── mdx.ts                       # server-only: reads MDX files, extracts TOC + frontmatter
│   │   ├── lesson.ts                    # client-safe: getLessonLevel, computeDuration
│   │   └── sidebar.ts                   # client-safe: parseSidebar, getSidebarRouteTree
│   ├── resources/json/
│   │   ├── sidebar.json                 # course structure — Azerbaijani
│   │   └── sidebar-en.json             # course structure — English
│   ├── types/index.ts                   # ISidebarRoute, ITocItem, TLocale, TLessonLevel
│   └── ui/
│       ├── MDX/                         # All MDX components (see below)
│       │   └── MDXComponents.tsx        # Central registry: maps MDX tag names → React components
│       └── Toc/                         # Right-column table of contents
└── styles/globals.css                   # Global CSS + .prose-docs styles for MDX content
public/images/docs/diagrams/             # SVG diagrams — light + dark pairs (x.svg / x.dark.svg)
```

---

## How the Lesson System Works

### Adding content

A lesson is a single `.md` file in `src/content/{locale}/learn/{phase}/{module}/{slug}.md`.

At build time, `getAllContentPaths` walks the content directory and generates static paths. `getContentByPath` reads the file, parses frontmatter with `gray-matter`, serializes MDX with `next-mdx-remote`, and extracts the TOC by scanning headings.

The lesson page then computes:
- **Level** (`Fundamental` / `Intermediate` / `Deep`) from the faza number in the URL
- **Duration** from the line count: `Math.ceil(lines / 75) * 5` minutes

### Sidebar JSON

Both `sidebar.json` (Azerbaijani) and `sidebar-en.json` (English) define the course structure. They are the single source of truth for navigation, the home page phase grid, and all stats. The structure is frozen — routes cannot be added or removed.

```jsonc
{
  "hasSectionHeader": true,
  "sectionHeader": "FAZA 0 — How Computers Work",
  "description": "From transistors to CPUs — start at the metal level.",
  "routes": [
    {
      "title": "Modul 0.1 — Data Representation",
      "routes": [
        {
          "title": "Bit and Byte",
          "path": "/learn/faza-0/modul-0-1/bit-ve-byte",
          "duration": "20 min"
        }
      ]
    }
  ]
}
```

### i18n

The site supports `az` (default, Azerbaijani) and `en` (English). Locale is part of the URL: `/az/learn/...` and `/en/learn/...`. Lesson files live in separate locale folders. If an English lesson doesn't have an Azerbaijani translation, the site falls back to the English file.

---

## MDX Components

Every lesson is written in MDX and can use these components:

### Structure

| Component | Purpose |
|-----------|---------|
| `<Intro>` | Opening hook — always first. 2–4 sentence story or question. |
| `<YouWillLearn>` | Learning outcomes list. Place right after `<Intro>`. 4–6 bullets. |
| `<Recap>` | Lesson summary. Always last before `<Challenges>`. 5–8 claim bullets. |
| `<Challenges>` | Exercise container — wraps challenge blocks with `####` headings. |
| `<Solution>` | Worked answer inside `<Challenges>`. |
| `<Hint>` | Optional nudge inside `<Challenges>`, before `<Solution>`. |
| `<DeepDive>` | Collapsible optional-depth section. Must contain a `####` heading. |

### Callouts

| Component | Color | Purpose |
|-----------|-------|---------|
| `<Note>` | Blue | Useful clarification or non-alarming aside |
| `<Pitfall>` | Yellow/red | Common mistake — state the mistake first, then the fix |
| `<Wip>` | Purple | Lesson placeholder — content not yet written |

### Code and interactive

| Component | Purpose |
|-----------|---------|
| `<Sandpack>` | Interactive code editor. Plain React + JS, no libraries, ≤80 lines. |
| `<TerminalBlock level?>` | Dark terminal block for shell commands and output |
| `<ConsoleBlock level?>` | Single browser/Node console line |
| `<ConsoleBlockMulti>` | Multiple console lines — wraps `<ConsoleLogLine>` children |
| `<ConsoleLogLine level?>` | One line inside `<ConsoleBlockMulti>` |
| `<CodeStep step={1\|2\|3\|4}>` | Color-coded inline step highlight in prose |
| `<PackageImport>` | Install command + import statement in two columns |

### Diagrams and media

| Component | Purpose |
|-----------|---------|
| `<Diagram name alt height width>` | SVG from `public/images/docs/diagrams/`. Requires `x.svg` + `x.dark.svg`. |
| `<DiagramGroup>` | Two or more `<Diagram>`s side by side for visual comparison |
| `<CodeDiagram flip?>` | Code block and diagram in a split layout |
| `<Illustration src alt>` | Centered raster image with optional caption and author credit |
| `<IllustrationBlock>` | Row of `<Illustration>` images |
| `<YouTubeIframe src>` | Responsive 16:9 YouTube embed |

### Navigation and reference

| Component | Purpose |
|-----------|---------|
| `<YouWillLearnCard title path>` | Module overview card linking to a specific lesson |
| `<LearnMore title path?>` | Cross-lesson bridge section |
| `<InlineToc>` | Auto-generated in-page anchor list for long lessons |

---

## Setup

```bash
git clone <repo-url>
cd engineering-curriculum
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run type-check   # TypeScript check (run before every commit)
npm run build        # Production build
npm start            # Start production server
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Branch naming and commit convention
- PR checklist and review process
- Step-by-step lesson authoring guide
- Full MDX component reference with props
- Code standards

For AI agents working on this codebase, read [CLAUDE.md](./CLAUDE.md) first.

---

## License

[MIT License](./LICENSE) © 2025 Engineering Curriculum Contributors

Content (lessons, diagrams) may be shared under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
