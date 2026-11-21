import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Filter, RefreshCw, Search, X } from 'lucide-react';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import LoadingState from '../components/ui/LoadingState';
import StatsCards from '../components/dashboard/StatsCards';
import TicketTable from '../components/dashboard/TicketTable';
import Badge from '../components/ui/Badge';
import { getComplaints, getComplaintStats } from '../api/complaints';
import { CATEGORIES, DEPARTMENTS, SEVERITIES, categoryMeta } from '../constants';

export default function OfficerDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const severityFilter = searchParams.get('severity') || '';
  const categoryFilter = searchParams.get('category') || '';
  const departmentFilter = searchParams.get('department') || '';
  const statusFilter = searchParams.get('status') || '';
  const deptView = searchParams.get('view') === 'departments';

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const params = { limit: 100 };
      if (severityFilter) params.severity = severityFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (departmentFilter) params.department = departmentFilter;
      if (statusFilter) params.status = statusFilter;
      if (debouncedSearch) params.q = debouncedSearch;

      const [listRes, statsRes] = await Promise.all([getComplaints(params), getComplaintStats()]);
      setComplaints(listRes.data?.data || []);
      setStats(statsRes.data?.data || null);
    } catch (err) {
      setError(err.message || 'Failed to load complaints.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [severityFilter, categoryFilter, departmentFilter, statusFilter, debouncedSearch]);

  const hasFilters = severityFilter || categoryFilter || departmentFilter || statusFilter || debouncedSearch;
  const clearFilters = () => { setSearch(''); setSearchParams({}, { replace: true }); };
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Municipal Overview</h1>
          <p className="mt-1 text-sm text-sub">Monitor, review and prioritise citizen complaints · {today}</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="secondary" size="sm" icon={RefreshCw} loading={refreshing} onClick={() => fetchData(true)}>
            Refresh
          </Button>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-3.5 py-2 text-sm text-sub">
            <Building2 className="h-4 w-4 text-blue" />
            {stats?.total ?? complaints.length} ticket{(stats?.total ?? complaints.length) === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* Stats — 4 cards: Total / Critical / High / Medium & Low */}
      <StatsCards stats={stats} activeSeverity={severityFilter} onSeverityClick={(s) => setFilter('severity', severityFilter === s ? '' : s)} />

      {/* Department categories view */}
      {deptView && stats?.byCategory && (
        <div className="card p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-ink">Complaints by category</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => { setFilter('category', c.value); setFilter('view', ''); }}
                className="rounded-xl border border-line bg-card2/50 p-4 text-center transition hover:border-blue/40"
              >
                <p className="font-display text-lg font-bold text-ink">{stats.byCategory[c.value] || 0}</p>
                <p className="mt-0.5 text-xs font-medium text-sub">{c.label}</p>
                <p className="mt-0.5 truncate text-[10px] text-sub/70">{c.department}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sub" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search complaints or ticket ID…" className="field pl-10" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-sub" />
            <select value={severityFilter} onChange={(e) => setFilter('severity', e.target.value)} className="field w-auto py-2 text-sm">
              <option value="">All severities</option>
              {SEVERITIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select value={categoryFilter} onChange={(e) => setFilter('category', e.target.value)} className="field w-auto py-2 text-sm">
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select value={departmentFilter} onChange={(e) => setFilter('department', e.target.value)} className="field w-auto py-2 text-sm">
              <option value="">All departments</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setFilter('status', e.target.value)} className="field w-auto py-2 text-sm">
              <option value="">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Under Review">Under Review</option>
            </select>
            {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters} icon={X}>Clear</Button>}
          </div>
        </div>
      </div>

      {/* Tickets — backend order Critical → Low preserved */}
      {loading ? (
        <LoadingState message="Loading complaint queue…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchData()} />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="Queue is clear"
          message={hasFilters ? 'No complaints match the current filters.' : 'No complaints yet. Citizen reports will appear here, priority-sorted by AI severity.'}
          action={hasFilters ? <Button variant="secondary" size="sm" onClick={clearFilters}>Reset filters</Button> : undefined}
        />
      ) : (
        <TicketTable complaints={complaints} />
      )}

      <p className="text-xs text-sub">
        Showing {complaints.length} of {stats?.total ?? complaints.length} tickets · sorted Critical → High → Medium → Low · click a row for details
      </p>
    </div>
  );
}
