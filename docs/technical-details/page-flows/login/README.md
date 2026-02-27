# Page flow: `/login`

## Fil

- Route-fil: [`src/app/(auth)/login/page.tsx`](../../../../utleiometer/src/app/%28auth%29/login/page.tsx)

## Server eller klient?

- `page.tsx` er en **server-komponent**.
- Den rendrer klientkomponenten [`LoginForm`](../../../../utleiometer/src/features/auth/client-components/loginForm.tsx).

## Klient-komponenter brukt på siden

- [`LoginForm`](../../../../utleiometer/src/features/auth/client-components/loginForm.tsx)

## Features og formål på denne siden

- **auth**: innlogging med validering, Firebase-kall og navigering ved suksess.
- Hook brukt av skjemaet: [`useLoginForm`](../../../../utleiometer/src/features/auth/hooks/useLoginForm.ts)

## Kort sideflyt

1. Server rendrer login-siden med form-wrapper.
2. `LoginForm` håndterer input/submit i klienten.
3. Ved suksess navigerer auth-flyten videre til `/`.
