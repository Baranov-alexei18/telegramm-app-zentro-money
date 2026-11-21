# AGENTS.md

## Project Overview

**Zentro-money** is a collaborative budget and expense-tracking web application built primarily as a **Telegram Mini App** (`telegram-web-app.js`) that also runs as a standalone **Progressive Web App (PWA)** in standard browsers. Users can create shared rooms (up to 5 members), invite participants via room IDs, track income and expense transactions across categories, communicate in a room chat, and analyze spending statistics by time periods.

### Core Engineering Principles

- **SOLID & KISS**: Keep modules small, focused on a single responsibility, and free of premature abstractions.
- Prefer composition, pure utility functions, and explicit data flow (`UI -> Store / Hook -> Service -> Firebase / IndexedDB`).
- **Code Style Guide**: See [`docs/code-style.md`](docs/code-style.md) for the complete project code style (naming conventions, `type` vs `interface`, component patterns, `src/lib/` testing rules, and CSS Modules standards).
- **Offline Transactions & Outbox Sync**: See [`docs/offline-transactions.md`](docs/offline-transactions.md) for the Outbox v2 architecture, command coalescing rules, Lie-Fi timeout handling, and adapter extension guide.
- **Architecture & Entity Map**: See [`docs/knowledge-graph.md`](docs/knowledge-graph.md) for the complete visual knowledge graph (layered architecture, Firestore/IndexedDB ER diagram, route-to-component tree, store-to-service dependencies, and end-to-end runtime sequences).

---

## Tech Stack

- **Framework & Language**: React 18, TypeScript (~5.7, `strict: true`), Vite 6
- **Package Manager**: Yarn 4.12.0 (`nodeLinker: node-modules`)
- **Routing**: `react-router` v7 (`createBrowserRouter`)
- **State Management**: `zustand` v5
- **Forms**: `react-hook-form` v7 (`useForm` + `Controller`)
- **UI Primitives & Dates**: `react-aria-components`, `@internationalized/date` (`CalendarDate` in UTC)
- **Styling & Animations**: CSS Modules (`*.module.css`), CSS custom properties (`src/global.css`), `classnames` (`cn`), `framer-motion`
- **Icons & Avatars**: `@iconify/react` (`<Icon />`), DiceBear API (`AvatarCircle`)
- **Charts**: `victory` (`VictoryPie`, `VictoryChart`, `VictoryStack`, `VictoryBar`)
- **Backend & Offline Storage**:
  - Firebase v12: Authentication (Email/Password, Google OAuth) & Cloud Firestore (`persistentLocalCache` + `persistentMultipleTabManager`)
  - Telegram WebApp SDK (`window.Telegram.WebApp.initDataUnsafe.user`)
  - IndexedDB via `idb` (`zentro-offline-db`) for offline transaction queueing
  - `vite-plugin-pwa` (Workbox asset & runtime caching)
- **Testing, Linting & Releases**: Vitest, ESLint 9 (flat config) + Prettier, Husky + `lint-staged`, `semantic-release` (GitHub Actions on `master`)

---

## Development Commands & Environment

Always use **Yarn** (`yarn@4.12.0`) — do not use `npm` or `pnpm`.

```bash
yarn install      # Install dependencies
yarn start        # Run Vite dev server
yarn build        # Type-check (tsc -b) and build production bundle to dist/
yarn preview      # Preview production build locally
yarn test         # Run Vitest unit tests
yarn lint         # Lint src/**/*.{ts,tsx}
yarn lint:fix     # Lint and auto-fix issues (including import sorting & Prettier)
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_KEY_FIREBASE=your_firebase_api_key
```

---

## Directory Structure & Architecture

