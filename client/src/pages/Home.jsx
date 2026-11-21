import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Building2, Camera, Languages, Route, ScanSearch, Send } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { CATEGORIES } from '../constants';
import { getHealth } from '../api/complaints';

const steps = [
  { icon: Send, title: 'Report', text: 'Describe the problem and optionally upload a photograph.' },
  { icon: ScanSearch, title: 'Analyse', text: 'AI identifies the issue and its urgency.' },
  { icon: Route, title: 'Route', text: 'The complaint is sent to the appropriate department.' },
];

const features = [
  { icon: Languages, title: 'Any language', text: 'Write in English or your regional language — AI understands it directly.' },
  { icon: BrainCircuit, title: 'AI triage', text: 'Auto-classification and proportional severity with clear reasoning.' },
  { icon: Building2, title: 'Smart routing', text: 'Every ticket lands with the department responsible for fixing it.' },
];

export default function Home() {
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    getHealth().then(() => setApiStatus('online')).catch(() => setApiStatus('offline'));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      {/* Hero */}
      <section className="py-16 text-center sm:py-24">
        <Badge tone={apiStatus === 'online' ? 'green' : apiStatus === 'offline' ? 'red' : 'slate'} className="mb-6">
          <span className={`h-1.5 w-1.5 rounded-full ${apiStatus === 'online' ? 'bg-emerald-500' : apiStatus === 'offline' ? 'bg-red-500' : 'bg-sub'}`} />
          Civic API {apiStatus === 'checking' ? 'checking…' : apiStatus}
        </Badge>
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
          Your City. Your Voice. <span className="text-blue">Better Living.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-sub sm:text-lg">
          Report civic problems. Let AI help route them to the right department.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/submit"><Button size="lg" icon={Camera}>Report an Issue <ArrowRight className="h-4 w-4" /></Button></Link>
          <a href="#how-it-works"><Button size="lg" variant="secondary">How It Works</Button></a>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mt-4 grid gap-4 sm:grid-cols-3">
        {steps.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card card-hover p-6 text-center">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue/10">
              <Icon className="h-5 w-5 text-blue" />
            </div>
            <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
            <p className="mt-1.5 text-sm text-sub">{text}</p>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-ink">What can you report?</h2>
        <p className="mt-2 text-sub">Six civic categories, automatically detected by AI — in any language you write.</p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map(({ value, label, department }) => (
            <Link key={value} to={`/submit?category=${value}`} className="card card-hover group p-4 text-center">
              <p className="font-display text-sm font-semibold text-ink group-hover:text-blue">{label}</p>
              <p className="mt-1 text-[11px] leading-tight text-sub">{department}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-ink">Built for citizens and officers</h2>
        <p className="mt-2 max-w-2xl text-sub">
          Frictionless reporting for citizens. A prioritised, structured queue for municipal officers.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card card-hover p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan/10">
                <Icon className="h-5 w-5 text-cyan" />
              </div>
              <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-sub">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
