import { AlertOctagon, AlertTriangle, Gauge, Layers } from 'lucide-react';

const CARDS = [
  { key: 'total', label: 'Total Complaints', icon: Layers, text: 'text-ink', ring: 'border-line' },
  { key: 'Critical', label: 'Critical', icon: AlertOctagon, text: 'text-red-600 dark:text-red-400', ring: 'border-red-500/30' },
  { key: 'High', label: 'High', icon: AlertTriangle, text: 'text-amber-600 dark:text-amber-400', ring: 'border-amber-500/30' },
  { key: 'MediumLow', label: 'Medium & Low', icon: Gauge, text: 'text-blue', ring: 'border-blue/30' },
];

export default function StatsCards({ stats, activeSeverity, onSeverityClick }) {
  const bySeverity = stats?.bySeverity || {};
  const total = stats?.total ?? 0;
  const mediumLow = (bySeverity.Medium || 0) + (bySeverity.Low || 0);

  const valueFor = (key) => (key === 'total' ? total : key === 'MediumLow' ? mediumLow : bySeverity[key] || 0);
  const severityKey = (key) => (key === 'MediumLow' ? null : key);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {CARDS.map(({ key, label, icon: Icon, text, ring }) => {
        const sev = severityKey(key);
        const active = sev && activeSeverity === sev;
        return (
          <button
            key={key}
            onClick={() => sev && onSeverityClick?.(sev)}
            disabled={!sev}
            className={`card p-4 text-left transition ${ring} ${sev ? 'card-hover cursor-pointer' : ''} ${active ? 'ring-2 ring-blue/50' : ''}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-sub">{label}</p>
              <Icon className={`h-4 w-4 ${text}`} />
            </div>
            <p className={`mt-1 font-display text-2xl font-bold ${text}`}>{valueFor(key)}</p>
          </button>
        );
      })}
    </div>
  );
}
