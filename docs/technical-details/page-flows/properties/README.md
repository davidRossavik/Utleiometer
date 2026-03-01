# Page flow: `/properties`

## Fil

- Route-fil: [`src/app/(public)/properties/page.tsx`](../../../../utleiometer/src/app/%28public%29/properties/page.tsx)

## Server eller klient?

- `page.tsx` er en **server-komponent**.
- Den rendrer klientkomponenter i header og hovedinnhold.

## Klient-komponenter brukt på siden

- [`AuthButtons`](../../../../utleiometer/src/features/auth/client-components/authButtons.tsx)
- [`WelcomeMessage`](../../../../utleiometer/src/features/auth/client-components/welcomeMessage.tsx)
- [`PropertiesClient`](../../../../utleiometer/src/features/properties/client/PropertiesClient.tsx)

## Features og formål på denne siden

- **auth**: login/logout-UI og velkomst i topplinjen.
- **properties**: henter, filtrerer og viser boligliste.
  - Hook: [`useProperties`](../../../../utleiometer/src/features/properties/hooks/useProperties.ts)
  - Data: [`fetchProperties`](../../../../utleiometer/src/features/properties/data/fetchProperties.ts)
  - Søk i listen: [`usePropertySearch`](../../../../utleiometer/src/features/properties/hooks/usePropertySearch.ts)

## Kort sideflyt

1. Server rendrer struktur (header/main/footer).
2. `PropertiesClient` håndterer listing + søk i klienten.
3. Bruker kan klikke seg videre til `/properties/[id]/reviews`.
