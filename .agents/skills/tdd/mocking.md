# When to Mock

Mock at **system boundaries** only:

- External APIs (payment, email, etc.)
- Databases (sometimes - prefer test DB)
- Time/randomness
- File system (sometimes)

Don't mock:

- Your own classes/modules
- Internal collaborators
- Anything you control

## Designing for Mockability

At system boundaries, design interfaces that are easy to mock:

**1. Use dependency injection**

Pass external dependencies in rather than creating them internally:

```typescript
// Easy to mock
function processPayment(order, paymentClient) {
  return paymentClient.charge(order.total);
}

// Hard to mock
function processPayment(order) {
  const client = new StripeClient(process.env.STRIPE_KEY);
  return client.charge(order.total);
}
```

**2. Prefer SDK-style interfaces over generic fetchers**

Create specific functions for each external operation instead of one generic function with conditional logic:

```typescript
// GOOD: Each function is independently mockable
const api = {
  getUser: (id) => fetch(`/users/${id}`),
  getOrders: (userId) => fetch(`/users/${userId}/orders`),
  createOrder: (data) => fetch('/orders', { method: 'POST', body: data }),
};

// BAD: Mocking requires conditional logic inside the mock
const api = {
  fetch: (endpoint, options) => fetch(endpoint, options),
};
```

The SDK approach means:
- Each mock returns one specific shape
- No conditional logic in test setup
- Easier to see which endpoints a test exercises
- Type safety per endpoint

## Clear vs reset vs restore

The three verbs are not interchangeable. Picking the wrong one leaks state between tests, which is the most common cause of a suite that passes alone and fails in order.

| Method | Clears recorded calls | Removes the implementation | Puts the original back |
| --- | --- | --- | --- |
| `.mockClear()` | yes | no | no |
| `.mockReset()` | yes | yes | no |
| `.mockRestore()` | yes | yes | yes (spies only) |

- **Clear** — mid-test, when you want to count calls only from the step that follows. Keeps the implementation you set up.
- **Reset** — between tests. Removes call history *and* the implementation, so no test inherits a stub from the one before it.
- **Restore** — only works on `vi.spyOn()` spies. Puts the real function back. Use it when the spy patched something global that later tests need intact.

`vi.fn()` mocks cannot be restored — there is no original. Only spies can.

This repo restores globally in `vitest.setup.ts`:

```typescript
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
```

So spies are undone for you. Do not repeat the teardown per file. If a `vi.fn()` is shared across tests in one file, reset it yourself in a `beforeEach` — the global restore does not remove its implementation.

Prefer configuration over per-test bookkeeping: `mockReset: true` in the Vitest config removes the whole class of "I forgot to clean up" bugs.
