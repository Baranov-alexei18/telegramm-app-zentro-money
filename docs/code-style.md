# Zentro-money — Project Code Style Guide

This document defines the canonical coding standards, naming rules, file organization, and architectural conventions for **Zentro-money**. Both human contributors and AI agents must follow these rules when writing or refactoring code.

---

## 1. Core Principles

- **SOLID & KISS**: Keep every file, function, and component small and focused on a single responsibility. Avoid premature abstractions, deep inheritance, or over-engineered helpers.
- **Explicit Data Flow**: Maintain unidirectional boundaries:
  `Page / Component -> Hook / Zustand Store -> Service / Lib -> Firebase / IndexedDB`.
- **Pure Logic in `src/lib/`**: Extract business calculations, data transformations, and validators into pure functions in `src/lib/` covered by unit tests.

---

## 2. Formatting & Linting

Formatting and static checks are enforced via **Prettier**, **ESLint 9**, and **Husky + `lint-staged`** on pre-commit.

- **Indentation**: 2 spaces (`tabWidth: 2`)
- **Quotes**: Single quotes (`singleQuote: true`) in TS/TSX/CSS; double quotes in JSX attributes
- **Semicolons**: Always required (`semi: true`)
- **Line Width**: Max `100` characters (`printWidth: 100`)
- **Trailing Commas**: ES5 (`trailingComma: 'es5'`)
- **Line Endings**: `auto`

Always verify changes with:

```bash
yarn lint:fix
yarn test
yarn build
```

---

## 3. Imports, Exports & Path Aliases

### Path Aliases

- Always use the unified `@/...` alias for cross-module imports (`@/components/...`, `@/lib/...`, `@/services/...`, `@/store/...`, `@/types/...`, `@/constants/...`, `@/hooks/...`).
- Use relative imports (`./...`) **only** for files colocated inside the same component or page directory (`./styles.module.css`, `./utils`, `./constants`, `./sub-component`).
- **Never** use parent relative traversal (`../`, `../../`) or secondary aliases (`@components/*`, `@store/*`, `@utils/*`).

### Import Sorting (`eslint-plugin-simple-import-sort`)

Imports must be separated by blank lines into **4 strict groups**:

1. `react` and external packages (`^react`, `^@?\w`)
2. Internal `@/` aliases
3. Colocated relative imports (`^\.`)
4. Stylesheets (`\.css$`, `\.scss$`)

```tsx
// 1. React & external packages
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Icon } from '@iconify/react';
import cn from 'classnames';

// 2. Internal @/ imports
import { Button } from '@/components/shared/button';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { useRoomStore } from '@/store/roomStore';
import { TransactionProps } from '@/types/transaction';

// 3. Colocated relative imports
import { filterMembersByRoom } from './utils';

// 4. CSS Modules
import styles from './styles.module.css';
```

### Named Exports Only

- Use **named exports** everywhere inside `src/` (`export const`, `export type`, `export enum`).
- **Never** use `export default` in application source files (reserved only for root tool configs like `vite.config.ts` and `eslint.config.js`).

---

## 4. Directory & File Naming Conventions

| Directory | Purpose | Naming Pattern | Example |
| :--- | :--- | :--- | :--- |
| `src/components/<name>/` | Reusable UI (`shared/`), forms (`forms/`), charts, widgets | `kebab-case` folder + `index.tsx` + `styles.module.css` | `src/components/shared/bottom-sheet/index.tsx` |
| `src/components/icons/` | Fallback custom SVG icons wrapping `<SvgIcon>` | `kebab-case` (`*-icon.tsx`) | `src/components/icons/statistics-icon.tsx` |
| `src/pages/<name>/` | Route views + colocated page-specific subcomponents/helpers | `kebab-case` folder + `index.tsx` + `styles.module.css` | `src/pages/room/transaction-card/index.tsx` |
| `src/lib/` | **All new pure utilities**, IndexedDB helpers, and domain logic + tests | `kebab-case.ts` + `kebab-case.test.ts` | `src/lib/calculate-balance.ts`, `src/lib/calculate-balance.test.ts` |
| `src/utils/` | Legacy utility folder (do **not** add new files here; use `src/lib/`) | Legacy (`kebab-case` / `camelCase`) | — |
| `src/services/<provider>/` | External I/O (`firebase/`, `google/`, `telegram/`), **1 file = 1 operation** | `camelCase.ts` verb-first | `src/services/firebase/createTransaction.ts` |
| `src/store/` | Zustand state stores | `camelCase` (`*Store.ts`) exporting `use*Store` | `src/store/roomStore.ts` (`useRoomStore`) |
| `src/hooks/` | Reusable React hooks | `camelCase` (`use*.ts`) | `src/hooks/useRoomAccess.ts` |
| `src/constants/` | Routes, collection names, RBAC matrices, enums | `kebab-case.ts` / `kebab-case.tsx` | `src/constants/role-room-matrix.ts` |
| `src/types/` | Shared domain TypeScript models | `kebab-case.ts` | `src/types/transaction.ts` |

