# Good and Bad Tests

## Good Tests

**Integration-style**: Test through real interfaces, not mocks of internal parts.

```typescript
// GOOD: Tests observable behavior
test("user can checkout with valid cart", async () => {
  const cart = createCart();
  cart.add(product);
  const result = await checkout(cart, paymentMethod);
  expect(result.status).toBe("confirmed");
});
```

Characteristics:

- Tests behavior users/callers care about
- Uses public API only
- Survives internal refactors
- Describes WHAT, not HOW
- One logical assertion per test

## Bad Tests

**Implementation-detail tests**: Coupled to internal structure.

```typescript
// BAD: Tests implementation details
test("checkout calls paymentService.process", async () => {
  const mockPayment = jest.mock(paymentService);
  await checkout(cart, payment);
  expect(mockPayment.process).toHaveBeenCalledWith(cart.total);
});
```

Red flags:

- Mocking internal collaborators
- Testing private methods
- Asserting on call counts/order
- Test breaks when refactoring without behavior change
- Test name describes HOW not WHAT
- Verifying through external means instead of interface

```typescript
// BAD: Bypasses interface to verify
test("createUser saves to database", async () => {
  await createUser({ name: "Alice" });
  const row = await db.query("SELECT * FROM users WHERE name = ?", ["Alice"]);
  expect(row).toBeDefined();
});

// GOOD: Verifies through interface
test("createUser makes user retrievable", async () => {
  const user = await createUser({ name: "Alice" });
  const retrieved = await getUser(user.id);
  expect(retrieved.name).toBe("Alice");
});
```

**Tautological tests**: Expected value restates the implementation, so the test passes by construction.

```typescript
// BAD: Expected value is recomputed the way the code computes it
test("calculateTotal sums line items", () => {
  const items = [{ price: 10 }, { price: 5 }];
  const expected = items.reduce((sum, i) => sum + i.price, 0);
  expect(calculateTotal(items)).toBe(expected);
});

// GOOD: Expected value is an independent, known literal
test("calculateTotal sums line items", () => {
  expect(calculateTotal([{ price: 10 }, { price: 5 }])).toBe(15);
});
```

## Setup: flat, and self-cleaning

Keep setup inside the test that needs it. A flat setup lets you read one test top to bottom without chasing hooks in three parent `describe` blocks. But flat setup has a cleanup problem: if an assertion throws before the teardown line, the resource leaks into the next test.

```typescript
// BAD: an early failure skips close(), and the port stays held
test("shows the saved suggestion", async () => {
  const testServer = createTestServer();
  await testServer.listen();
  expect(await getSuggestion()).toBe("alice@example.com"); // throws here
  await testServer.close(); // never runs
});
```

Use a disposable object. `await using` guarantees the cleanup when the binding leaves scope, whatever the outcome.

```typescript
export function createTestServer() {
  const testServer = new Server();
  return {
    instance: testServer,
    async [Symbol.asyncDispose]() {
      await testServer.close();
    },
  };
}

// GOOD: cleanup is guaranteed, and it is one line
test("shows the saved suggestion", async () => {
  await using testServer = createTestServer();
  testServer.instance.get("/user", userHandler);
  await testServer.instance.listen();
  expect(await getSuggestion()).toBe("alice@example.com");
});
```

Use `Symbol.dispose` with `using` for synchronous cleanup, `Symbol.asyncDispose` with `await using` for asynchronous cleanup. TypeScript 5.2+ supports both; the `disposablestack` package polyfills the runtime side where needed.

Reach for `afterEach` only for teardown that is genuinely global (the repo's `vitest.setup.ts`). Per-test resources belong with the test.
