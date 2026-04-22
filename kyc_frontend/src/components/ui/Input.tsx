import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  leftAddon,
  rightAddon,
  className,
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-body font-medium text-charcoal"
        >
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {leftAddon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-medium-gray">
            {leftAddon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full bg-off-white border text-sm font-body text-charcoal rounded-lg px-3 py-2.5 placeholder:text-medium-gray transition-all duration-250',
            'focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent',
            error
              ? 'border-error focus:ring-error'
              : 'border-light-gray hover:border-forest-light',
            leftAddon && 'pl-9',
            rightAddon && 'pr-9',
            className
          )}
          {...props}
        />
        {rightAddon && (
          <div className="absolute right-3 flex items-center pointer-events-none">
            {rightAddon}
          </div>
        )}
      </div>
      {error && <p className="text-xs font-body text-error">{error}</p>}
      {helper && !error && (
        <p className="text-xs font-body text-medium-gray">{helper}</p>
      )}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helper,
  className,
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-body font-medium text-charcoal"
        >
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'w-full bg-off-white border text-sm font-body text-charcoal rounded-lg px-3 py-2.5 placeholder:text-medium-gray resize-y min-h-[80px] transition-all duration-250',
          'focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent',
          error
            ? 'border-error focus:ring-error'
            : 'border-light-gray hover:border-forest-light',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs font-body text-error">{error}</p>}
      {helper && !error && (
        <p className="text-xs font-body text-medium-gray">{helper}</p>
      )}
    </div>
  );
};

export default Input;
