import { FieldError, Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TextField } from "@/components/ui/text-field";

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
