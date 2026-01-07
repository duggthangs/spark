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

  const handleCodeChange = (newCode: string) => {
    onChange?.({
      selectedId,
      code: {
        ...codeState,
        [selectedId]: newCode,
      },
    });
  };

  const handleReset = () => {
    const originalCode = data.options.find(o => o.id === selectedId)?.code || '';
    onChange?.({
      selectedId,
      code: {
        ...codeState,
        [selectedId]: originalCode,
      },
    });
  };

  const currentCode = codeState[selectedId] || '';
  const originalCode = data.options.find(o => o.id === selectedId)?.code || '';
  const isModified = currentCode !== originalCode;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <h2 className="text-3xl font-light text-slate-900 mb-2">{data.title}</h2>
      {data.description && (
        <p className="text-slate-500 mb-6">{data.description}</p>
      )}

      {/* Tab bar with radio buttons */}
      <div className="flex items-center gap-1 mb-4 p-1 bg-slate-100 rounded-xl">
        {data.options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const optCode = codeState[opt.id] || opt.code;
          const optModified = optCode !== opt.code;

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                isSelected
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {/* Radio indicator */}
              <span
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-slate-300'
                }`}
              >
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </span>
              <span>{opt.label}</span>
              {optModified && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Modified" />
              )}
            </button>
          );
        })}

        {/* Language badge */}
        {data.language && (
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 rounded-lg text-xs font-mono text-slate-600">
            <Code className="w-3.5 h-3.5" />
            {data.language}
          </div>
        )}
      </div>

      {/* Code editor */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
        {/* Editor header */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
          <span className="text-xs text-slate-400 font-mono">
            {data.options.find(o => o.id === selectedId)?.label || 'Code'}
          </span>
          <div className="flex items-center gap-2">
            {isModified && (
              <span className="text-xs text-amber-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Modified
              </span>
            )}
            <button
              onClick={handleReset}
              disabled={!isModified}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
                isModified
                  ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Reset to original"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Textarea editor */}
        <textarea
          value={currentCode}
          onChange={(e) => handleCodeChange(e.target.value)}
          spellCheck={false}
          className="w-full min-h-[300px] p-4 bg-slate-900 text-slate-100 font-mono text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-slate-600"
          placeholder="// Enter your code here..."
        />
      </div>

      {/* Helper text */}
      <p className="mt-3 text-xs text-slate-400">
        Select your preferred option and edit the code as needed. Your selection and edits will be saved.
      </p>
    </div>
  );
}
