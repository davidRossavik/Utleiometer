# Page flow: `/properties/[id]/reviews`

## Fil

- Route-fil: [`src/app/(public)/properties/[id]/reviews/page.tsx`](../../../../utleiometer/src/app/%28public%29/properties/%5Bid%5D/reviews/page.tsx)

## Server eller klient?

- `page.tsx` er en **server-komponent**.
- Den leser route-parameter (`id`) på server og sender videre til klientdel.

## Klient-komponenter brukt på siden

- [`AuthButtons`](../../../../utleiometer/src/features/auth/client-components/authButtons.tsx)
- [`WelcomeMessage`](../../../../utleiometer/src/features/auth/client-components/welcomeMessage.tsx)
- [`ReviewsClient`](../../../../utleiometer/src/features/reviews/client/ReviewsClient.tsx)

## Features og formål på denne siden

- **auth**: topplinje med auth-avhengig UI.
- **reviews**: henter og viser anmeldelser for valgt bolig.
  - Hook: [`useReviews`](../../../../utleiometer/src/features/reviews/hooks/useReviews.ts)
  - Data: [`fetchReviews`](../../../../utleiometer/src/features/reviews/data/fetchReviews.ts)
- **navigation til protected flyt**: hvis bruker er innlogget kan man gå til `/properties/[id]/reviews/new`.

## Kort sideflyt

1. Server tar `id` fra URL.
2. `ReviewsClient` henter og rendrer anmeldelser i klienten.
3. Innloggede brukere kan gå videre til skjema for ny anmeldelse.
