export const CATEGORIES = [
  { value: 'Roads', label: 'Roads', department: 'Road Maintenance Department' },
  { value: 'Waste', label: 'Waste', department: 'Sanitation Department' },
  { value: 'Water', label: 'Water', department: 'Water Supply Department' },
  { value: 'Electricity', label: 'Electricity', department: 'Electrical Department' },
  { value: 'Trees', label: 'Trees', department: 'Tree Management Department' },
  { value: 'Drainage', label: 'Drainage', department: 'Drainage Department' },
];

export const SEVERITIES = [
  { value: 'Critical', label: 'Critical', rank: 0, description: 'Immediate threat to life, safety or critical infrastructure' },
  { value: 'High', label: 'High', rank: 1, description: 'Major service disruption or significant public hazard' },
  { value: 'Medium', label: 'Medium', rank: 2, description: 'Service degradation requiring timely attention' },
  { value: 'Low', label: 'Low', rank: 3, description: 'Minor issue, routine maintenance level' },
];

export const DEPARTMENTS = [...new Set(CATEGORIES.map((c) => c.department))];

export const severityMeta = (value) =>
  SEVERITIES.find((s) => s.value === value) || SEVERITIES[3];

export const categoryMeta = (value) =>
  CATEGORIES.find((c) => c.value === value) || null;

export const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';
