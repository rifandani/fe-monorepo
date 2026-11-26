# Expected failures and defects

> Recorded on 2026-11-26, because a bug and a refusal from the server got the same toast. The "Author errors" section was added because some developer-facing errors did not say what to fix. Builds on [ADR-0012](./0012-mutations-declare-their-retry-safety.md) (the UI shows the Unknown Outcome) and [ADR-0013](./0013-browser-telemetry-delivery.md) (the spa delivers spans).

Before this ADR, `toErrorMessage` (`packages/core/src/utils/error.ts`) changed each error into one toast string. A bug and a refusal from the server got the same path. The toast showed the text of any `Error`, also of a bug (for example `Cannot read properties of undefined`). No code sent the bug to telemetry. The text of the toast was in English only, and an error status with no Error Envelope showed `Request failed with status code 401: GET https://…`.

A lint rule cannot find which errors are expected. Thus this ADR states the rule, and the unit tests of the classifier hold it.

## Vocabulary

**Expected Failure**: A failure that the app knows can occur when the code is correct: the server refuses the request, the server does not answer in time, the device cannot reach the server, or the outcome is unknown (ADR-0012). The UI tells the person what occurred. It is not sent to telemetry. _Avoid_: handled error, user error

**Defect**: A failure that the code did not expect: a bug, a response with a wrong shape, a request that the client cannot build. The UI shows only a generic message, and the app sends the cause to telemetry. _Avoid_: crash, unknown error

## Decisions

- **Core classifies a failure.** `toFailure(cause)` in `@workspace/core/http/failure` gives a `Failure`, a `Data.TaggedEnum` with two cases: `Expected` (a Translation Key, and the server message if there is one) and `Defect` (the cause). The constructors are `Failures.Expected` and `Failures.Defect`.
- **Each expected error tag maps to one Translation Key.** A non-empty server message replaces the translation of that key when the UI presents the failure (see below).

  | Cause                                     | Failure                                             |
  | ----------------------------------------- | --------------------------------------------------- |
  | `HttpResponseError`                       | `Expected`, `errorRequestRejected`, and `serverMessage` when the Error Envelope has a non-empty message |
  | `TimeoutError` of a not-idempotent mutation | `Expected`, `errorUnknownOutcome` (ADR-0012)      |
  | `TimeoutError`                            | `Expected`, `errorTimeout`                          |
  | `HttpClientError` with a `TransportError` | `Expected`, `errorNetwork`                          |
  | `HttpClientError` with a different reason    | `Defect`                                            |
  | `SchemaError` (response with wrong shape) | `Defect`                                            |
  | any other `Error`, or a value that is not an `Error` | `Defect`                                 |

  The keys are in `failureMessageKeys`. Each Message Catalog in core has a translation for each key.
- **The Error Envelope message goes before the translation.** For an `HttpResponseError` with an Error Envelope, `Expected` keeps `serverMessage`, and the UI shows it (for example `Invalid credentials`). The server knows the reason for its refusal; the client does not. A body that is not an Error Envelope (plain text, an HTML page from a proxy) is never shown.
- **A Defect shows a generic message.** `failureMessage(failure, translate)` gives `errorGeneric` for a Defect. The text of the cause never goes to the UI.
- **A Defect goes to telemetry; an Expected Failure does not.** `presentFailure(failure, presenter)` shows the message with `presenter.showError`, and calls `presenter.reportDefect(cause)` only for a Defect. The app gives the `FailurePresenter`:
  - spa: `useFailurePresenter` (`apps/spa/src/hooks/`) shows a `sonner` toast and runs `recordException("mutation.onError", toReportedError(cause))` on `appRuntime`.
  - expo: `useFailurePresenter` (`apps/expo/src/hooks/`) shows a Tamagui toast and writes the cause to `logger.error` with the same label, `mutation.onError`. Expo has no trace exporter yet. When it gets one, only `reportDefect` changes.
- **Mutations present the failure one time.** `withRetrySafety(owned, caller, presenter)` adds an `onError`. It calls `presentFailure(toMutationFailure(error, context.meta), presenter)`, then the `onError` of the caller. For a timeout of a not-idempotent mutation, `toMutationFailure` gives the Unknown Outcome. For all other errors, it gives `toFailure(error)`.
- **Inline error text does not report.** A component that shows the error of a mutation (the login `Note`) calls `failureMessage(toFailure(error), t)`. Rendering has no side effects, and `onError` already reported the Defect.
- **The anti-slop-effect rules stay the fence for tag handling.** The classifier uses `instanceof`, the guards of Effect (`Cause.isTimeoutError`, `HttpClientError.isHttpClientError`) and `Match.tag`. Code that handles a `Failure` uses `Failures.$match` or `Failures.$is`, not a manual `_tag` comparison.

