import React, { useEffect, useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import type { ChoiceSection as ChoiceSectionType } from '../../engine/schema';

interface ChoiceOption {
  id: string;
  label: string;
  selected?: boolean;
}

export default function ChoiceSection({ data, value, onChange }: { data: ChoiceSectionType, value?: any, onChange?: (val: any) => void }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  // Normalize value: support both legacy formats and new ChoiceOption[] format
  const normalizeOptions = (): ChoiceOption[] => {
    // New format: array of objects with selected flag
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && 'id' in value[0]) {
      return value as ChoiceOption[];
    }

    // Legacy format: string (single) or string[] (multi) - just selected IDs
    // Build options from data.options and mark selected
    const selectedIds: string[] = Array.isArray(value) ? value : value ? [value] : [];
    return (data.options || []).map(opt => ({
      id: opt.id,
      label: opt.label,
      selected: selectedIds.includes(opt.id),
    }));
  };

  const options: ChoiceOption[] = normalizeOptions();
  const selected = options.filter(opt => opt.selected);

  // Guard for onChange
  const safeOnChange = (val: ChoiceOption[]) => onChange?.(val);

  useEffect(() => {
    // Initialize with data.options if no value
    if (!value && data.options) {
      safeOnChange(data.options.map(opt => ({
        id: opt.id,
        label: opt.label,
        selected: false,
      })));
    }
  }, []);

  const toggle = (id: string) => {
    if (data.multiSelect) {
      // Multi-select: toggle the clicked option
      safeOnChange(options.map(opt => 
        opt.id === id ? { ...opt, selected: !opt.selected } : opt
      ));
    } else {
      // Single-select: select only the clicked option
      safeOnChange(options.map(opt => ({
        ...opt,
        selected: opt.id === id,
      })));
    }
  };

  // Add a new option
  const handleAdd = () => {
    if (!newLabel.trim()) return;
    const newOption: ChoiceOption = {
      id: `custom-${Date.now()}`,
      label: newLabel.trim(),
      selected: false,
    };
    safeOnChange([...options, newOption]);
    setNewLabel('');
    setShowAddForm(false);
  };

  // Delete an option
  const handleDelete = (id: string) => {
    safeOnChange(options.filter(opt => opt.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-light text-slate-900 mb-2">{data.title}</h2>
      {data.description && <p className="text-slate-500 mb-8">{data.description}</p>}
      
      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = opt.selected;
          return (
            <div key={opt.id} className="relative group">
              <button
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
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </button>
              {/* Delete button - positioned on the right, appears on hover */}
              <button
                onClick={() => handleDelete(opt.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                title="Delete option"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}

        {/* Add Option Form */}
        {showAddForm ? (
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Option Label
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g., New option"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd();
                    if (e.key === 'Escape') {
                      setShowAddForm(false);
                      setNewLabel('');
                    }
                  }}
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleAdd}
                  disabled={!newLabel.trim()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    newLabel.trim()
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewLabel('');
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-slate-600 hover:bg-slate-100 transition-all"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-300 text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Option
          </button>
        )}
      </div>
    </div>
  );
}