```text
src/
├── main.tsx                 # App entrypoint & PWA service worker registration
├── app.tsx                  # Auth bootstrap, ErrorBoundary, RouterProvider, Toasts
├── global.css               # Root CSS custom properties (--color-*, --border-radius-main)
├── assets/                  # Static images/logos imported in TS/TSX
├── components/
│   ├── shared/              # Reusable UI kit wrapping react-aria-components & framer-motion
│   │   ├── bottom-sheet/    # Draggable spring bottom sheet controlled via useAppStore stack
│   │   ├── button/          # Accessible button with loading spinner
│   │   ├── date-picker/     # Accessible calendar date picker (Timestamp <-> CalendarDate)
│   │   ├── input/           # Accessible TextField + Label + FieldError
│   │   ├── link-button/     # Styled NavLink wrapper
│   │   ├── select/          # Accessible Select + Popover + ListBox
│   │   ├── tabs/            # Accessible tab switcher
│   │   └── toast/           # Global ToastRegion & notificationManager (ToastQueue)
│   ├── forms/               # Feature forms (transaction-form, create-room-form, auth-form, register-form)
│   ├── charts/              # Victory visualizations (pie, explorer)
│   ├── widgets/             # External auth widgets (google-widget)
│   ├── icons/ & svg-icon/   # Custom SVG icon fallback components
│   └── ...                  # App-level layout & domain widgets (base-layout, protected-layout,
│                            # header, navigation-menu, offline-banner, category-picker,
│                            # period-picker, period-date-navigator, avatar-circle, etc.)
├── constants/               # Routes, Firestore collection names, RBAC matrix, base categories, enums
├── hooks/                   # Custom hooks (useLoadRoom, useRoomAccess, useOnlineStatus)
├── lib/                     # Pure utilities (kebab-case.ts + *.test.ts), IndexedDB setup, offline sync
├── pages/                   # Route views (home, rooms, room, transactions, statistics,
│                            # profile, auth, register, not-found) + colocated subcomponents/utils
├── services/                # External I/O layer (1 file = 1 operation)
│   ├── firebase/            # Firebase config (db, auth) + atomic Firestore/Auth operations
│   ├── google/              # Google user Firestore profile sync
│   └── telegram/            # Telegram WebApp user extraction & Firestore profile sync
├── store/                   # Zustand state stores (userStore, roomStore, granularityStore, appStore)
├── types/                   # Shared TypeScript domain models (*Type)
└── utils/                   # Legacy helpers (do not add new files here; place new utilities in src/lib/)
```

---

## Domain Model, State & Data Flow

### Firestore Schema (`src/constants/db.ts`)

Always reference collection names from `@/constants/db` (`COLLECTION_USER`, `COLLECTION_ROOM`, `SUB_COLLECTION_TRANSACTIONS`, `SUB_COLLECTION_MESSAGES`):

1. **`users/{userId}`** (`UserType`):
   - Fields: `id`, `email`, `firstName`, `lastName`, `username`, `telegramId` (`string | null`), `rooms` (`string[]`), `createdAt`.
2. **`rooms/{roomId}`** (`RoomType`):
   - Fields: `roomId`, `name`, `description`, `categories` (`CategoryType[]`, seeded from `BASE_CATEGORIES`), `members` (`Record<userId, { role: RoomUserRole, joinedAt: Date }>`), `notifications` (`NotificationRoomType[]` for join requests), `createdAt`.
   - Constraint: Maximum **5 members** per room.
3. **`rooms/{roomId}/transactions/{transactionId}`** (`TransactionProps`):
   - Subcollection documents containing `transactionId`, `roomId`, `userId`, `type` (`TRANSACTION_TYPE.EXPENSE | TRANSACTION_TYPE.INCOME`), `amount`, `category` (`CategoryType`), `description`, `date` (`Timestamp`), `createdAt` (`Timestamp`).
4. **`rooms/{roomId}/messages/{messageId}`**:
   - Subcollection documents for real-time room chat: `text`, `senderId`, `senderName`, `createdAt` (`Timestamp`).

### Authentication Flow (`src/app.tsx` & `ProtectedLayout`)

