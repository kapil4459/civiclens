import { Link } from 'react-router-dom';
import { ArrowRight, ImageOff, MapPin } from 'lucide-react';
import Badge from './ui/Badge';
import { resolveFileUrl } from '../api/client';
import { categoryMeta, severityMeta, formatDateTime } from '../constants';

const SEVERITY_TONE = { Critical: 'red', High: 'amber', Medium: 'blue', Low: 'green' };

export default function ComplaintCard({ complaint, compact = false }) {
  const category = categoryMeta(complaint.category);
  const severity = complaint.severity ? severityMeta(complaint.severity) : null;
  const imageUrl = resolveFileUrl(complaint.imageUrl);

  return (
    <Link to={`/complaints/${complaint._id || complaint.id}`} className="card card-hover group block p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge tone={severity ? SEVERITY_TONE[severity.value] || 'slate' : 'slate'}>
              {severity ? severity.label : 'Unclassified'}
            </Badge>
            {category && <Badge tone="cyan">{category.label}</Badge>}
            {complaint.status === 'Under Review' && <Badge tone="amber">Under Review</Badge>}
          </div>
          <p className={`text-ink ${compact ? 'line-clamp-2 text-sm' : 'line-clamp-3'}`}>{complaint.description}</p>
          <p className="mt-2 truncate text-xs text-sub">
            {complaint.department || category?.department || 'Unassigned'} · {formatDateTime(complaint.createdAt)}
          </p>
          {complaint.location && (
            <p className="mt-1 flex items-center gap-1 truncate text-xs text-cyan">
              <MapPin className="h-3 w-3 shrink-0" /> {complaint.location}
            </p>
          )}
        </div>
        {imageUrl ? (
          <img src={imageUrl} alt="Complaint attachment" className="h-16 w-16 shrink-0 rounded-xl border border-line object-cover" loading="lazy" />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-line bg-card2">
            <ImageOff className="h-5 w-5 text-sub" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-end text-xs font-medium text-blue opacity-0 transition group-hover:opacity-100">
        View details <ArrowRight className="ml-1 h-3.5 w-3.5" />
      </div>
    </Link>
  );
}
