import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Home, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { categoryMeta, severityMeta, formatDateTime } from '../constants';

const SEVERITY_TONE = { Critical: 'red', High: 'amber', Medium: 'blue', Low: 'green' };

export default function SubmissionSuccess() {
  const { state } = useLocation();
  const complaint = state?.complaint;
  const duplicate = state?.duplicate;

  const underReview = complaint?.status === 'Under Review';
  const category = categoryMeta(complaint?.category);
  const severity = complaint?.severity ? severityMeta(complaint.severity) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="card p-8 text-center sm:p-12">
        <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${underReview ? 'bg-amber-500/15' : 'bg-emerald-500/15'}`}>
          {underReview ? <AlertCircle className="h-10 w-10 text-amber-500" /> : <CheckCircle2 className="h-10 w-10 text-emerald-500" />}
        </div>

        <h1 className="font-display text-3xl font-bold text-ink">
          {underReview ? 'Complaint received — under review' : 'Your complaint has been registered.'}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sub">
          {underReview
            ? 'Your complaint was logged but AI triage is currently unavailable. It has been queued for manual review by a municipal officer.'
            : 'Thank you. Your complaint has been analysed by AI, classified and routed to the responsible department.'}
        </p>
        {duplicate && (
          <p className="mx-auto mt-2 max-w-md text-xs text-amber-600 dark:text-amber-300">
            Note: an identical complaint was already submitted moments ago — this is the existing ticket.
          </p>
        )}

        {complaint && (
          <div className="card mt-8 p-5 text-left">
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-sub">Complaint ID</span>
              <span className="font-mono text-sm font-semibold text-blue">
                #{String(complaint._id || complaint.id || '').slice(-8).toUpperCase()}
              </span>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {category && <Badge tone="cyan">{category.label}</Badge>}
              {severity ? (
                <Badge tone={SEVERITY_TONE[severity.value] || 'slate'}>{severity.label} severity</Badge>
              ) : (
                <Badge tone="amber">Pending classification</Badge>
              )}
              {complaint.department && (
                <Badge tone="slate"><ShieldCheck className="h-3 w-3" /> {complaint.department}</Badge>
              )}
            </div>

            <p className="line-clamp-3 text-sm text-ink">{complaint.description}</p>

            {complaint.reason && (
              <div className="mt-4 rounded-xl border border-cyan/30 bg-cyan/5 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-cyan">Reason for severity</p>
                <p className="text-sm text-ink">{complaint.reason}</p>
                {typeof complaint.confidence === 'number' && (
                  <p className="mt-1.5 text-[11px] text-sub">AI confidence: {Math.round(complaint.confidence * 100)}%</p>
                )}
              </div>
            )}

            {underReview && complaint.reviewReason && (
              <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-700 dark:text-amber-200">
                Review note: {complaint.reviewReason}
              </p>
            )}

            <p className="mt-4 text-xs text-sub">
              Submitted {formatDateTime(complaint.createdAt)}
              {complaint.originalLanguage && complaint.originalLanguage !== 'en' && <> · detected language: {complaint.originalLanguage}</>}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/submit"><Button>Submit Another Complaint</Button></Link>
          <Link to="/"><Button variant="secondary" icon={Home}>Back to Home</Button></Link>
        </div>
      </div>
    </div>
  );
}
