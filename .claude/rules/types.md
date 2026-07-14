---
paths:
  - "**/*.types.ts"
  - "**/*.model.ts"
---

# Types & Interfaces

## Conventions

```typescript
// [Name].types.ts — only types, no implementations

// Interfaces: I prefix
export interface IButtonProps {
  label: string;
  isDisabled?: boolean;
  onClick: () => void;
}

// Type aliases: T prefix
export type TOption = {
  label: string;
  value: string | number;
};

export type TQueryParams = {
  page: number;
  pageSize: number;
  search?: string;
};

// Enums: no prefix, PascalCase
export enum UserStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

// Generic wrappers
export interface IAsyncData<T> {
  data: T;
  total: number;
}
```

## Rules
- `I` prefix for interfaces, `T` prefix for type aliases, no prefix for enums
- Enums use string values (not numeric) — easier to debug
- Avoid `type` vs `interface` mixing — prefer `interface` for object shapes, `type` for unions/aliases
- Always `export` — types files contain only exports
- Use `import type` when importing from types files in other files
- Model files (`[Name].model.ts`) define data shapes returned from the API — keep them in `api/[resource]/models/`
