import type { FieldError, FieldValues, Path, UseFormRegister } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BaseFieldProps {
  label: string;
  error?: FieldError;
}

interface InputFieldProps<TFormValues extends FieldValues>
  extends BaseFieldProps {
  name: Path<TFormValues>;
  register: UseFormRegister<TFormValues>;
  type?: string;
  placeholder?: string;
}

export function InputField<TFormValues extends FieldValues>({
  label,
  name,
  register,
  error,
  type = "text",
  placeholder,
}: InputFieldProps<TFormValues>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} type={type} placeholder={placeholder} {...register(name)} />
      {error ? <p className="text-sm text-destructive">{error.message}</p> : null}
    </div>
  );
}

export function TextareaField<TFormValues extends FieldValues>({
  label,
  name,
  register,
  error,
  placeholder,
}: InputFieldProps<TFormValues>) {
  return (
    <div className="space-y-2 md:col-span-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} placeholder={placeholder} {...register(name)} />
      {error ? <p className="text-sm text-destructive">{error.message}</p> : null}
    </div>
  );
}

export function SelectField({
  label,
  value,
  onValueChange,
  placeholder,
  options,
  error,
}: BaseFieldProps & {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? <p className="text-sm text-destructive">{error.message}</p> : null}
    </div>
  );
}
