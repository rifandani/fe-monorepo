"use client";
/* oxlint-disable eslint/func-style -- function declarations */
import {
  initialFormState,
  mergeForm,
  useForm,
  useStore,
  useTransform,
} from "@tanstack/react-form-nextjs";
import { useActionState } from "react";

interface UseServerFormOptions<TDefaultValues extends Record<string, unknown>> {
  formOpts: {
    defaultValues: TDefaultValues;
    validators?: {
      onChange?: unknown;
    };
  };
  // oxlint-disable-next-line typescript/no-explicit-any -- Next server action + useActionState
  action: (prev: unknown, formData: FormData) => Promise<any>;
}

/**
 * Wires TanStack Form to a Next.js FormData server action via `useActionState`,
 * `mergeForm`, and `useTransform` (see TanStack next-server-actions example).
 */
export function useServerForm<TDefaultValues extends Record<string, unknown>>({
  formOpts,
  action,
}: UseServerFormOptions<TDefaultValues>) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialFormState
  );

  const form = useForm({
    defaultValues: formOpts.defaultValues,
    validators: {
      // Zod 4 / Standard Schema — TanStack Form accepts this at runtime.
      onChange: formOpts.validators?.onChange as never,
    },
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, state ?? {}),
      [state]
    ),
  });

  const formLevelError = useStore(form.store, (formState) => {
    for (const error of formState.errors) {
      if (typeof error === "string") {
        return error;
      }
    }
  });

  return { form, formAction, formLevelError, isPending };
}
