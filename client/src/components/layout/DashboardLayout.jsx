import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="mx-auto flex max-w-[90rem] gap-6 px-4 py-6 sm:px-6">
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        </div>
      </div>
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