### `src/lib/` Rule for Utilities

- **Always place new utilities in `src/lib/`** (not `src/utils/`).
- Name every file inside `src/lib/` in **`kebab-case`** (e.g., `format-smart-number.ts`, `transaction-queue.ts`).
- **Always cover utilities in `src/lib/` with colocated unit tests** (`<name>.test.ts`).

---

## 5. TypeScript Conventions

### `type` Over `interface`

- Always declare object shapes and compositions with `type` — **never** use `interface`.

```ts
// GOOD
export type CategoryType = {
  id: string;
  name: string;
  color: string;
  type: TRANSACTION_TYPE;
};

// BAD
export interface Category {
  id: string;
  name: string;
}
```

### Naming Types, Props & Enums

- **Local Component Props**: Define an unexported `type Props = { ... };` directly above the component in `index.tsx`. When wrapping `react-aria-components`, intersect with the library's prop type (`type Props = InputProps & { ... };`).
- **Domain Entities (`src/types/`)**: Suffix domain entity types with `*Type` (`UserType`, `RoomType`, `CategoryType`, `NotificationRoomType`, `UpdateUserType`). Form value shapes use `*FormValues` (`TransactionFormValues`).
- **Enums**: Use `export enum` for fixed domain sets (`TRANSACTION_TYPE`, `RoomUserRole`, `PermissionRoom`, `GranularityFields`, `SyncStatus`).
- **Constants**: Export static configuration constants in `UPPER_SNAKE_CASE` (`COLLECTION_ROOM`, `ROUTE_PATHS`, `ROLE_ROOM_MATRIX`, `BASE_CATEGORIES`).

### Functions & Strictness

- Prefer arrow functions (`export const calculateTotal = (...) => { ... }`) over `function` declarations.
- Maintain compatibility with `strict: true`. Avoid `any`; in `catch (error)` blocks, narrow `error instanceof Error ? error.message : '...'` instead of `catch (error: any)`.

---

## 6. React, Forms & State Conventions

### Component Structure

- Export components as named `PascalCase` arrow functions with inline destructured props (`({ ... }: Props)`).
- **Do not use `React.FC` or `FC<Props>`**.
- Keep a consistent internal order inside components:
  1. Store & router/custom hooks (`useUserStore`, `useRoomStore`, `useParams`, `useRoomAccess`)
  2. Local state & refs (`useState`, `useRef`)
  3. Derived state (`useMemo`) & form initialization (`useForm`)
  4. Event handlers (`handle*`)
  5. Side effects (`useEffect`)
  6. Early returns (loading / guard states)
  7. JSX return

```tsx
type Props = {
  title: string;
  isDisabled?: boolean;
  onSelect: (id: string) => void;
};

export const CategoryCard = ({ title, isDisabled = false, onSelect }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    if (isDisabled) return;
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className={styles.cardWrapper} onClick={handleToggle}>
      <span className={styles.cardTitle}>{title}</span>
    </div>
  );
};
```

### Handler & Prop Naming

- **Callback props**: `on*` (`onClick`, `onSubmit`, `onSelectCategory`, `onDeleteCategory`).
- **Internal handlers**: `handle*` (`handleClick`, `handleFormSubmit`, `handleUpdateCategory`).
- **Booleans**: `is*`, `can*`, `has*` (`isLoading`, `isOpen`, `canModifyTransaction`).

### UI Kit, Forms, Modals & Icons

- **Shared Primitives**: Always compose UI from `@/components/shared/*` (`Button`, `Input`, `Select`, `DatePicker`, `Tabs`, `BottomSheet`, `LinkButton`) instead of raw `<button>`, `<input>`, or `<select>` elements.
- **Forms**: Build forms using `react-hook-form` (`useForm` + `Controller`) wired to `@/components/shared/*` controls with explicit validation rules.
- **Bottom Sheets**: Render drawers/modals via `<BottomSheet id="unique-kebab-id" triggerComponent={...}>` and close programmatically with `useAppStore().closeTopBottomSheet()`.
- **Icons & Avatars**:
  - Default to `@iconify/react`: `<Icon icon="..." width={24} height={24} />`.
  - Create custom SVG components in `src/components/icons/<name>-icon.tsx` using `<SvgIcon>` only if Iconify has no suitable icon.
  - Render user avatars exclusively with `<AvatarCircle id={userId} height={...} width={...} />`.

