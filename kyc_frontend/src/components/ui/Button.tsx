import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-lime text-forest font-semibold hover:bg-lime-bright active:opacity-90 disabled:opacity-50',
  secondary:
    'bg-forest text-off-white font-medium hover:bg-forest-mid active:opacity-90 disabled:opacity-50',
  ghost:
    'bg-transparent text-forest border border-forest-light font-medium hover:bg-mint-surface active:opacity-90 disabled:opacity-50',
  danger:
    'bg-error text-white font-medium hover:opacity-90 active:opacity-80 disabled:opacity-50',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}) => (
  <button
    className={cn(
      'inline-flex items-center justify-center font-body transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 disabled:cursor-not-allowed',
      variantStyles[variant],
      sizeStyles[size],
      className
    )}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : leftIcon ? (
      leftIcon
    ) : null}
    {children}
    {!loading && rightIcon}
  </button>
);

export default Button;