## Author errors

An Expected Failure and a Defect are for the person who uses the app. An **Author Error** is for the author or the developer who must change the code or the setup: a missing env variable, a Feature Flag with no definition, a lint finding. Before this section, some of these errors only said that something failed (`Unknown Feature Flag: …`, `SchemaError(Expected string at ["VITE_API_BASE_URL"])`). A lint rule cannot judge the quality of a message, so this section states the rule, and unit tests hold the text of each message.

- **An Author Error gives the location, the rejected value and a fix.** The location is the env variable, the function or the file. The rejected value is in quotes, or the message says that the value is not set or empty. The fix tells the reader which file or command to change.
- **`authorErrorMessage(problem, reason, fix)` builds the text.** It is in `@workspace/core/utils/author-error` and gives `<problem>. <reason>. Fix: <fix>.`
- **Env variables use `makeEnvVar`.** `@workspace/core/config/env-var` makes a `Config` for one env variable. When the variable is not set or not valid, the `ConfigError` has a `SourceError` with the message, for example `Env variable VITE_API_BASE_URL is "not-a-url". Expected an absolute URL. Fix: set VITE_API_BASE_URL in apps/spa/.env.local (apps/spa/.env.example lists each variable).` Each app gives its fix: spa names `apps/spa/.env.local`, expo names the EAS project env and `bun expo env:pull:dev`.
- **Only public values go into a message.** `makeEnvVar` shows the value, so use it only for variables that the build sends to the client (`VITE_*`, `EXPO_PUBLIC_*`). Read a private value with `Config.Redacted`, and do not put it in a message.
- **Feature Flags follow the same rule.** `getFeatureFlagDefinition` names itself, the rejected id, the ids that the registry defines, and the file to change.
- **Custom lint rules give the problem, the reason and the fix.** A landmine rule with a budget uses `budgetMessage` (`tools/lint/landmines/finding.ts`), which gives `<problem>. <reason>. Budget: <signature>. Fix: <fix>.`
- **An Author Error is not an Expected Failure.** It has no Translation Key. If one gets to `toFailure`, it is a Defect: the UI shows the generic message, and the app sends the cause to telemetry.

## Considered Options

- **A lint rule** — rejected. A rule cannot know which errors the code expects.
- **Always show the translation of `errorRequestRejected`, and ignore the server message** — rejected. The login would show "The server could not complete the request" for wrong credentials. The server reason is the most useful text, and the e2e and Maestro flows check it.
- **A translated message for each status code** — rejected for now. No screen needs a different text for a 403 and a 422. Reopen it when one does.
- **`reportDefect` in core, through an Effect span** — rejected. Core has no tracer, and expo has no exporter. The app owns its telemetry adapter (ADR-0006).
- **Keep the text of any `Error`** — rejected. That text is for developers, it is in English only, and it can contain internal detail.
- **A lint rule for the text of an Author Error** — rejected. A rule can find `new Error(...)`, but it cannot know if the text gives a usable fix.
- **Keep the default `ConfigError` text** — rejected. It gives the variable and the expected value, but not the rejected value or the file to change.

## Consequences

- The server message does not go through a Message Catalog. If the server sends English text, a person who uses `id-id` sees English for a refusal. This is a known cost. When the API gives an error code, map the code to a Translation Key and remove `serverMessage`.
- A new expected error needs a case in `toFailure`, a key in `failureMessageKeys`, and a translation in each Message Catalog. Until then, it is a Defect, so it shows the generic message and goes to telemetry. That is the safe default.
- `failure.unit.test.ts` proves the rows of the table for `toFailure`, that a Defect never shows the text of its cause, that each key has a translation in each Message Catalog, and that `presentFailure` reports a Defect and does not report an Expected Failure. `retry-safety.unit.test.ts` proves the Unknown Outcome row through `toMutationFailure`.
- `retry-safety.unit.test.ts` proves, through a `MutationObserver`, that `withRetrySafety` presents the Unknown Outcome and reports a Defect with the generic message.
- `toErrorMessage`, `genericErrorMessage`, `unknownOutcomeMessage` and `toMutationErrorMessage` are removed.
- `env-var.unit.test.ts` proves the text of an env variable that is not valid, not set and empty. `registry.unit.test.ts` (spa) proves the text of a Feature Flag with no definition, and that each Feature Flag id has a definition.
- `makeEnvVar` changes a variable that is not set into a failure, so `Config.withDefault` after it has no effect. Put an optional variable in `Config.withDefault` before you add it to a message, or give the default in the schema.
- A new Author Error has no automatic check. Code review must compare its text with this section.
