import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 text-sub ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-blue" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
