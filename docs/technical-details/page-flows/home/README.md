# Page flow: `/`

## Fil

- Route-fil: [`src/app/page.tsx`](../../../../utleiometer/src/app/page.tsx)

## Server eller klient?

- `page.tsx` er en **server-komponent** (ingen `"use client"`).
- Den rendrer flere **klient-komponenter** for interaktivitet.

## Klient-komponenter brukt på siden

- [`AuthButtons`](../../../../utleiometer/src/features/auth/client-components/authButtons.tsx)
- [`WelcomeMessage`](../../../../utleiometer/src/features/auth/client-components/welcomeMessage.tsx)
- [`SearchBar`](../../../../utleiometer/src/features/search/components/searchBar.tsx)
- [`RegisterButton`](../../../../utleiometer/src/features/properties/components/registerButton.tsx)

## Features og formål på denne siden

- **auth**: vise riktig innlogget/utlogget-knapper og velkomst.
- **search**: søkefelt som sender bruker videre til `/properties?q=...`.
- **properties**: knapp for registrering av ny bolig.

## Kort sideflyt

1. Server rendrer layout/hero.
2. Klientkomponenter hydreres i browser.
3. Bruker kan:
   - gå til login/register via `AuthButtons`
   - søke via `SearchBar`
   - gå til registrering via `RegisterButton`
