import React from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, CalendarDays } from "lucide-react";

interface BaseFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

interface TextFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  type?: "text" | "email" | "tel" | "password" | "url";
}

interface TextareaFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  rows?: number;
  maxLength?: number;
}

interface SelectFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  allowClear?: boolean;
}

interface NumberFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}

interface CheckboxFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  // No additional props needed
}

interface SwitchFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  // No additional props needed
}

interface DateFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  showTimeSelect?: boolean;
}

// Text Input Field
export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  className,
  disabled,
  required,
  type = "text",
}: TextFieldProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
              {label}
            </FormLabel>
          )}
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "transition-colors",
                fieldState.error && "border-red-500 focus:border-red-500"
              )}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Textarea Field
export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  className,
  disabled,
  required,
  rows = 3,
  maxLength,
}: TextareaFieldProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
              {label}
            </FormLabel>
          )}
          <FormControl>
            <div className="relative">
              <Textarea
                {...field}
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                maxLength={maxLength}
                className={cn(
                  "transition-colors resize-none",
                  fieldState.error && "border-red-500 focus:border-red-500"
                )}
              />
              {maxLength && (
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                  {field.value?.length || 0}/{maxLength}
                </div>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Select Field
export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = "Select an option",
  className,
  disabled,
  required,
  options,
  allowClear = false,
}: SelectFieldProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
              {label}
            </FormLabel>
          )}
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger
                className={cn(
                  "transition-colors",
                  fieldState.error && "border-red-500 focus:border-red-500"
                )}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {allowClear && (
                <SelectItem value="">
                  <span className="text-muted-foreground">Clear selection</span>
                </SelectItem>
              )}
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Number Field
export function NumberField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  className,
  disabled,
  required,
  min,
  max,
  step = 1,
  prefix,
  suffix,
}: NumberFieldProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
              {label}
            </FormLabel>
          )}
          <FormControl>
            <div className="relative">
              {prefix && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {prefix}
                </div>
              )}
              <Input
                {...field}
                type="number"
                placeholder={placeholder}
                disabled={disabled}
                min={min}
                max={max}
                step={step}
                className={cn(
                  "transition-colors",
                  prefix && "pl-8",
                  suffix && "pr-8",
                  fieldState.error && "border-red-500 focus:border-red-500"
                )}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value === "" ? undefined : Number(value));
                }}
              />
              {suffix && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {suffix}
                </div>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Checkbox Field
export function CheckboxField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  disabled,
}: CheckboxFieldProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-row items-start space-x-3 space-y-0", className)}>
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            {label && <FormLabel>{label}</FormLabel>}
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}

// Switch Field
export function SwitchField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  disabled,
}: SwitchFieldProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-row items-center justify-between", className)}>
          <div className="space-y-0.5">
            {label && <FormLabel>{label}</FormLabel>}
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Date Field (simplified - using text input for now)
export function DateField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = "YYYY-MM-DD",
  className,
  disabled,
  required,
}: DateFieldProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
              {label}
            </FormLabel>
          )}
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                type="date"
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "transition-colors",
                  fieldState.error && "border-red-500 focus:border-red-500"
                )}
              />
              <CalendarDays className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}