"use client";

import type { ReactNode } from "react";

import { Button } from "@/core/components/ui";

/**
 * The slice of a TanStack Form this button subscribes to, kept structural so
 * any concrete form is assignable to it.
 */
interface SubmitFormApi {
  Subscribe: (props: {
    selector: (state: {
      canSubmit: boolean;
      isSubmitting: boolean;
    }) => [boolean, boolean];
    children: (state: [boolean, boolean]) => ReactNode;
    // TanStack's `Subscribe` may return a promise-flavoured node, which is wider
    // than what React's `ReactNode` allows here.
  }) => ReactNode | Promise<ReactNode>;
}

/**
 * Submit button of an auth form, disabled while the form or the server action
 * is busy.
 */
export const AuthSubmitButton = ({
  form,
  isPending,
  label,
  loadingLabel,
}: {
  form: SubmitFormApi;
  isPending: boolean;
  label: string;
  loadingLabel: string;
}) => (
  <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
    {([canSubmit, isSubmitting]) => {
      const isBusy = isPending || isSubmitting;
      return (
        <Button
          type="submit"
          className="mt-8 w-full normal-case"
          isDisabled={isBusy || !canSubmit}
        >
          {isBusy ? loadingLabel : label}
        </Button>
      );
    }}
  </form.Subscribe>
);
