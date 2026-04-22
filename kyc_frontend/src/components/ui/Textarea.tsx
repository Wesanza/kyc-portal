import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-body font-medium text-charcoal">
            {label}
            {props.required && <span className="text-error ml-0.5">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2.5 font-body text-sm text-charcoal',
            'bg-off-white border rounded-lg resize-y min-h-[80px]',
            'placeholder:text-medium-gray',
            'transition-colors duration-250',
            'focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-0 focus:border-forest',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-error focus:ring-error'
              : 'border-light-gray hover:border-forest-light',
            className
          )}
          {...props}
        />

        {error && (
          <p className="text-xs font-body text-error flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs font-body text-medium-gray">{helperText}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'