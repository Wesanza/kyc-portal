import React from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  error,
  helper,
  options,
  placeholder,
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
      <div className="relative">
        <select
          id={inputId}
          className={cn(
            'w-full appearance-none bg-off-white border text-sm font-body text-charcoal rounded-lg px-3 py-2.5 pr-9 transition-all duration-250',
            'focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent',
            error
              ? 'border-error focus:ring-error'
              : 'border-light-gray hover:border-forest-light',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-medium-gray pointer-events-none" />
      </div>
      {error && <p className="text-xs font-body text-error">{error}</p>}
      {helper && !error && (
        <p className="text-xs font-body text-medium-gray">{helper}</p>
      )}
    </div>
  );
};

export default Select;
