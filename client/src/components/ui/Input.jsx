import { useId } from 'react';

export default function Input({ label, error, icon: Icon, className = '', id, ...props }) {
  const inputId = id || useId();
  return (
    <div className={className}>
      {label && <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-black dark:text-ink">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sub" />}
        <input
          id={inputId}
          className={`field ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
          placeholder={props.placeholder}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
