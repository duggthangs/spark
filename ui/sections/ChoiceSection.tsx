import React, { useEffect } from 'react';

export default function ChoiceSection({ data, value, onChange }: { data: any, value: any, onChange: (val: any) => void }) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];

  useEffect(() => {
    if (!value && data.options?.[0]) {
      // Don't auto-select for multi-select, but for single select maybe?
      // Let's stay neutral and not auto-select unless user clicks.
    }
  }, []);

  const toggle = (id: string) => {
    if (data.multiSelect) {
      if (selected.includes(id)) {
        onChange(selected.filter(i => i !== id));
      } else {
        onChange([...selected, id]);
      }
    } else {
      onChange(id);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-light text-slate-900 mb-2">{data.title}</h2>
      {data.description && <p className="text-slate-500 mb-8">{data.description}</p>}
      
      <div className="space-y-3">
        {data.options.map((opt: any) => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-50' 
                  : 'border-slate-100 hover:border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                  {opt.label}
                </span>
                {isSelected && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
