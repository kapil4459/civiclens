import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'Nothing here yet', message, icon: Icon = Inbox, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line px-6 py-14 text-center ${className}`}>
      <div className="rounded-full bg-blue/10 p-4">
        <Icon className="h-7 w-7 text-blue" />
      </div>
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      {message && <p className="max-w-sm text-sm text-sub">{message}</p>}
      {action}
    </div>
  );
}
