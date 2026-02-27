# Page Flows

Dette er en side-for-side oversikt over appen slik den er nå.

Hver side beskriver:
- hva som rendres på server
- hvilke klient-komponenter som brukes
- hvilke features som brukes og hvorfor

## Sider i appen (`src/app`)

- `/` → [`home/README.md`](./home/README.md)
- `/login` → [`login/README.md`](./login/README.md)
- `/register` → [`register/README.md`](./register/README.md)
- `/properties` → [`properties/README.md`](./properties/README.md)
- `/properties/[id]/reviews` → [`property-reviews/README.md`](./property-reviews/README.md)
- `/properties/new` → [`property-new/README.md`](./property-new/README.md)
- `/properties/[id]/reviews/new` → [`property-review-new/README.md`](./property-review-new/README.md)

## Felles notat

Sider under `(protected)` går gjennom auth-gating i:
- [`src/app/(protected)/layout.tsx`](../../../utleiometer/src/app/%28protected%29/layout.tsx)

Det betyr redirect til login når bruker ikke er innlogget.
