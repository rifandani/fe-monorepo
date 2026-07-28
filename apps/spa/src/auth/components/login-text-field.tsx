import { FieldError, Input, Label, TextField } from "@/core/components/ui";

/**
 * The slice of a TanStack Form field this input reads, kept structural so any
 * concrete `form.Field` render prop is assignable to it.
 */
interface LoginFieldApi {
  state: {
    value: string;
    meta: {
      isValid: boolean;
      errorMap: { onChange?: { message?: string }[] | null };
    };
  };
  handleChange: (value: string) => void;
}

/**
 * One labelled text input of the login form.
 */
export const LoginTextField = ({
  field,
  id,
  label,
  placeholder,
  type,
  className,
}: {
  field: LoginFieldApi;
  id: string;
  label: string;
  placeholder: string;
  type?: "password";
  className: string;
}) => (
  <TextField
    className={className}
    // let RHF handle validation instead of the browser.
    validationBehavior="aria"
    type={type}
    isRequired
    value={field.state.value}
    onChange={field.handleChange}
    isInvalid={!field.state.meta.isValid}
  >
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} aria-label={label} placeholder={placeholder} type={type} />
    <FieldError>{field.state.meta.errorMap.onChange?.[0]?.message}</FieldError>
  </TextField>
);
