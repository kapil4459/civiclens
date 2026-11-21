import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import Badge from '../ui/Badge';
import ComplaintCard from '../ComplaintCard';
import { categoryMeta, severityMeta, formatDateTime } from '../../constants';

const SEVERITY_TONE = { Critical: 'red', High: 'amber', Medium: 'blue', Low: 'green' };
const STATUS_TONE = { Pending: 'blue', 'In Progress': 'amber', Resolved: 'green', 'Under Review': 'slate' };

const shortId = (c) => `#${String(c._id || c.id || '').slice(-6).toUpperCase()}`;

function TicketRow({ complaint }) {
  const navigate = useNavigate();
  const category = categoryMeta(complaint.category);
  const severity = complaint.severity ? severityMeta(complaint.severity) : null;

  return (
    <tr onClick={() => navigate(`/complaints/${complaint._id || complaint.id}`)} className="cursor-pointer border-b border-line transition hover:bg-card2/60">
      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-blue">{shortId(complaint)}</td>
      <td className="max-w-[16rem] px-4 py-3">
        <p className="line-clamp-2 text-sm text-ink">{complaint.description}</p>
        {complaint.location && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-cyan">
            <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{complaint.location}</span>
          </p>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        {category ? <Badge tone="cyan">{category.label}</Badge> : <span className="text-xs text-sub">—</span>}
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        {severity ? <Badge tone={SEVERITY_TONE[severity.value] || 'slate'}>{severity.label}</Badge> : <Badge tone="slate">Unclassified</Badge>}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-xs text-sub">{complaint.department || '—'}</td>
      <td className="whitespace-nowrap px-4 py-3 text-xs text-sub">{formatDateTime(complaint.createdAt)}</td>
      <td className="whitespace-nowrap px-4 py-3">
        <Badge tone={STATUS_TONE[complaint.status] || 'slate'}>{complaint.status || 'Pending'}</Badge>
      </td>
    </tr>
  );
}

export default function TicketTable({ complaints }) {
  return (
    <>
      <div className="card hidden overflow-x-auto md:block">
        <table className="w-full min-w-[60rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-sub">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Severity</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => <TicketRow key={c._id || c.id} complaint={c} />)}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {complaints.map((c) => <ComplaintCard key={c._id || c.id} complaint={{ ...c, id: c._id || c.id }} compact />)}
      </div>
    </>
  );
}