1. `onAuthStateChanged(auth, ...)` checks for an active Firebase Auth user (Email/Password or Google OAuth), syncs their document via `syncGoogleUser`, and loads profile data via `getDataUserById`.
2. If no Firebase session exists, `getTelegramUser()` inspects `window.Telegram?.WebApp?.initDataUnsafe?.user` and syncs the Telegram user via `syncTelegramUser`.
3. `ProtectedLayout` guards authenticated routes (`/`, `/rooms`, `/room/:id`, `/room/:id/transactions`, `/room/:id/statistics`, `/profile`) and redirects unauthenticated visitors to `/auth`.

### Role-Based Access Control (RBAC)

- Roles (`RoomUserRole` in `@/constants/room-roles`): `ADMIN` (`'admin'`) and `USER` (`'base_user'`).
- Permissions (`PermissionRoom` in `@/types/room`) are mapped in `ROLE_ROOM_MATRIX` (`@/constants/role-room-matrix`) and evaluated via `canInRoom()` / `useRoomAccess()`:
  - **`ADMIN`**: Full access to room join notifications, category CRUD, removing members, and modifying/deleting any transaction.
  - **`USER`**: Can create transactions and modify/delete **only their own** transactions (`transaction.userId === user.id`).

### Zustand Stores (`src/store/`)

- **`useUserStore`**: Current `user`, auth `loading` flag, and `updateDataUser`.
- **`useRoomStore`**: Active `room`, loaded `members`, transactions & categories actions, membership/notification actions, `getFilteredTransactions(viewType, period)`, and offline queue hydration (`hydrateTransactionsFromQueue`).
- **`useGranularityStore`**: Selected period granularity (`GranularityFields`: `DAY`, `WEEK`, `MONTH`, `YEAR`, `ALL`) and `{ start: CalendarDate, end: CalendarDate }` in UTC.
- **`useAppStore`**: Stack-based `BottomSheet` state (`bottomSheets`, `openBottomSheet`, `closeTopBottomSheet`, `isTopSheet`) supporting nested sheets (e.g., opening category picker inside transaction form).

### Offline-First & Sync Strategy

- Firestore is initialized with `persistentLocalCache` and `persistentMultipleTabManager`.
- Transaction mutations (`addTransaction`, `updateTransaction`, `deleteTransaction`) in `useRoomStore` perform **optimistic UI updates** (`SyncStatus.PENDING`) and delegate persistence to `transactionRepository` (`@/lib/transaction-repository`), which coalesces operations in `IndexedDB` (`zentro-offline-db` v2 -> `transaction_outbox`).
- `OutboxFlusher` (`@/lib/outbox-flusher`) drains queued entries through `RemoteTransactionGatewayType` (`@/lib/firestore-transaction-gateway`) with a `6000ms` Lie-Fi timeout and `updatedAt` concurrency guard, triggered immediately on write and by `useOnlineStatus` (`online` + `visibilitychange`). See [`docs/offline-transactions.md`](docs/offline-transactions.md).

---

## Coding Conventions & Strict Rules

### 1. Strict Service Layer for Firebase (`src/services/`)

- **All** Firebase Auth calls, Firestore reads/writes, and real-time `onSnapshot` subscriptions **must** live in `src/services/` following the **1 file = 1 operation** pattern (e.g., `src/services/firebase/createTransaction.ts`).
- Do **not** import or invoke `firebase/firestore` or `firebase/auth` SDK methods directly inside React components, pages, hooks, or Zustand stores.

### 2. Imports & Path Aliases

- Always use the unified `@/...` path alias for cross-module imports (e.g., `@/components/shared/button`, `@/services/firebase/createRoom`, `@/store/roomStore`, `@/types/room`).
- Use relative `./...` imports **only** for files colocated inside the same component or page folder (`./styles.module.css`, `./utils`, `./constants`).
- Do **not** use secondary aliases such as `@components/*` or `@store/*`, and avoid parent traversal (`../../`).
- Keep imports sorted according to `eslint-plugin-simple-import-sort` (enforced as an ESLint error):
  1. `react` and external packages (`^react`, `^@?\w`)
  2. Internal `@/` aliases
  3. Relative imports (`^\.`)
  4. Stylesheets (`\.css$`, `\.scss$`)

