---
paths:
  - "**/*.tsx"
---

# Component Patterns

## File Structure

```
ComponentName/
├── ComponentName.tsx
├── ComponentName.types.ts
├── index.ts                  ← re-exports default
└── ui/                       ← sub-components
    └── SubComponent/
```

## Component Shape

Write sections in this exact order:

```typescript
// 1. Imports (see code-style.md for order)

// 2. Types
interface IUserCardProps {
  userId: string;
  isActive: boolean;
  onSelect?: (id: string) => void;
}

// 3. Component
const UserCard = ({ userId, isActive, onSelect }: IUserCardProps) => {
  // a. Hooks (always at the top)
  const { t } = useTranslation();
  const navigate = useNavigate();

  // b. State
  const [isExpanded, setIsExpanded] = useState(false);

  // c. Queries / derived values
  const { data: user, isLoading } = useUserQuery(userId);

  // d. Handlers
  const handleClick = () => {
    onSelect?.(userId);
  };

  // e. Effects (only for side-effects, keep minimal)
  useEffect(() => {
    // reason this can't be derived
  }, [userId]);

  // f. Render
  if (isLoading) return <Spin />;

  return <StyledWrapper onClick={handleClick}>...</StyledWrapper>;
};

export default UserCard;
```

## Rules
- Props interface always named `I[ComponentName]Props`
- No prop drilling more than 2 levels — lift state or use context/atom
- Avoid `React.FC` — use plain function with typed props
- Conditional rendering: use early return for loading/error, not nested ternaries
- Route pages contain no business logic — delegate to child components
