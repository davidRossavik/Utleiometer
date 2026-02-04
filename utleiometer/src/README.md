## Project Structure Overview 
**Next.js App Router · TypeScript · Tailwind · shadcn/ui · Firebase**

This project uses **Next.js App Router**, where **Server Components are the default** and **Client Components are used explicitly for interactivity**.  
The folder structure is designed to:
- clearly separate **server-side** and **client-side** code
- isolate domain logic for **testability**
- scale without turning into a single `components/` mess
- prevent server-only logic (secrets, Admin SDK) from leaking into the client bundle

---


---

## Folder Responsibilities

### `/public`
Static assets served directly by Next.js (images, icons, etc).  
No application logic.

---

### `/src/app` (FRONTEND)
**Routing and page composition (App Router)**

- Contains `page.tsx`, `layout.tsx`, and route groups
- `(public)` → public pages
- `(auth)` → authentication-related pages

**Principle:**  
`app/` is thin. It composes pages using features and UI components but contains no domain logic.

This aligns with Next.js’ design: routing and rendering orchestration live here, not business logic.

---

### `/src/features` (FRONTEND)
**Feature-based (vertical) domain modules**

Current features:
- `features/listings` → rental items / listings
- `features/search` → search UI and filter state

A **feature** represents a user-facing domain capability, not a route.  
A single page may use multiple features.

**Features may contain:**
- Feature-specific UI components
- Client-side hooks and state
- UI-level validation (e.g. form schemas)
- Feature-specific types

**Features do NOT contain:**
- Database access
- Firebase Admin
- Authorization rules

---

### `/src/ui` (FRONTEND)
**Reusable, domain-agnostic UI components**

- `ui/primitives` → low-level components (Button, Input, Dialog, etc.)
- `ui/feedback` → feedback components (EmptyState, Spinner, Toast)

**Rule:**  
If a component does not know what a “listing” or “search” is, it belongs in `ui/`.

---

### `/src/server` (BACKEND)
**Server-only business logic**

This is the **single source of truth** for:
- Database access (Firebase Admin)
- Queries and mutations
- Authorization and access control
- Business rules

Nothing in `server/` should ever be imported by a Client Component.

---

### `/src/lib`
**Shared utilities and configuration**

Used across server, features, and UI without introducing domain coupling.

Typical examples:
- environment variable handling
- small helper functions
- shared low-level types

`lib` should stay dependency-light and never depend on features or UI.

---

### `/src/styles`
**Global styling and design tokens**

With Tailwind and shadcn, this folder is intentionally small.  
It exists to keep global styling concerns separate from routing and components.

---

### `/src/tests`
**System-level testing and test infrastructure**

Used for:
- end-to-end tests
- integration tests
- shared test setup and fixtures

Keeping tests separate reinforces isolation between production code and verification logic.

---

## Dependency Direction Rules (Critical)

To preserve isolation and testability:

- `app` → `features`, `ui`, `lib`
- `features` → `ui`, `lib`
- `ui` → `lib`
- `server` → `lib`
- `lib` → nothing above it

This prevents circular dependencies and accidental server/client mixing.

---

## Why This Structure Improves Testability

- **UI primitives** can be tested independently
- **Features** can be tested with mocked server responses
- **Server logic** can be tested as pure business logic
- **E2E tests** verify real user flows across the system

Each layer has a single responsibility.

---

## Where to Put Things

- New page or route → `src/app`
- New domain functionality → `src/features`
- Reusable UI component → `src/ui`
- Database / auth / rules → `src/server`
- Shared helpers → `src/lib`
- Global styles → `src/styles`
- E2E/system tests → `src/tests`