### 3. Components, Types, Forms, Icons & Notifications

- **Component Layout**: Place each component in a `kebab-case` directory with `index.tsx` and colocated `styles.module.css` (plus optional `utils.ts` and `constants.ts`). Use named functional arrow component exports (`export const MyComponent = ({ ... }: Props) => ...`) — never `export default` or `React.FC`.
- **Types & Props**: Always use `type` (never `interface`). Declare local component props as unexported `type Props = { ... };`, suffix shared domain models in `src/types/` with `*Type` (`UserType`, `RoomType`, `CategoryType`), and use `export enum` for fixed domain sets.
- **Explicit JSX Boolean Props**: Always specify `{true}` or `{false}` explicitly for boolean props in JSX (`<AppLoader overlay={true} />` — never `<AppLoader overlay />`), enforced by ESLint (`react/jsx-boolean-value`).
- **Shared UI Kit**: Always build UI using primitives from `@/components/shared/*` (`Button`, `Input`, `Select`, `DatePicker`, `Tabs`, `BottomSheet`, `LinkButton`) rather than raw HTML inputs/buttons or custom modal implementations.
- **Forms**: Build all new forms with `react-hook-form` (`useForm` + `Controller`) integrated with `@/components/shared/*` controls.
- **Bottom Sheets**: Use `<BottomSheet id="unique-id" triggerComponent={...}>` for drawers/modals and close programmatically via `useAppStore().closeTopBottomSheet()`.
- **Toast Notifications**: Trigger user feedback exclusively via `notificationManager` from `@/components/shared/toast/utils`:
  ```ts
  notificationManager.add({ title: 'Message', type: 'ok' }, { timeout: 1500 }); // type: 'ok' | 'error' | 'warn'
  ```
- **Icons & Avatars**:
  - Use `@iconify/react` (`<Icon icon="..." width={24} height={24} />`) as the standard icon solution. Create custom components using `<SvgIcon>` in `src/components/icons/` only if no suitable Iconify icon exists.
  - Render user avatars with `<AvatarCircle id={userId} height={...} width={...} />`.

### 4. Styling

- Use **CSS Modules** (`import styles from './styles.module.css'`) with `camelCase` class names and `classnames` (`import cn from 'classnames'`) for conditional classes.
- Reuse design tokens defined in `src/global.css` (`--color-bg`, `--color-surface`, `--color-primary`, `--color-indigo`, `--color-success`, `--color-danger`, `--color-warning`, `--color-muted`, `--color-border`, `--color-card`, `--border-radius-main`, and their `*-dark` counterparts).

### 5. Dates & Numbers

- Store transaction and entity timestamps in Firestore as `Timestamp` (use `@/utils/convertDateToTimestamp`, `@/utils/convertToDate`, `@/utils/dateValueToDate`).
- Represent calendar filter ranges with `CalendarDate` (`@internationalized/date`) in `'UTC'`.
- Format numeric amounts for UI display using `formatSmartNumber` (`@/utils/formatSmartNumber`).

### 6. Formatting, Utilities (`src/lib/`), Testing & Git Workflow

- **Prettier**: `singleQuote: true`, `semi: true`, `tabWidth: 2`, `printWidth: 100`, `trailingComma: 'es5'`. Pre-commit hooks (`husky` + `lint-staged`) automatically run `yarn lint:fix` and `prettier --write`.
- **Utilities & Unit Tests**: Always place new utilities in `src/lib/` named in `kebab-case.ts` and cover them with colocated Vitest unit tests (`*.test.ts` with Russian `it('должен ...')` descriptions). Verify changes with `yarn test` and `yarn build`.
- **Commits**: Follow **Conventional Commits** (`feat: ...`, `fix: ...`, `chore: ...`, `refactor: ...`). Merging/pushing to `master` triggers automated versioning, `CHANGELOG.md` updates, and GitHub Releases via `semantic-release`.
