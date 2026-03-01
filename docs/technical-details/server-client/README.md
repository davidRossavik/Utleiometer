# Server vs Client i Next.js (vårt oppsett)

Denne guiden forklarer forskjellen på server-komponenter, klient-komponenter og server actions i Next.js App Router, og hvordan vi bruker dette i Utleiometer.

## Kort forklart

- **Server-komponenter** kjører på serveren (default i `app/`), og kan brukes til å bygge side-struktur uten klient-JavaScript.
- **Klient-komponenter** markeres med `"use client"`, kjører i nettleseren, og kan bruke hooks/events (`useState`, `useEffect`, `onClick`, `useRouter`, osv.).
- **Server actions** markeres med `"use server"`, kjører på serveren ved kall fra klient, og passer for skriv/validering mot backend.

## 1) Hvordan dette ser ut hos oss

### Server-komponenter (page/layout uten `"use client"`)

Disse filer er server-komponenter og brukes som wrappers for layout og side-struktur:

- [`utleiometer/src/app/page.tsx`](../../../utleiometer/src/app/page.tsx)
- [`utleiometer/src/app/(public)/properties/page.tsx`](../../../utleiometer/src/app/%28public%29/properties/page.tsx)
- [`utleiometer/src/app/(public)/properties/[id]/reviews/page.tsx`](../../../utleiometer/src/app/%28public%29/properties/%5Bid%5D/reviews/page.tsx)
- [`utleiometer/src/app/(protected)/properties/new/page.tsx`](../../../utleiometer/src/app/%28protected%29/properties/new/page.tsx)

Mønster hos oss: server-page rendrer struktur + inkluderer klientkomponenter der vi trenger interaktivitet.

### Klient-komponenter (med `"use client"`)

Vi bruker klient-komponenter for interaktivitet, auth-state i UI, søk, skjema og navigering i browser:

- Auth/UI: [`authButtons.tsx`](../../../utleiometer/src/features/auth/client-components/authButtons.tsx), [`logoutButton.tsx`](../../../utleiometer/src/features/auth/client-components/logoutButton.tsx), [`welcomeMessage.tsx`](../../../utleiometer/src/features/auth/client-components/welcomeMessage.tsx)
- Skjema: [`loginForm.tsx`](../../../utleiometer/src/features/auth/client-components/loginForm.tsx), [`registerForm.tsx`](../../../utleiometer/src/features/auth/client-components/registerForm.tsx), [`PropertyRegisterClient.tsx`](../../../utleiometer/src/features/properties/client/PropertyRegisterClient.tsx)
- Listing/search: [`PropertiesClient.tsx`](../../../utleiometer/src/features/properties/client/PropertiesClient.tsx), [`ReviewsClient.tsx`](../../../utleiometer/src/features/reviews/client/ReviewsClient.tsx), [`searchBar.tsx`](../../../utleiometer/src/features/search/components/searchBar.tsx)
- Hooks: [`useAuth.ts`](../../../utleiometer/src/features/auth/hooks/useAuth.ts), [`useProperties.ts`](../../../utleiometer/src/features/properties/hooks/useProperties.ts), [`useReviews.ts`](../../../utleiometer/src/features/reviews/hooks/useReviews.ts)

## 2) Hvordan vi bruker server actions

Server actions ligger i `src/app/actions` og er merket med `"use server"`:

- [`properties.ts`](../../../utleiometer/src/app/actions/properties.ts)
- [`reviews.ts`](../../../utleiometer/src/app/actions/reviews.ts)

Hos oss brukes de spesielt til **skriving**:

- Opprette bolig / bolig+anmeldelse
- Opprette anmeldelse

Flyt-eksempel i prosjektet:

1. Klientskjema i [`PropertyRegisterClient.tsx`](../../../utleiometer/src/features/properties/client/PropertyRegisterClient.tsx) eller [`(protected)/properties/[id]/reviews/new/page.tsx`](../../../utleiometer/src/app/%28protected%29/properties/%5Bid%5D/reviews/new/page.tsx) samler input.
2. Komponent kaller en server action (`createPropertyAndReviewAction` / `createReviewAction`).
3. Server action bruker Firebase admin-lag i [`lib/firebase/properties.ts`](../../../utleiometer/src/lib/firebase/properties.ts) og [`lib/firebase/reviews.ts`](../../../utleiometer/src/lib/firebase/reviews.ts).
4. Klient får respons og gjør f.eks. `router.push(...)`.

## 3) Firebase: client SDK vs admin SDK

Vi har tydelig delt oppsett:

- **Client SDK** (nettleser): [`lib/firebase/client.ts`](../../../utleiometer/src/lib/firebase/client.ts)
  - brukes i klient-hooks og lesing i UI-laget (f.eks. `fetchProperties`, `fetchReviews`).
- **Admin SDK** (server): [`lib/firebase/admin.ts`](../../../utleiometer/src/lib/firebase/admin.ts)
  - brukes av server actions / server-funksjoner for skriveoperasjoner og privilegerte kall.

## 4) Beslutningsregel i dette prosjektet

Når dere lager ny kode, bruk denne tommelfingerregelen:

- Trenger du `useState`/`useEffect`, browser APIs, event handlers eller `useRouter`? → **Klient-komponent** (`"use client"`).
- Trenger du bare å bygge side/layout og komponere UI? → **Server-komponent** (default).
- Trenger du skrive til backend/databasen på en trygg måte? → **Server action** (`"use server"`).

## 5) Konkret eksempel fra koden vår

- [`(public)/properties/page.tsx`](../../../utleiometer/src/app/%28public%29/properties/page.tsx) er server-komponent.
- Den rendrer [`PropertiesClient.tsx`](../../../utleiometer/src/features/properties/client/PropertiesClient.tsx) som er klient-komponent.
- `PropertiesClient` bruker hooken [`useProperties.ts`](../../../utleiometer/src/features/properties/hooks/useProperties.ts) for data i browser.
- Når bruker oppretter data, brukes server action i [`app/actions/properties.ts`](../../../utleiometer/src/app/actions/properties.ts).

Det er hovedmønsteret vårt: **server-wrapper + client interaktivitet + server action for skriv**.
