import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Trash2, X } from 'lucide-react';

interface NumericInputItem {
  id: string;
  label: string;
  max?: number;
  value?: number;
}

interface NumericInputsData {
  id: string;
  title?: string;
  description?: string;
  items: Array<{ id: string; label: string; max?: number }>;
}

interface Props {
  data: NumericInputsData;
  value?: NumericInputItem[];
  onChange?: (val: NumericInputItem[]) => void;
}

// Regex to validate numeric input (allows empty, integers, decimals)
const NUMERIC_REGEX = /^-?\d*\.?\d*$/;

export default function NumericInputsSection({ data, value, onChange }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newMax, setNewMax] = useState('');
  
  // Track display values as strings for better UX (allows empty input)
  const [displayValues, setDisplayValues] = useState<Record<string, string>>({});

  // Normalize value: support both legacy format and new array format
  const normalizeItems = (): NumericInputItem[] => {
    // New format: array of objects with value inline
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && 'id' in value[0]) {
      return value as NumericInputItem[];
    }

    // Legacy format: { __items__: [...], itemId: number }
    if (value && typeof value === 'object' && '__items__' in (value as any)) {
      const legacyValue = value as any;
      const items = legacyValue.__items__ || [];
      return items.map((item: any) => ({
        id: item.id,
        label: item.label,
        max: item.max,
        value: typeof legacyValue[item.id] === 'number' ? legacyValue[item.id] : 0,
      }));
    }

    // No value yet - return empty
    return [];
  };

  const items: NumericInputItem[] = normalizeItems();

  // Guard for onChange
  const safeOnChange = (val: NumericInputItem[]) => onChange?.(val);

  // Initialize on mount
  useEffect(() => {
    if (!value && data.items) {
      const initialItems = data.items.map(item => ({
        id: item.id,
        label: item.label,
        max: item.max,
        value: 0,
      }));
      const initialDisplay: Record<string, string> = {};
      initialItems.forEach(item => {
        initialDisplay[item.id] = '';
      });
      setDisplayValues(initialDisplay);
      safeOnChange(initialItems);
    }
  }, []);

  // Sync display values when items change (e.g., after add)
  useEffect(() => {
    setDisplayValues(prev => {
      const updated = { ...prev };
      items.forEach(item => {
        if (!(item.id in updated)) {
          updated[item.id] = '';
        }
      });
      return updated;
    });
  }, [items.length]);

  // Get numeric value for an item
  const getValue = (itemId: string): number => {
    const item = items.find(i => i.id === itemId);
    return item?.value ?? 0;
  };

  // Get display value (string) for an item
  const getDisplayValue = (itemId: string): string => {
    return displayValues[itemId] ?? '';
  };

  // Handle input change - validate and update
  const handleInputChange = (itemId: string, inputValue: string) => {
    // Allow empty or valid numeric input
    if (inputValue === '' || NUMERIC_REGEX.test(inputValue)) {
      setDisplayValues(prev => ({ ...prev, [itemId]: inputValue }));
      
      // Convert to number for the actual value (empty = 0)
      const numValue = inputValue === '' ? 0 : parseFloat(inputValue) || 0;
      safeOnChange(items.map(item => 
        item.id === itemId ? { ...item, value: numValue } : item
      ));
    }
  };

  // Delete an item
  const handleDelete = (itemId: string) => {
    setDisplayValues(prev => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
    safeOnChange(items.filter(item => item.id !== itemId));
  };

  // Add a new item
  const handleAdd = () => {
    if (!newLabel.trim()) return;

    const newItem: NumericInputItem = {
      id: `custom-${Date.now()}`,
      label: newLabel.trim(),
      max: newMax ? parseFloat(newMax) : undefined,
      value: 0,
    };

    setDisplayValues(prev => ({ ...prev, [newItem.id]: '' }));
    safeOnChange([...items, newItem]);
    setNewLabel('');
    setNewMax('');
    setShowAddForm(false);
  };

  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.value ?? 0), 0);

  // Format number with locale separators
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <h2 className="text-3xl font-light text-slate-900 mb-2">{data.title}</h2>
      {data.description && (
        <p className="text-slate-500 mb-6">{data.description}</p>
      )}

      {/* Input Fields */}
      <div className="space-y-4">
        {items.map((item) => {
          const itemValue = item.value ?? 0;
          const exceedsMax = item.max !== undefined && itemValue > item.max;

          return (
            <div key={item.id} className="group">
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-slate-700">
                  {item.label}
                </label>
                <div className="flex items-center gap-3">
                  {item.max !== undefined && (
                    <span className={`text-sm flex items-center gap-1.5 ${
                      exceedsMax ? 'text-amber-600' : 'text-slate-400'
                    }`}>
                      {exceedsMax && <AlertTriangle className="w-4 h-4" />}
                      max: {formatNumber(item.max)}
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <input
                type="text"
                inputMode="decimal"
                value={getDisplayValue(item.id)}
                onChange={(e) => handleInputChange(item.id, e.target.value)}
                placeholder="0"
                className={`w-full px-4 py-3 border rounded-xl text-lg font-medium transition-all focus:outline-none focus:ring-2 ${
                  exceedsMax
                    ? 'border-amber-300 bg-amber-50 text-amber-900 focus:ring-amber-500/20 focus:border-amber-500'
                    : 'border-slate-200 bg-white text-slate-900 focus:ring-blue-500/20 focus:border-blue-500'
                }`}
              />
            </div>
          );
        })}

        {/* Add Item Form */}
        {showAddForm ? (
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g., Research & Development"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd();
                    if (e.key === 'Escape') {
                      setShowAddForm(false);
                      setNewLabel('');
                      setNewMax('');
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Max (optional)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={newMax}
                  onChange={(e) => {
                    if (e.target.value === '' || NUMERIC_REGEX.test(e.target.value)) {
                      setNewMax(e.target.value);
                    }
                  }}
                  placeholder="Leave empty for no limit"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                    setNewMax('');
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
            Add Item
          </button>
        )}
      </div>

      {/* Total */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-slate-600">Total</span>
          <span className="text-2xl font-semibold text-slate-900">
            {formatNumber(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
