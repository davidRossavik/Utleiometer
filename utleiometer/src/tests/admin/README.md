# Admin System Tests

Comprehensive test suite for the admin functionality implemented in Admin.1 and Admin.2.

## Test Coverage

### Authorization Tests (`isAdmin.test.ts`)
Tests the admin authorization system from Admin.1:

**isAdmin() function:**
- ✅ Returns false when user is null
- ✅ Returns true when user has admin claim set to true
- ✅ Returns false when user has admin claim set to false
- ✅ Returns false when user has no admin claim
- ✅ Returns false when getIdTokenResult throws an error
- ✅ Returns false for unauthenticated users

**refreshUserToken() function:**
- ✅ Calls getIdToken with force refresh flag
- ✅ Handles null user gracefully
- ✅ Handles token refresh errors

**getIdToken() function:**
- ✅ Returns null when user is null
- ✅ Returns the ID token for authenticated user
- ✅ Returns null when getIdToken throws an error

**Total: 12 tests**

### Property Deletion Tests (`deleteProperty.test.ts`)
Tests the property deletion backend from Admin.2:

**deleteProperty() function:**
- ✅ Deletes property and all related reviews
- ✅ Throws error when property does not exist
- ✅ Handles property with no reviews

**deleteReviewsByPropertyId() function:**
- ✅ Deletes all reviews for a property using batch operations
- ✅ Handles property with no reviews

**deletePropertyAction() server action:**
- ✅ Allows admin to delete property
- ✅ Denies non-admin user from deleting property
- ✅ Denies user without admin claim
- ✅ Handles invalid token

**Total: 9 tests**

## Running Tests

Run all admin tests:
```bash
npx vitest run src/tests/admin
```

Run specific test file:
```bash
npx vitest run src/tests/admin/isAdmin.test.ts
npx vitest run src/tests/admin/deleteProperty.test.ts
```

Run tests in watch mode:
```bash
npx vitest src/tests/admin
```

## Test Results

All 21 tests passing ✅

```
✓ src/tests/admin/isAdmin.test.ts (12 tests)
✓ src/tests/admin/deleteProperty.test.ts (9 tests)

Test Files  2 passed (2)
     Tests  21 passed (21)
```

## Future Tests

When Admin.3 (UI) is merged to main, the following tests should be added:

### UI Component Tests
- ConfirmDialog component rendering and interaction
- ReviewCard admin delete button visibility
- ReviewsClient property deletion flow
- Admin-only UI elements conditional rendering

### Integration Tests
- End-to-end property deletion flow
- Cascade deletion verification
- UI state updates after deletion

### Security Tests
- Firestore rules enforcement
- Direct API call blocking for non-admins
- Token validation edge cases

## Dependencies

- **vitest**: Test runner
- **@testing-library/react**: React component testing utilities
- **@testing-library/jest-dom**: DOM matchers for assertions

## Notes

- All tests use mocking to avoid Firebase connection requirements
- Server actions are tested with proper authorization checks
- Edge cases covered: missing users, invalid tokens, non-existent properties