### Services & Zustand Stores

- **Strict Service Layer**: All `firebase/firestore` and `firebase/auth` SDK calls (`doc`, `getDoc`, `getDocs`, `setDoc`, `updateDoc`, `deleteDoc`, `onSnapshot`, `signInWithPopup`, etc.) **must** live in `src/services/` (`1 file = 1 operation`). Never call Firebase SDK methods directly in components, pages, hooks, or stores.
- **Firestore Collections**: Always import collection names from `@/constants/db` (`COLLECTION_USER`, `COLLECTION_ROOM`, `SUB_COLLECTION_TRANSACTIONS`, `SUB_COLLECTION_MESSAGES`, `INDEX_DB_NAME`) — never hardcode collection strings.
- **Zustand Stores**: Define state + actions in `create<StoreState>((set, get) => ({ ... }))`, delegating persistence to `src/services/*` and `src/lib/*`.

---

## 7. Styling & CSS Modules

- Colocate styles in `styles.module.css` next to `index.tsx` and import as `import styles from './styles.module.css';`.
- Name all CSS Module classes in **`camelCase`** (`.wrapper`, `.headerWrapper`, `.transactionItem`, `.formButton`). Do not use `kebab-case` or BEM (`__`, `--`) in `.module.css` class names.
- Combine multiple or conditional classes with `cn` (`import cn from 'classnames'`):

```tsx
<span
  className={cn(styles.transactionAmount, className, {
    [styles.income]: transaction.type === TRANSACTION_TYPE.INCOME,
    [styles.expense]: transaction.type === TRANSACTION_TYPE.EXPENSE,
  })}
>
```

- Always use CSS custom properties from `src/global.css` (`var(--color-bg)`, `var(--color-surface)`, `var(--color-text)`, `var(--color-primary)`, `var(--color-indigo)`, `var(--color-success)`, `var(--color-danger)`, `var(--color-warning)`, `var(--color-muted)`, `var(--color-border)`, `var(--color-card)`, `var(--border-radius-main)`, and `*-dark` tokens) rather than hardcoded `#fff` / `#eee` colors.
- Avoid inline `style={{ ... }}` attributes except for dynamic runtime values (e.g., user-defined category color or Framer Motion motion values).

---

## 8. Notifications, Error Handling, Dates & Localization

- **Toasts**: Display user notifications exclusively via `notificationManager` (`@/components/shared/toast/utils`) — **never** use browser `alert()` or `confirm()`:

```ts
notificationManager.add(
  { title: 'Данные обновлены', type: 'ok' }, // 'ok' | 'error' | 'warn'
  { timeout: 1500 }
);
```

- **UI & Error Copy Language**: All user-facing strings (labels, placeholders, form validation errors, toast titles, empty states, console error descriptions) must be in **Russian**.
- **Dates & Numbers**:
  - Persist timestamps in Firestore as `Timestamp`.
  - Represent calendar filter periods with `CalendarDate` (`@internationalized/date`) in `'UTC'`.
  - Format monetary/numeric values in UI using `formatSmartNumber`.

---

## 9. Unit Testing & Git Commits

### Unit Tests (Vitest)

- Every module in `src/lib/` must have a colocated `*.test.ts` file (e.g., `src/lib/calculate-balance.test.ts`).
- Import `{ describe, expect, it }` explicitly from `'vitest'`.
- Name `describe` after the tested function/module, and write `it('должен ...')` test descriptions in **Russian** covering empty/edge cases, happy paths, and invalid inputs:

```ts
import { describe, expect, it } from 'vitest';

import { calculateBalance } from './calculate-balance';

describe('calculateBalance', () => {
  it('должен возвращать 0, если массив пустой', () => {
    expect(calculateBalance([])).toBe(0);
  });
});
```

### Commits

- Follow **Conventional Commits** (`feat: ...`, `fix: ...`, `refactor: ...`, `chore: ...`, `test: ...`, `docs: ...`), as pushes/merges to `master` trigger automated releases via `semantic-release`.
