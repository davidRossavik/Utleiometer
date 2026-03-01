# Page flow: `/register`

## Fil

- Route-fil: [`src/app/(auth)/register/page.tsx`](../../../../utleiometer/src/app/%28auth%29/register/page.tsx)

## Server eller klient?

- `page.tsx` er en **server-komponent**.
- Den rendrer klientkomponenten [`RegisterForm`](../../../../utleiometer/src/features/auth/client-components/registerForm.tsx).

## Klient-komponenter brukt på siden

- [`RegisterForm`](../../../../utleiometer/src/features/auth/client-components/registerForm.tsx)

## Features og formål på denne siden

- **auth**: registrering av ny bruker med validering og Firebase auth.
- Hook brukt av skjemaet: [`useRegisterForm`](../../../../utleiometer/src/features/auth/hooks/useRegisterForm.ts)

## Kort sideflyt

1. Server rendrer register-siden.
2. `RegisterForm` kjører validering og submit i klienten.
3. Ved vellykket registrering sendes bruker til `/`.
