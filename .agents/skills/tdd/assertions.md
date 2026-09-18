# Assertions

A test exists to fail. The quality of the failure message is the quality of the test. Each rule below is about making a failure name its own cause.

## Assert on promise state, not on the awaited value

`await` before `expect` throws away one half of the expectation: that the promise resolves at all. When it rejects, the runner reports an unhandled error with a stack trace in the source file, not a failed assertion in the test.

```typescript
// BAD: rejection becomes an opaque error, not a failed assertion
expect(await fetchUser("abc-123")).toEqual({ id: "abc-123" });

// GOOD: "expected promise to resolve, but it rejected with ..."
await expect(fetchUser("abc-123")).resolves.toEqual({ id: "abc-123" });

// GOOD: the rejection is the behavior under test
await expect(fetchUser("missing")).rejects.toThrow(UserNotFoundError);
```

Always `await` the `expect(...)` itself. An un-awaited `.resolves` chain passes no matter what.

## Trust implicit assertions

An assertion carries more than it states. `expect(data).toEqual({ id: "abc-123" })` already proves `data` is an object with exactly those keys. A step that acts on a value already proves the value is usable.

Redundant guard assertions add noise, weaken the failure message, and hide the intention of the test.

```typescript
// BAD: the length check is contained in the equality check
expect(ids).toHaveLength(3);
expect(ids).toEqual(["a", "b", "c"]);

// GOOD
expect(ids).toEqual(["a", "b", "c"]);
```

```typescript
// BAD: the click already proves the button is there and interactive
await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
await page.getByRole("button", { name: "Submit" }).click();

// GOOD
await page.getByRole("button", { name: "Submit" }).click();
```

Rule: every assertion you write must relate directly to the intention under test. If an assertion is a precondition and not the intention, delete it.

## Inverse assertions for "must not happen"

A plain negative assertion on asynchronous state is a false positive. It runs immediately, before the unwanted thing has had time to appear, so it passes for the wrong reason.

Instead, assert that the *positive* expectation fails. Give the unwanted state its full chance to appear, then require that it did not.

```typescript
// BAD: passes at once, even if the error toast appears 50ms later
expect(screen.queryByRole("alert")).not.toBeInTheDocument();

// GOOD: waits the full timeout, fails if the alert ever appears
const alertAppears = waitFor(() => {
  expect(screen.getByRole("alert")).toBeVisible();
});
await expect(alertAppears).rejects.toThrow();
```

The same shape works for any polled expectation: build the promise, do not await it, then `await expect(promise).rejects.toThrow()`.

Never use `sleep` for this. A fixed wait is either too short (flaky) or too long (slow), and it says nothing about what you expect.

For synchronous state that can never change after the act step, a plain negative assertion is correct and cheaper.

## `toBeVisible()` for presence, `toBeInTheDocument()` for absence

`toBeVisible()` carries implicit assertions the user cares about: the element is in the document, `display` is not `none`, `opacity` is not `0`, `visibility` is not `hidden`, `aria-hidden` is not `true`, and every ancestor satisfies the same. `toBeInTheDocument()` proves only that a node exists — an invisible, `aria-hidden` node passes it.

```typescript
// GOOD: presence the user can perceive
expect(greeting).toBeVisible();

// GOOD: absence, and the cheaper check is the correct one here
expect(errorNotification).not.toBeInTheDocument();
```

Do not use `toBeVisible()` to prove absence (`not.toBeVisible()` also passes for an element that was never rendered — it hides the difference). Do not use `toBeInTheDocument()` to prove presence.

## Do not assert on requests

An outgoing request is an implementation detail. The user does not expect a `POST /cart`; they expect the item in the cart. A test that asserts on request bodies or call counts breaks on every refactor of the transport layer while proving nothing about behavior.

Treat the network mock as **setup** — a fixed given — and assert on the user-facing outcome.

```typescript
// BAD: asserts the mechanism
expect(fetchSpy).toHaveBeenCalledWith("/cart", expect.objectContaining({ method: "POST" }));

// GOOD: asserts the outcome
server.use(
  http.post("/cart", () => new Response(null, { status: 201 })),
);
await page.getByRole("button", { name: 'Add "Porcelain mug" to cart' }).click();
await expect(page.getByRole("alert")).toHaveText("Successfully added to cart!");
```

When the request payload really must be correct, validate it **inside** the handler and answer with an error status. A wrong payload then breaks the outcome assertion, which is the failure you want to read.

```typescript
server.use(
  http.post("/cart", async ({ request }) => {
    const data = await request.clone().json();
    if (data.productName !== "Porcelain mug") {
      return new Response(null, { status: 400 });
    }
    return new Response(null, { status: 201 });
  }),
);
```

This keeps one seam (the user-visible outcome) and still guards the contract.
