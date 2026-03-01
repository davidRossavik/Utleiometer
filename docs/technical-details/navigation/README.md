# Navigation

Denne guiden forklarer hvordan navigering mellom sider fungerer i prosjektet, med pekere til filene som styrer flyten.

## 1) Hvordan URL-er mappes til sider

Prosjektet bruker Next.js App Router i `utleiometer/src/app`.

- App-root: [`utleiometer/src/app`](../../../utleiometer/src/app)
- Rot-layout (wraps alle sider): [`layout.tsx`](../../../utleiometer/src/app/layout.tsx)

### Viktige ruter

- `/` → [`page.tsx`](../../../utleiometer/src/app/page.tsx)
- `/login` → [`(auth)/login/page.tsx`](../../../utleiometer/src/app/%28auth%29/login/page.tsx)
- `/register` → [`(auth)/register/page.tsx`](../../../utleiometer/src/app/%28auth%29/register/page.tsx)
- `/properties` → [`(public)/properties/page.tsx`](../../../utleiometer/src/app/%28public%29/properties/page.tsx)
- `/properties/[id]/reviews` → [`(public)/properties/[id]/reviews/page.tsx`](../../../utleiometer/src/app/%28public%29/properties/%5Bid%5D/reviews/page.tsx)
- `/properties/new` → [`(protected)/properties/new/page.tsx`](../../../utleiometer/src/app/%28protected%29/properties/new/page.tsx)
- `/properties/[id]/reviews/new` → [`(protected)/properties/[id]/reviews/new/page.tsx`](../../../utleiometer/src/app/%28protected%29/properties/%5Bid%5D/reviews/new/page.tsx)

## 2) Route groups: `(auth)`, `(public)`, `(protected)`

Mappene med parenteser er **route groups** i Next.js:

- De hjelper oss organisere kode.
- De blir **ikke** en del av URL-en.

Eksempel:

- Fil: `src/app/(auth)/login/page.tsx`
- URL: `/login`

## 3) Beskyttede sider (må være innlogget)

Auth-gating skjer i layouten:

- [`(protected)/layout.tsx`](../../../utleiometer/src/app/%28protected%29/layout.tsx)

Hva den gjør:

1. Leser auth-status via [`useAuth`](../../../utleiometer/src/features/auth/hooks/useAuth.ts).
2. Hvis bruker ikke er innlogget: `router.replace('/login?next=...')`.
3. Hvis bruker er innlogget: viser children (selve siden).

Dette betyr at alle sider under `src/app/(protected)/...` automatisk blir beskyttet.

## 4) Hvordan navigering trigges i praksis

Navigering skjer hovedsakelig på to måter:

1. `Link` fra `next/link` (vanlig sidebytte)
2. `useRouter()` med `router.push(...)` eller `router.replace(...)` (programmatisk)

### Typiske steder med `Link`

- Auth-knapper i header: [`authButtons.tsx`](../../../utleiometer/src/features/auth/client-components/authButtons.tsx)
- Gå til ny bolig: [`registerButton.tsx`](../../../utleiometer/src/features/properties/components/registerButton.tsx)
- Fra boligliste til anmeldelser: [`PropertiesClient.tsx`](../../../utleiometer/src/features/properties/client/PropertiesClient.tsx)
- Fra anmeldelser til ny anmeldelse: [`ReviewsClient.tsx`](../../../utleiometer/src/features/reviews/client/ReviewsClient.tsx)

### Typiske steder med `router.push` / `router.replace`

- Login success → `/`: [`useLoginForm.ts`](../../../utleiometer/src/features/auth/hooks/useLoginForm.ts)
- Register success → `/`: [`useRegisterForm.ts`](../../../utleiometer/src/features/auth/hooks/useRegisterForm.ts)
- Logout → `/`: [`logoutButton.tsx`](../../../utleiometer/src/features/auth/client-components/logoutButton.tsx)
- Søkefelt → `/properties?q=...`: [`searchBar.tsx`](../../../utleiometer/src/features/search/components/searchBar.tsx)
- Etter registrering av bolig → `/`: [`PropertyRegisterClient.tsx`](../../../utleiometer/src/features/properties/client/PropertyRegisterClient.tsx)
- Redirect ved manglende auth → `/login?next=...`: [`(protected)/layout.tsx`](../../../utleiometer/src/app/%28protected%29/layout.tsx)

## 5) Eksempel på brukerflyt

### Flyt A: Fra forsiden til anmeldelser

1. Bruker søker på forsiden med [`SearchBar`](../../../utleiometer/src/features/search/components/searchBar.tsx).
2. `router.push('/properties?q=...')` navigerer til boligsiden.
3. I [`PropertiesClient`](../../../utleiometer/src/features/properties/client/PropertiesClient.tsx) klikker bruker `Se anmeldelser`.
4. `Link` går til `/properties/[id]/reviews`.

### Flyt B: Uinnlogget bruker prøver å legge til innhold

1. Bruker går til en protected side (f.eks. `/properties/new`).
2. [`(protected)/layout.tsx`](../../../utleiometer/src/app/%28protected%29/layout.tsx) oppdager at `currentUser` mangler.
3. Bruker sendes til `/login?next=<forrige path>` med `router.replace(...)`.

## 6) Hvor du starter når du feilsøker navigering

1. Start i route-filen under [`src/app`](../../../utleiometer/src/app).
2. Sjekk om siden ligger under `(protected)` og dermed påvirkes av [`(protected)/layout.tsx`](../../../utleiometer/src/app/%28protected%29/layout.tsx).
3. Søk etter `Link`, `router.push`, `router.replace` i feature-komponentene som siden bruker.
4. For auth-relaterte hopp: sjekk [`useAuth.ts`](../../../utleiometer/src/features/auth/hooks/useAuth.ts), [`useLoginForm.ts`](../../../utleiometer/src/features/auth/hooks/useLoginForm.ts), [`logoutButton.tsx`](../../../utleiometer/src/features/auth/client-components/logoutButton.tsx).
