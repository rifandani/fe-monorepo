# TanStack Form Next.js server actions (no next-safe-action)

Form actions use `@tanstack/react-form-nextjs` end-to-end (`createServerValidate` + `useActionState` + `mergeForm`), matching the official next-server-actions example. We dropped `next-safe-action` so there is one validation/error channel (TanStack `formState`) instead of a custom NSA bridge. Non-form actions (logout, locale) are plain `"use server"` functions with `useTransition`. Success still uses server `redirect()` after a `ServerValidateError`-only catch so Next redirects are not swallowed as form errors.
