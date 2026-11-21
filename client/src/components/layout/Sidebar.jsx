import { Link, NavLink, useLocation } from 'react-router-dom';
import { Camera, ChevronsLeft, ChevronsRight, ClipboardList, Gauge, Home, LayoutGrid, Send } from 'lucide-react';

const items = [
  { to: '/dashboard', label: 'Overview', icon: Home, isActive: (params, hash) => !params.toString() && !hash },
  { to: '/dashboard#complaints', label: 'All Complaints', icon: ClipboardList, isActive: (params, hash) => hash === '#complaints' },
  { to: '/dashboard?severity=Critical', label: 'Critical Issues', icon: Gauge, isActive: (params) => params.get('severity') === 'Critical' },
  { to: '/dashboard?view=departments', label: 'Department Categories', icon: LayoutGrid, isActive: (params) => params.get('view') === 'departments' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const onDashboard = location.pathname === '/dashboard';

  return (
    <aside className={`card flex h-full flex-col p-4 transition-all duration-300 ${collapsed ? 'w-[4.5rem]' : 'w-60'}`}>
      <div className={`mb-6 flex items-center ${collapsed ? 'justify-center' : 'gap-2.5 px-2'}`}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue text-white">
          <Camera className="h-4 w-4" />
        </span>
        {!collapsed && (
          <span className="font-display text-base font-bold text-ink">
            Civic<span className="text-cyan">Lens</span>
          </span>
        )}
      </div>

      <nav className="flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon, isActive }) => {
          const active = onDashboard && isActive(params, location.hash);
          return (
            <Link
              key={label}
              to={to}
              state={{ fromSidebar: true }}
              title={collapsed ? label : undefined}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                collapsed ? 'justify-center' : ''
              } ${active ? 'bg-blue/10 text-blue' : 'text-sub hover:bg-card2 hover:text-ink'}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-line pt-4">
        <NavLink
          to="/submit"
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sub transition hover:bg-card2 hover:text-ink ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'New Complaint' : undefined}
        >
          <Send className="h-4 w-4 shrink-0" />
          {!collapsed && 'New Complaint'}
        </NavLink>
        <button
          onClick={onToggle}
          className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sub transition hover:bg-card2 hover:text-ink ${collapsed ? 'justify-center' : ''}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </aside>
  );
}
