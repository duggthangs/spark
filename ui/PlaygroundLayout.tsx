import React from 'react';

interface SectionConfig {
  id: string;
  type: string;
  label?: string;
  [key: string]: any;
}

interface PlaygroundLayoutProps {
  sections: SectionConfig[];
  renderSection: (section: SectionConfig) => React.ReactNode;
  onBackToWizard: () => void;
}

export default function PlaygroundLayout({
  sections,
  renderSection,
  onBackToWizard
}: PlaygroundLayoutProps) {
  return (
    <div className="min-h-screen w-screen bg-slate-50 text-slate-900 overflow-y-auto">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Mode</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Playground</h1>
        </div>
        <button
          type="button"
          onClick={onBackToWizard}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
        >
          <span className="text-base leading-none">←</span>
          Back to Wizard
        </button>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <div
              key={section.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{section.type}</p>
                <h2 className="text-lg font-semibold text-slate-900">{section.label || section.id}</h2>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                {renderSection(section)}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
