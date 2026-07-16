# General Rules

## Code Quality
- No `any` — use `unknown` + type guard
- No comments unless logic is genuinely non-obvious
- No inline `style={{}}` for static values — use styled-components or class names
- No over-engineering — only build what is asked
- No array index as JSX key — always use a stable unique identifier
- Max ~250 lines per file — split when exceeded
- Never define a component inside another component — create a separate file

## Naming — Files

| Pattern | Example | Usage |
|---------|---------|-------|
| `[Name].tsx` | `Button.tsx` | React components |
| `[Name].types.ts` | `Button.types.ts` | Type & interface definitions |
| `[Name].model.ts` | `Prisoner.model.ts` | Data model types |
| `[resource].atom.ts` | `dictionary.atom.ts` | Jotai atoms |

## Naming — Identifiers

- **Folders/files (component):** PascalCase — `Button/`, `PrisonerDetails/`
- **Folders/files (non-component):** camelCase — `api/`, `hooks/`, `utils/`
- **Variables & functions:** camelCase
- **Boolean prefix (required):** `is`, `has`, `can`, `should`, `will`, `are`
- **Handler prefix:** `handle` or `on`
- **Getter prefix:** `get`
- **Interface prefix:** `I` — `IButtonProps`, `ILayout`
- **Type alias prefix:** `T` — `TOption`, `TQueryParams`
- **Enums:** no prefix — `BaseSizes`, `UserStatus`
- **Constants:** `UPPER_SNAKE_CASE` — `MAX_PAGE_SIZE`

## Exports
- `export default` for components, classes, and single-export files
- Named `export` for enums, constants, and multiple exports
- Every component folder must have `index.ts` re-exporting the default
- Always use `import type` for type-only imports

## Components
- Sub-components with their own props → own folder, never inline in parent
- 3+ identical JSX blocks → extract to sub-component with props
- `useEffect` dependency array must never be empty without a comment explaining why

## Behaviour
- Read the file before editing it
- Confirm plan before writing code for tasks touching 3+ files
- Ask before making changes outside the described scope
- Read `.husky/pre-commit` and `.husky/commit-msg` for branch/commit format
- Run `npm run type-check` before committing
