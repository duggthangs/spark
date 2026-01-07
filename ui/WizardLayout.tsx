import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Inline utility
function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

interface WizardLayoutProps {
  currentStep: number;
  totalSteps: number;
  title?: string;
  subtitle?: string;
  onNext?: () => void;
  onBack?: () => void;
  canGoNext?: boolean;
  canGoBack?: boolean;
  isNextDisabled?: boolean;
  nextLabel?: string;
  showDevToolsToggle?: boolean;
  onOpenPlayground?: () => void;
  children: React.ReactNode;
}

export default function WizardLayout({
  currentStep,
  totalSteps,
  title,
  subtitle,
  onNext,
  onBack,
  canGoNext = true,
  canGoBack = true,
  isNextDisabled = false,
  nextLabel = 'Next',
  showDevToolsToggle = false,
  onOpenPlayground,
  children
}: WizardLayoutProps) {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Top Progress Bar */}
      <div className="w-full h-1 bg-slate-200 shrink-0">
        <div 
          className="h-full bg-blue-600 transition-all duration-500 ease-out" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Header (Minimal) */}
      <header className="px-8 py-6 shrink-0 flex justify-between items-center max-w-5xl mx-auto w-full">
        <div>
          {title && <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>}
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Step {currentStep + 1} of {totalSteps}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-auto relative w-full">
        <div className="px-6 py-8 min-h-full flex flex-col justify-center">
            {children}
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="shrink-0 bg-white border-t border-slate-100 px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              disabled={!canGoBack}
              className={classNames(
                "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-colors",
                !canGoBack 
                  ? "text-slate-300 cursor-not-allowed" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {showDevToolsToggle && (
              <button
                type="button"
                onClick={onOpenPlayground}
                disabled={!onOpenPlayground}
                className={classNames(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full border border-dashed text-xs font-medium transition-colors",
                  !onOpenPlayground
                    ? "text-slate-300 border-slate-100 cursor-not-allowed"
                    : "text-slate-500 border-slate-200 hover:text-slate-900 hover:border-slate-400"
                )}
                aria-label="Open playground mode"
              >
                <span className="text-base leading-none">🛠️</span>
                Dev Tools
              </button>
            )}
          </div>

          <button
            onClick={onNext}
            disabled={!canGoNext || isNextDisabled}
            className={classNames(
              "flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium transition-all shadow-sm",
              !canGoNext || isNextDisabled
                ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md active:scale-95"
            )}
          >
            {nextLabel}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
