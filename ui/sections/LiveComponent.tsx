import React, { useEffect } from 'react';
import { Settings, Code, Eye } from 'lucide-react';
import type { LiveComponentSection as LiveComponentSectionType } from '../../engine/schema';

export default function LiveComponent({ data, value, onChange }: { data: LiveComponentSectionType, value?: any, onChange?: (val: any) => void }) {
  const defaultClasses = React.useMemo(() => ['bg-blue-500', 'text-white', 'p-6', 'rounded-xl'], []);
  const defaultCode = React.useMemo(() => data.defaultCode || `<div className="flex flex-col items-center">
  <h1 className="text-2xl font-bold">Hello World</h1>
  <p className="mt-2 opacity-90">Edit my classes!</p>
</div>`, [data.defaultCode]);

  // Derive UI state from schema-ready string value
  const { activeClasses, customCode } = React.useMemo(() => {
    if (typeof value !== 'string') return { activeClasses: defaultClasses, customCode: defaultCode };
    
    // Robust parsing for quotes and whitespace
    const classMatch = value.match(/className=["']([^"']+)["']/);
    const codeMatch = value.match(/>\s*([\s\S]*?)\s*<\/div>\s*$/);
    
    return {
      activeClasses: (classMatch && classMatch[1]) ? classMatch[1].split(' ') : defaultClasses,
      customCode: (codeMatch && codeMatch[1]) ? codeMatch[1].trim() : defaultCode
    };
  }, [value, defaultClasses, defaultCode]);

  // Report initial state if not present
  useEffect(() => {
    if (!value && onChange) {
      const initialValue = `<div className="${defaultClasses.join(' ')}">\n  ${defaultCode}\n</div>`;
      onChange(initialValue);
    }
  }, [value, onChange, defaultClasses, defaultCode]);

  const updateState = (newClasses: string[], newCode: string) => {
    const schemaReadyValue = `<div className="${newClasses.join(' ')}">\n  ${newCode}\n</div>`;
    onChange?.(schemaReadyValue);
  };

  const toggleClass = (cls: string) => {
    const newClasses = activeClasses.includes(cls) 
      ? activeClasses.filter((c: string) => c !== cls) 
      : [...activeClasses, cls];
    updateState(newClasses, customCode);
  };

  const availableClasses = [
    { category: 'Background', classes: ['bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-slate-800'] },
    { category: 'Padding', classes: ['p-2', 'p-6', 'p-12'] },
    { category: 'Radius', classes: ['rounded-none', 'rounded-xl', 'rounded-full'] },
    { category: 'Shadow', classes: ['shadow-none', 'shadow-lg', 'shadow-2xl'] },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
      {/* Controls Panel */}
      <div className="flex flex-col gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <Settings className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Properties</h3>
        </div>

        <div className="space-y-6">
          {availableClasses.map((group) => (
            <div key={group.category}>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 block">
                {group.category}
              </label>
              <div className="flex flex-wrap gap-2">
                {group.classes.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => toggleClass(cls)}
                    className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-all ${
                      activeClasses.includes(cls)
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    .{cls}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100">
           <div className="flex items-center gap-2 mb-2">
            <Code className="w-4 h-4 text-slate-500" />
            <h4 className="text-sm font-medium text-slate-700">Source</h4>
           </div>
           <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-blue-300 overflow-x-auto">
             {`<div className="${activeClasses.join(' ')}">...</div>`}
           </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="flex flex-col gap-4">
        <div className="bg-slate-100 rounded-2xl border border-slate-200 flex-1 flex items-center justify-center relative overflow-hidden pattern-grid-lg text-slate-900/5">
           <div className="absolute inset-0 flex items-center justify-center p-8">
              {/* The Live Component */}
              <div className={`transition-all duration-300 ease-in-out ${activeClasses.join(' ')}`}>
                 <div className="flex flex-col items-center text-center">
                    <Eye className="w-8 h-8 mb-3 opacity-80" />
                    <h2 className="text-xl font-bold">Preview Target</h2>
                    <p className="text-sm opacity-75 mt-1 max-w-[200px]">
                      Toggle the classes on the left to see me change instantly.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
