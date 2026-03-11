# Maps (Leaflet + Geokoding)

Denne guiden forklarer hvordan kartløsningen fungerer i appen akkurat nå: hvordan vi går fra adresse til koordinater, hvordan data lagres, og hvordan kartet vises på boligsiden.

## 1) Oversikt

Vi bruker tre hoveddeler:

1. `react-leaflet` + `leaflet` for selve kartet i UI.
2. Geokoding i backend (server action) for å gjøre adresse om til koordinater.
3. Lagring av koordinater (`latitude`, `longitude`) på property-dokumentet i Firestore.

Relevant kode:
- `utleiometer/src/ui/map/propertyMap.tsx`
- `utleiometer/src/lib/geocoding.ts`
- `utleiometer/src/app/[locale]/actions/properties.ts`
- `utleiometer/src/lib/firebase/properties.ts`
- `utleiometer/src/features/reviews/client/ReviewsClient.tsx`
- `utleiometer/src/app/layout.tsx`

## 2) Dataflyt: fra adresse til kart

Når en bruker oppretter bolig:

1. Bruker sender inn adressefelter (`address`, `zipCode`, `city`) i registreringsflyten.
2. `createPropertyAction` eller `createPropertyAndReviewAction` bygger en adresse-streng.
3. Server action kaller `geocodeAddress(...)`.
4. Hvis geokoding lykkes, legges `latitude` og `longitude` på property-data før lagring.
5. Når reviews/property-siden åpnes, hentes property med koordinater.
6. `ReviewsClient` rendrer `PropertyMap` hvis koordinater finnes, ellers fallback-melding.

Kjernen i flowen er at brukeren slipper å skrive koordinater manuelt.

## 3) UI-delen (Leaflet)

Kartkomponenten ligger i:
- `utleiometer/src/ui/map/propertyMap.tsx`

Den:
- er en klientkomponent (`"use client"`),
- bruker `MapContainer`, `TileLayer`, `Marker`, `Popup`,
- får inn `lat`, `lng` og valgfri `title` via props.

Kart-hoyde styres i wrapper-div med Tailwind-klasse, for eksempel `h-[220px]`.

Global Leaflet-CSS er importert i:
- `utleiometer/src/app/layout.tsx`

Uten denne CSS-importen vil kartet ofte se "ødelagt" ut (manglende tiles/ikoner/layout).

## 4) Geokoding (backend)

Geokoding-funksjonen ligger i:
- `utleiometer/src/lib/geocoding.ts`

Den bruker Nominatim (OpenStreetMap) med `fetch` og returnerer:
- `{ latitude, longitude }` ved treff,
- `null` ved feil eller ingen treff.

Server action håndterer geokoding defensivt:
- Hvis geokoding feiler, opprettes bolig fortsatt uten koordinater.
- Hvis geokoding lykkes, lagres koordinater sammen med annen property-data.

Dette gjør at registrering ikke stopper selv om ekstern geokoding er ustabil.

## 5) Lagring i Firestore

Property-typen i backend inkluderer:
- `latitude?: number`
- `longitude?: number`

Se:
- `utleiometer/src/lib/firebase/properties.ts`
- `utleiometer/src/features/properties/types.ts`

Koordinater er valgfrie fordi eldre data og feilslått geokoding må støttes.

## 6) Rendering med fallback

I `ReviewsClient`:
- Hvis `latitude` og `longitude` finnes: vis `PropertyMap`.
- Hvis ikke: vis tydelig tekst om at kart ikke er tilgjengelig ennå.

Se:
- `utleiometer/src/features/reviews/client/ReviewsClient.tsx`

Denne strategien gjør UI robust selv når ikke alle boliger har koordinater.

## 7) Vanlige feilkilder

1. Leaflet-CSS mangler i layout.
2. Ugyldig eller for vag adresse gir ingen geokoding-treff.
3. Ekstern geokoding kan rate-limites eller feile midlertidig.
4. Eldre boliger i databasen har ikke koordinater.

## 8) Debug-sjekkliste

1. Bekreft at property-dokument har `latitude`/`longitude` i Firestore.
2. Sjekk at `geocodeAddress` får riktig adresseformat i server action.
3. Sjekk at `ReviewsClient` faktisk får property med koordinater.
4. Bekreft CSS-import i `utleiometer/src/app/layout.tsx`.
5. Sjekk browser console/network for Leaflet/Nominatim-feil.

## 9) Videre forbedringer

1. Flytt geokoding til en provider med API-nokkel (Mapbox/Google) for produksjonsstabilitet.
2. Cache geokodingsresultater per adresse for å redusere antall kall.
3. Legg til i18n for fallback-tekst knyttet til kart.
4. Legg til test som verifiserer opprettelse med og uten geokoding-svar.

## 10) Kort oppsummering

Kartløsningen er satt opp slik at bruker kun skriver adresse, mens backend automatisk geokoder og lagrer koordinater. UI viser kart når data finnes, og håndterer manglende koordinater på en trygg måte.