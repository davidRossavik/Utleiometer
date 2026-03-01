# Page flow: `/properties/[id]/reviews/new`

## Fil

- Route-fil: [`src/app/(protected)/properties/[id]/reviews/new/page.tsx`](../../../../utleiometer/src/app/%28protected%29/properties/%5Bid%5D/reviews/new/page.tsx)
- Beskyttelse (layout): [`src/app/(protected)/layout.tsx`](../../../../utleiometer/src/app/%28protected%29/layout.tsx)

## Server eller klient?

- Denne `page.tsx` er en **klient-komponent** (`"use client"`).
- Siden ligger fortsatt under `(protected)` og får auth-gating fra layouten.

## Klient-komponenter og hooks brukt på siden

- Siden selv håndterer skjema/UI direkte.
- Hook: [`useAuth`](../../../../utleiometer/src/features/auth/hooks/useAuth.ts)
- Next navigation hooks: `useParams`, `useSearchParams`, `useRouter`

## Features og formål på denne siden

- **auth**: sjekke innlogget bruker før submit.
- **reviews**: opprette ny anmeldelse for en bestemt bolig-ID.
- **server action**: kall til [`createReviewAction`](../../../../utleiometer/src/app/actions/reviews.ts).

## Kort sideflyt

1. Protected layout slipper bare innlogget bruker inn.
2. Siden leser `id` fra URL og `address` fra query.
3. Bruker fyller ut skjema og submitter.
4. `createReviewAction` kalles, og ved suksess går bruker tilbake (`router.back()`).
