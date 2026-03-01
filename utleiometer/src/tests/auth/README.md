# Authentication Tests

These tests are written using **Vitest** and React Testing Library.  
All external dependencies (Firebase, router) are mocked to keep the tests fast and isolated.

## 1. useAuth.test.tsx

Tests the `useAuth` hook.

What it verifies:
- The hook initializes with `loading = true` and `currentUser = null`
- It updates `currentUser` and sets `loading = false` when Firebase auth state changes
- It correctly handles logout (`user = null`)
- It calls the `unsubscribe` function on unmount

Purpose:  
Ensure the authentication state hook behaves correctly when Firebase emits auth state changes.

---

## 2. LoginFormUI.test.tsx

Tests the `LoginFormUI` presentational component.

What it verifies:
- `onChange` is called when the user types in the input fields
- `onSubmit` is triggered when the form is submitted
- `formError` is displayed when provided

Purpose:  
Ensure the login form UI is properly wired and renders expected states.

---

## 3. LogoutButton.test.tsx

Tests the `LogoutButton` component.

What it verifies:
- `signOut` is called when the button is clicked
- The user is redirected on successful logout
- An error message is displayed if logout fails
- The loading state is handled correctly

Purpose:  
Ensure the logout flow behaves correctly in both success and failure scenarios.

---

These tests focus on frontend behavior and component logic.  
They do **not** test real Firebase integration or backend behavior.
