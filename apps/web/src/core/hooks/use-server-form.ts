"use client";

import type { ServerFormState } from "@tanstack/react-form-nextjs";
import {
  initialFormState,
  mergeForm,
  useForm,
  useStore,
  useTransform,
} from "@tanstack/react-form-nextjs";
import { useActionState } from "react";

/** A value a form field can hold, or a group of them. */
type FormFieldValue =
  | Date
  | File
  | FormFieldValue[]
  | FormFieldValues
  | boolean
  | null
  | number
  | string
  | undefined;
interface FormFieldValues {
  [field: string]: FormFieldValue;
}

interface UseServerFormOptions<TDefaultValues extends FormFieldValues> {
  formOpts: {
    defaultValues: TDefaultValues;
    validators?: {
      onChange?: unknown;
    };
  };
  /**
   * The `useActionState` action. It is handed the previous server form state and
   * returns the next one - the shape `mergeForm` reads below.
   */
  action: (
    prev: ServerFormState<TDefaultValues, undefined> | undefined,
    formData: FormData
  ) => Promise<ServerFormState<TDefaultValues, undefined> | undefined>;
}

/** Form-level errors arrive either as a plain message or as an issue object. */
const isMessage = <T>(error: T): error is T & string =>
  typeof error === "string";

/**
 * Wires TanStack Form to a Next.js FormData server action via `useActionState`,
 * `mergeForm`, and `useTransform` (see TanStack next-server-actions example).
 */
export const useServerForm = <TDefaultValues extends FormFieldValues>({
  formOpts,
  action,
}: UseServerFormOptions<TDefaultValues>) => {
  const [state, formAction, isPending] = useActionState(
    action,
    initialFormState
  );

  const form = useForm({
    defaultValues: formOpts.defaultValues,
    validators: {
      // SAFETY: Zod 4 / Standard Schema - TanStack Form accepts this at runtime,
      // but its validator generic is not inferable from an opaque schema value.
      onChange: formOpts.validators?.onChange as never,
    },
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, state ?? {}),
      [state]
    ),
  });

  const formLevelError = useStore(form.store, (formState) => {
    for (const error of formState.errors) {
      if (isMessage(error)) {
        return error;
      }
    }
  });

  return { form, formAction, formLevelError, isPending };
};
