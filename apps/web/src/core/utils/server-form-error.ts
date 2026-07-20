import type {
  FormValidateAsyncFn,
  ServerFormState,
} from "@tanstack/react-form-nextjs";

/** `onServer` validator that yields a form-level string error. */
type FormLevelServerValidate<TValues> = (
  props: Parameters<FormValidateAsyncFn<TValues>>[0]
) => string;

/**
 * TanStack server form state carrying a form-level `onServer` error
 * (domain failures after `createServerValidate` succeeds).
 */
export const serverFormError = <TValues>(
  values: TValues,
  message: string
): ServerFormState<TValues, FormLevelServerValidate<TValues>> => ({
  errorMap: {
    onServer: message,
  },
  errors: [message],
  values,
});
