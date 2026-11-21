import { Link, NavLink } from 'react-router-dom';
import { Camera, PlusCircle } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue text-white">
            <Camera className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            Civic<span className="text-cyan">Lens</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-blue/10 text-blue' : 'text-sub hover:bg-card2 hover:text-ink'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/submit">
            <button className="hidden items-center gap-1.5 rounded-xl bg-blue px-4 py-2 text-sm font-medium text-white transition hover:bg-blue/90 sm:inline-flex">
              <PlusCircle className="h-4 w-4" /> Report a Problem
            </button>
          </Link>
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t border-line px-4 py-2 md:hidden">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                isActive ? 'bg-blue/10 text-blue' : 'text-sub hover:text-ink'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
        <Link to="/submit" className="ml-auto whitespace-nowrap rounded-lg bg-blue px-3 py-1.5 text-sm font-medium text-white">
          Report
        </Link>
      </nav>
    </header>
  );
}
