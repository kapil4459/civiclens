import { useId } from 'react';

export default function Textarea({ label, error, className = '', id, rows = 5, placeholder, ...props }) {
  const inputId = id || useId();
  return (
    <div className={className}>
      {label && <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-black dark:text-ink">{label}</label>}
      <textarea
        id={inputId}
        rows={rows}
        className={`field resize-y ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
        placeholder={placeholder}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
