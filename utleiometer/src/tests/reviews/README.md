# Review Tests

Dette mappen inneholder tester for funksjonaliteten til å redigere og slette egne anmeldelser (reviews). 

## Testfiler

### `reviewOperations.test.ts`

Tester:
- `updateReview()` - oppdatering av ratings, kommentar og tittel
- `deleteReview()` - sletting av anmeldelse og oppdatering av property review count
- Håndtering av legacy rating-format
- Automatisk timestamping ved oppdatering

### `reviewCard.test.tsx`
**Komponent-tester for ReviewCard UI**

Tester:
- Knappene "Rediger" og "Slett" vises kun til anmeldelseeieren
- **Redigering**: 
  - Går inn i redigeringsmodus ved klikk
  - Kan avbryte redigering
  - Kaller `onSave` med oppdatert data
- **Sletting**:
  - Viser bekreftelsesdialog
  - Kan avbryte sletting
  - Kaller `onDelete` ved bekreftelse

## Kjøre testene
For å kjøre testene kjøres følgende kommando i terminalen: 

```bash
npx vitest run reviews

