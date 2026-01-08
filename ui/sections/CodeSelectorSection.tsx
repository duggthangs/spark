import React, { useEffect, useMemo } from 'react';
import { RotateCcw, Code } from 'lucide-react';

interface CodeOption {
  id: string;
  label: string;
  code: string;
}

interface CodeSelectorData {
  id: string;
  title?: string;
  description?: string;
  language?: string;
  options: CodeOption[];
}

interface CodeSelectorValue {
  selectedId: string;
  code: Record<string, string>;
}

interface Props {
  data: CodeSelectorData;
  value?: CodeSelectorValue;
  onChange?: (val: CodeSelectorValue) => void;
}

export default function CodeSelectorSection({ data, value, onChange }: Props) {
  // Initialize code state from options
  const initialCode = useMemo(() => {
    return data.options.reduce((acc, opt) => {
      acc[opt.id] = opt.code;
      return acc;
    }, {} as Record<string, string>);
  }, [data.options]);

  // Current state
  const selectedId = value?.selectedId || data.options[0]?.id || '';
  const codeState = value?.code || initialCode;

  // Initialize on mount
  useEffect(() => {
    const firstOption = data.options[0];
    if (!value && onChange && firstOption) {
      onChange({
        selectedId: firstOption.id,
        code: initialCode,
      });
    }
  }, [value, onChange, data.options, initialCode]);

  const handleSelect = (optionId: string) => {
    onChange?.({
      selectedId: optionId,
      code: codeState,
    });
  };

  const handleCodeChange = (optionId: string, newCode: string) => {
    // Typing implies selection
    onChange?.({
      selectedId: optionId,
      code: {
        ...codeState,
        [optionId]: newCode,
      },
    });
  };

  const handleReset = (optionId: string) => {
    const originalCode = data.options.find(o => o.id === optionId)?.code || '';
    onChange?.({
      selectedId: optionId,
      code: {
        ...codeState,
        [optionId]: originalCode,
      },
    });
  };

  // Determine grid columns: 2 for 2-3 options, 3 for 4-5 options
  const optionCount = data.options.length;
  const gridCols = optionCount <= 3 ? 'md:grid-cols-2' : 'md:grid-cols-3';

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <h2 className="text-3xl font-light text-slate-900 mb-2">{data.title}</h2>
        {data.description && (
          <p className="text-slate-500">{data.description}</p>
        )}
      </div>

      {/* Language badge */}
      {data.language && (
        <div className="max-w-2xl mx-auto mb-4 flex justify-end">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-mono text-slate-600">
            <Code className="w-3.5 h-3.5" />
            {data.language}
          </div>
        </div>
      )}

      {/* Card Grid */}
      <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
        {data.options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const optCode = codeState[opt.id] ?? opt.code;
          const originalCode = opt.code;
          const isModified = optCode !== originalCode;

          return (
            <div
              key={opt.id}
              onClick={() => !isSelected && handleSelect(opt.id)}
              className={`relative rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-white shadow-lg shadow-blue-500/10'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md cursor-pointer'
              }`}
            >
              {/* Card Header */}
              <div className={`flex items-center gap-3 px-4 py-3 border-b ${
                isSelected ? 'border-slate-200 bg-slate-50' : 'border-slate-100'
              }`}>
                {/* Radio indicator */}
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-slate-300'
                  }`}
                >
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-white" />
                  )}
                </span>

                <span className={`font-medium ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                  {opt.label}
                </span>

                {isModified && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Modified" />
                )}

                {/* Reset button - only show when selected and modified */}
                {isSelected && isModified && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset(opt.id);
                    }}
                    className="ml-auto flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Reset to original"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Card Body */}
              <div className="p-3">
                {isSelected ? (
                  /* Editable textarea when selected */
                  <textarea
                    value={optCode}
                    onChange={(e) => handleCodeChange(opt.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    spellCheck={false}
                    className="w-full h-48 p-3 bg-slate-900 text-slate-100 font-mono text-[10px] leading-relaxed rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                    placeholder="// Enter your code here..."
                  />
                ) : (
                  /* Read-only preview when not selected */
                  <div 
                    className="w-full h-48 p-3 bg-slate-50 text-slate-400 font-mono text-[10px] leading-relaxed rounded-lg border border-slate-200 overflow-hidden relative transition-all"
                  >
                    <pre className="whitespace-pre-wrap font-mono text-[10px]">{optCode}</pre>
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Helper text */}
      <p className="mt-4 text-xs text-slate-400 text-center">
        Click a card to select it and edit the code. Your selection and edits will be saved.
      </p>
    </div>
  );
}
