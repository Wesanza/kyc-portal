import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

interface AlertConfig {
  icon: React.ElementType;
  wrapper: string;
  iconCls: string;
}

const config: Record<AlertVariant, AlertConfig> = {
  info: {
    icon: Info,
    wrapper: 'bg-blue-50 border-blue-200 text-blue-800',
    iconCls: 'text-blue-500',
  },
  success: {
    icon: CheckCircle2,
    wrapper: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    iconCls: 'text-emerald-500',
  },
  warning: {
    icon: AlertTriangle,
    wrapper: 'bg-amber-50 border-amber-200 text-amber-800',
    iconCls: 'text-amber-500',
  },
  error: {
    icon: AlertCircle,
    wrapper: 'bg-red-50 border-red-200 text-red-800',
    iconCls: 'text-red-500',
  },
};

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onDismiss,
  className,
}) => {
  const { icon: Icon, wrapper, iconCls } = config[variant];

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-xl border animate-fade-in',
        wrapper,
        className
      )}
      role="alert"
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconCls)} />
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-semibold mb-1">{title}</p>
        )}
        <div className="text-sm">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;