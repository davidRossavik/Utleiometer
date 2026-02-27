# Arkitektur i kodebasen (etter gjennomgang 1)

Denne README-en beskriver hvordan kodebasen er organisert **nå**, etter gjennomgang 1.
Målet er å gjøre feature-basert struktur enkel å forstå for hele teamet.

## 1) Hovedidé: feature-basert struktur

I stedet for å samle alt i én stor `components/`-mappe, grupperer vi kode etter **hva funksjonaliteten gjør**.

Eksempel hos oss:

- [`src/features/auth`](../../../utleiometer/src/features/auth)
- [`src/features/properties`](../../../utleiometer/src/features/properties)
- [`src/features/reviews`](../../../utleiometer/src/features/reviews)
- [`src/features/search`](../../../utleiometer/src/features/search)

Tenk på en feature som et «mini-domene»:
- den har egne komponenter,
- egne hooks,
- egne datakall,
- og egne typer.

## 2) Hvordan hele prosjektet er delt opp

- Routing og sidekomposisjon: [`src/app`](../../../utleiometer/src/app)
- Feature-logikk: [`src/features`](../../../utleiometer/src/features)
- Gjenbrukbar, domene-uavhengig UI: [`src/ui`](../../../utleiometer/src/ui)
- Felles util/config: [`src/lib`](../../../utleiometer/src/lib)
- Tester: [`src/tests`](../../../utleiometer/src/tests)

## 3) Hva går i `app/` vs `features/`?

### `app/` (ruter og side-wrappere)

I App Router ligger URL-strukturen her:

- [`src/app/page.tsx`](../../../utleiometer/src/app/page.tsx)
- [`src/app/(public)/properties/page.tsx`](../../../utleiometer/src/app/%28public%29/properties/page.tsx)
- [`src/app/(public)/properties/[id]/reviews/page.tsx`](../../../utleiometer/src/app/%28public%29/properties/%5Bid%5D/reviews/page.tsx)
- [`src/app/(protected)/properties/new/page.tsx`](../../../utleiometer/src/app/%28protected%29/properties/new/page.tsx)

`app/` skal helst være «tynn»: sette opp side, layout og koble sammen features.

### `features/` (det meste av faktisk funksjonalitet)

Her ligger det som gjør at siden fungerer i praksis:

- UI-komponenter med domene-kunnskap
- hooks for state/dataflyt
- data-funksjoner
- feature-typer

## 4) Inni en feature (konkret eksempel: properties)

Se mappen: [`src/features/properties`](../../../utleiometer/src/features/properties)

Vanlig struktur hos oss:

- `client/` → større klientkomponenter (f.eks. skjerm/section)
- `components/` → mindre feature-komponenter
- `hooks/` → state og sammensatt logikk
- `data/` → datakall
- `types.ts` → typer

Konkrete filer:

- Klientvisning: [`PropertiesClient.tsx`](../../../utleiometer/src/features/properties/client/PropertiesClient.tsx)
- Hook: [`useProperties.ts`](../../../utleiometer/src/features/properties/hooks/useProperties.ts)
- Datakall: [`fetchProperties.ts`](../../../utleiometer/src/features/properties/data/fetchProperties.ts)
- Typer: [`types.ts`](../../../utleiometer/src/features/properties/types.ts)

Typisk flyt i en feature:

1. Side i `app/` rendrer en feature-komponent.
2. Feature-komponenten bruker en hook.
3. Hooken kaller data-lag.
4. Resultatet rendres tilbake i UI.

## 5) Hvorfor dette er nyttig (spesielt for nye utviklere)

- Du kan lære én feature av gangen.
- Endringer i én feature gir mindre risiko for å ødelegge andre områder.
- Det blir lettere å finne «hvor ting hører hjemme».
- Koden skalerer bedre når appen vokser.

## 6) Samspill med server/client i Next.js

Kortversjon av oppsettet vårt:

- `app/`-filer er ofte server-komponenter (default)
- interaktivitet ligger i klientkomponenter (`"use client"`) i features
- skriveoperasjoner går via server actions (`"use server"`) i [`src/app/actions`](../../../utleiometer/src/app/actions)

Se detaljert guide her:
- [`technical-details/server-client/README.md`](../server-client/README.md)

## 7) Praktiske regler når du skal legge til ny kode

1. Ny URL/side? → legg route i `src/app/...`.
2. Ny funksjonalitet for et domene (auth/properties/reviews/search)? → legg i riktig feature.
3. Ren gjenbrukbar UI (knapp, input, card uten domenekunnskap)? → `src/ui`.
4. Trenger siden interaktivitet/hook/browser API? → klientkomponent.
5. Trenger du trygg skriving til backend? → server action.

## 8) Rask onboarding-rute for nye teammedlemmer

Hvis du er ny i prosjektet, start her:

1. Les [`technical-details/navigation/README.md`](../navigation/README.md)
2. Les [`technical-details/authentication/README.md`](../authentication/README.md)
3. Les denne filen ferdig
4. Gå så inn i én feature (f.eks. [`src/features/properties`](../../../utleiometer/src/features/properties)) og følg flyten `client -> hooks -> data -> types`
