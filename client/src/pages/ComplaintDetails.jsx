import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, CalendarClock, FileText, Image as ImageIcon, MapPin } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ErrorState from '../components/ui/ErrorState';
import LoadingState from '../components/ui/LoadingState';
import { getComplaint } from '../api/complaints';
import { resolveFileUrl } from '../api/client';
import { categoryMeta, severityMeta, formatDateTime } from '../constants';

const SEVERITY_TONE = { Critical: 'red', High: 'amber', Medium: 'blue', Low: 'green' };
const STATUS_TONE = { Pending: 'blue', 'In Progress': 'amber', Resolved: 'green', 'Under Review': 'amber' };

export default function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getComplaint(id)
      .then(({ data }) => setComplaint(data?.data || data))
      .catch((err) => setError(err.message || 'Failed to load complaint.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState message="Loading complaint details…" />;
  if (error) return <ErrorState message={error} />;
  if (!complaint) return <ErrorState message="Complaint not found." />;

  const category = categoryMeta(complaint.category);
  const severity = complaint.severity ? severityMeta(complaint.severity) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-sub transition hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="card p-6 sm:p-8">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {severity && <Badge tone={SEVERITY_TONE[severity.value] || 'slate'} className="px-3 py-1 text-sm">{severity.label} severity</Badge>}
          {category && <Badge tone="cyan" className="px-3 py-1 text-sm">{category.label}</Badge>}
          <Badge tone="slate" className="px-3 py-1 text-sm"><Building2 className="h-3 w-3" /> {complaint.department || category?.department || 'Unassigned'}</Badge>
          <Badge tone={STATUS_TONE[complaint.status] || 'slate'} className="px-3 py-1 text-sm">{complaint.status || 'Pending'}</Badge>
        </div>

        <h1 className="font-display text-xl font-bold text-ink">Complaint #{complaint.id || complaint._id}</h1>
        {complaint.location && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-cyan"><MapPin className="h-4 w-4" /> {complaint.location}</p>
        )}
        <p className="mt-3 whitespace-pre-wrap text-ink">{complaint.description}</p>

        {(complaint.reason || complaint.reasoning) && (
          <div className="mt-5 rounded-xl border border-cyan/30 bg-cyan/5 p-4">
            <div className="mb-1 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-cyan">
                <FileText className="h-3.5 w-3.5" /> AI severity assessment
              </p>
              {typeof complaint.confidence === 'number' && (
                <span className="text-[11px] text-sub">confidence {Math.round(complaint.confidence * 100)}%</span>
              )}
            </div>
            <p className="text-sm text-ink">{complaint.reason || complaint.reasoning}</p>
          </div>
        )}

        {complaint.reviewReason && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-300">Review information</p>
            <p className="text-sm text-amber-700 dark:text-amber-200">{complaint.reviewReason}</p>
          </div>
        )}

        {complaint.imageUrl && (
          <div className="mt-6">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-sub">
              <ImageIcon className="h-3.5 w-3.5" /> Attached photo
            </p>
            <img src={resolveFileUrl(complaint.imageUrl)} alt="Complaint attachment" className="max-h-96 rounded-xl border border-line object-cover" />
          </div>
        )}

        <div className="mt-6 flex items-center gap-1.5 border-t border-line pt-5 text-xs text-sub">
          <CalendarClock className="h-3.5 w-3.5" />
          Submitted {formatDateTime(complaint.createdAt)}
          {complaint.originalLanguage && complaint.originalLanguage !== 'en' && <> · language: {complaint.originalLanguage}</>}
        </div>
      </div>

      <div className="flex justify-end">
        <Link to="/submit"><Button variant="secondary" size="sm">Report another issue</Button></Link>
      </div>
    </div>
  );
}
