const TONES = {
  blue: 'bg-blue/10 text-blue border-blue/30',
  cyan: 'bg-cyan/10 text-cyan border-cyan/30',
  red: 'bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-300',
  amber: 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-300',
  green: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-300',
  slate: 'bg-card2 text-sub border-line',
};

export default function Badge({ tone = 'slate', className = '', children }) {
  return <span className={`chip ${TONES[tone] || TONES.slate} ${className}`}>{children}</span>;
}
