"use client";

import { FieldError, Input, Label, TextField } from "@/core/components/ui";
import { fieldErrorMessage } from "@/core/utils/field-error-message";

/**
 * The slice of a TanStack Form field this input reads, kept structural so any
 * concrete `form.Field` render prop is assignable to it.
 */
interface TextFieldApi {
  name: string;
  state: {
    value: string;
    meta: {
      isValid: boolean;
      errorMap: { onChange?: unknown; onSubmit?: unknown; onServer?: unknown };
    };
  };
  handleChange: (value: string) => void;
  handleBlur: () => void;
}

/**
 * One labelled text input wired to a TanStack Form field, as used by the login
 * and register forms.
 */
export const AuthTextField = ({
  field,
  label,
  placeholder,
  type,
  className,
  isDisabled,
}: {
  field: TextFieldApi;
  label: string;
  placeholder: string;
  type: "text" | "email" | "password";
  className: string;
  isDisabled: boolean;
}) => (
  <TextField
    className={className}
    // Let TanStack Form handle validation instead of the browser.
    validationBehavior="aria"
    type={type === "password" ? "password" : undefined}
    isRequired
    name={field.name}
    value={field.state.value}
    onChange={field.handleChange}
    onBlur={field.handleBlur}
    isInvalid={!field.state.meta.isValid}
    isDisabled={isDisabled}
  >
    <Label htmlFor={field.name}>{label}</Label>
    <Input
      id={field.name}
      aria-label={label}
      placeholder={placeholder}
      type={type}
    />
    <FieldError>{fieldErrorMessage(field.state.meta.errorMap)}</FieldError>
  </TextField>
);
