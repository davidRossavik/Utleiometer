# Language / i18n (next-intl)

Denne guiden beskriver hvordan språkstøtte er satt opp i prosjektet med `next-intl`, og hvordan du legger til nye tekster.

## 1) Hva som er satt opp

- Routing-konfig for språk: [utleiometer/src/i18n/routing.ts](../../../utleiometer/src/i18n/routing.ts)
- Request-konfig (laster meldingsfiler): [utleiometer/src/i18n/request.ts](../../../utleiometer/src/i18n/request.ts)
- Middleware/proxy for locale-routing: [utleiometer/src/proxy.ts](../../../utleiometer/src/proxy.ts)
- Locale-layout som validerer locale og setter request-locale: [utleiometer/src/app/[locale]/layout.tsx](../../../utleiometer/src/app/%5Blocale%5D/layout.tsx)
- Meldingsfiler (ordbøker):
  - [utleiometer/messages/no.json](../../../utleiometer/messages/no.json)
  - [utleiometer/messages/fr.json](../../../utleiometer/messages/fr.json)

## 2) Hvordan det fungerer (request-flyt)

1. Bruker går til en side, f.eks. `/fr` eller `/no`.
2. [proxy.ts](../../../utleiometer/src/proxy.ts) matcher URL og lar `next-intl` håndtere locale-routing.
3. [src/app/[locale]/layout.tsx](../../../utleiometer/src/app/%5Blocale%5D/layout.tsx) sjekker at locale er gyldig (`hasLocale`) og setter `setRequestLocale(locale)`.
4. [src/i18n/request.ts](../../../utleiometer/src/i18n/request.ts) laster riktig meldingsfil (`messages/<locale>.json`).
5. Komponenter kan bruke `useTranslations(...)` / `getTranslations(...)` og lese tekster fra ordboken.

## 3) Legge til nye oversettelser

1. Velg namespace per side/feature, f.eks. `HomePage`, `Auth`, `Properties`.
2. Legg samme nøkkelstruktur i begge filer:
   - [no.json](../../../utleiometer/messages/no.json)
   - [fr.json](../../../utleiometer/messages/fr.json)
3. Bruk nøkkelen i komponent:
   - `const t = useTranslations('HomePage')`
   - `t('title')`

Viktig: Nøkler må finnes i alle språk dere støtter, ellers får dere manglende-oversettelse for den locale.

## 4) Hvordan bytte språk i UI

Prosjektet har locale-aware navigation i [src/i18n/navigation.ts](../../../utleiometer/src/i18n/navigation.ts).

Bruk `Link` herfra (ikke `next/link`) når du lager språkvelger:

- `Link href={pathname} locale="no"`
- `Link href={pathname} locale="fr"`

I testing kan du også bytte språk direkte i URL:

- `/no`
- `/fr`

## 5) Vanlige feil

- Siden blir blank: locale-layout returnerer ikke `children`.
- Språk bytter ikke: lenker bruker `next/link` uten locale, eller `NEXT_LOCALE`-cookie holder deg på forrige språk.
- `t(...)` viser ikke verdi: nøkkel mangler i en av meldingsfilene.

## 6) Sjekkliste før masse-oversetting

- [ ] `src/app/[locale]/layout.tsx` renderer `children`
- [ ] `routing.ts` inneholder alle støttede språk
- [ ] `no.json` og `fr.json` har samme nøkkelstruktur
- [ ] Nye linker er locale-aware (`src/i18n/navigation.ts`)
