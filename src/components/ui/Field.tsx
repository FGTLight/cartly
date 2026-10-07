import {
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  useId,
} from 'react'

import { cn } from '@/lib/cn'

import { controlClass } from './styles'

interface FieldProps {
  label: string
  error?: string
  hint?: string
  className?: string
  children: (props: {
    id: string
    'aria-invalid': boolean
    'aria-describedby': string | undefined
  }) => ReactNode
}

/** Label + control + error message, wired together for screen readers. */
export function Field({ label, error, hint, className, children }: FieldProps) {
  const id = useId()
  const messageId = `${id}-message`
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': error || hint ? messageId : undefined,
      })}
      {error ? (
        <p id={messageId} role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className="text-xs text-zinc-500">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
}

export function InputField({ label, error, hint, className, ...props }: InputFieldProps) {
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      {(a11y) => <input className={controlClass} {...a11y} {...props} />}
    </Field>
  )
}

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  error?: string
}

export function TextareaField({ label, error, className, ...props }: TextareaFieldProps) {
  return (
    <Field label={label} error={error} className={className}>
      {(a11y) => <textarea className={cn(controlClass, 'min-h-28')} {...a11y} {...props} />}
    </Field>
  )
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
}

export function SelectField({ label, error, className, children, ...props }: SelectFieldProps) {
  return (
    <Field label={label} error={error} className={className}>
      {(a11y) => (
        <select className={controlClass} {...a11y} {...props}>
          {children}
        </select>
      )}
    </Field>
  )
}
