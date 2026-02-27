# Page flow: `/properties/new`

## Fil

- Route-fil: [`src/app/(protected)/properties/new/page.tsx`](../../../../utleiometer/src/app/%28protected%29/properties/new/page.tsx)
- Beskyttelse (layout): [`src/app/(protected)/layout.tsx`](../../../../utleiometer/src/app/%28protected%29/layout.tsx)

## Server eller klient?

- `page.tsx` er en **server-komponent**.
- Selve auth-gating skjer i en **klient-layout** (`(protected)/layout.tsx`) som bruker auth-state.

## Klient-komponenter brukt på siden

- [`AuthButtons`](../../../../utleiometer/src/features/auth/client-components/authButtons.tsx)
- [`WelcomeMessage`](../../../../utleiometer/src/features/auth/client-components/welcomeMessage.tsx)
- [`PropertyRegisterClient`](../../../../utleiometer/src/features/properties/client/PropertyRegisterClient.tsx)

## Features og formål på denne siden

- **auth**: beskytte route via `ProtectedLayout`.
- **properties**: registrere ny bolig (og første anmeldelse) via skjema.
- **server action**: skjema sender data til [`createPropertyAndReviewAction`](../../../../utleiometer/src/app/actions/properties.ts).

## Kort sideflyt

1. Bruker åpner `/properties/new`.
2. `ProtectedLayout` sjekker auth; uinnlogget bruker redirectes til `/login?next=...`.
3. Innlogget bruker ser `PropertyRegisterClient`.
4. Ved submit kalles server action og bruker sendes videre.
