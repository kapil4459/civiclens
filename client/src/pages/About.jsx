import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Camera, Route, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-ink">About CivicLens</h1>
      <p className="mt-4 leading-relaxed text-sub">
        CivicLens is an AI-powered civic complaint management platform. Citizens describe problems in any
        language — with or without a photo — and our AI understands the issue, classifies it, assesses how
        urgent it is, and routes a structured ticket to the municipal department responsible for fixing it.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {[
          { icon: Camera, title: 'Report', text: 'Free-text complaints in English or regional languages, optional photo evidence.' },
          { icon: BrainCircuit, title: 'Analyse', text: 'Gemini AI classifies into 6 categories and scores severity Critical → Low with reasoning.' },
          { icon: Route, title: 'Route', text: 'Deterministic category-to-department mapping — no guesswork.' },
          { icon: ShieldCheck, title: 'Track', text: 'Officers get a priority-sorted dashboard; citizens get a ticket ID instantly.' },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="card p-5">
            <Icon className="mb-3 h-5 w-5 text-blue" />
            <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
            <p className="mt-1 text-sm text-sub">{text}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-sub">
        Built with React, Express, MongoDB Atlas and the Google Gemini API.
      </p>
      <Link to="/submit" className="mt-6 inline-block">
        <Button icon={ArrowRight}>Report an Issue</Button>
      </Link>
    </div>
  );
}
