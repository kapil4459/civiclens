import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-blue text-black dark:text-white hover:bg-blue/90 shadow-sm',
  secondary: 'bg-card2 text-ink border border-line hover:border-blue/40',
  ghost: 'text-sub hover:text-ink hover:bg-card2',
  danger: 'bg-red-600 text-white hover:bg-red-500',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3 text-base rounded-xl',
};

export default function Button({ variant = 'primary', size = 'md', loading = false, disabled = false, icon: Icon, className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}
