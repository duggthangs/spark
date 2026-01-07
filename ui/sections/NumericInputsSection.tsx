import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Trash2, X } from 'lucide-react';

interface NumericInputItem {
  id: string;
  label: string;
  max?: number;
}

interface NumericInputsData {
  id: string;
  title?: string;
  description?: string;
  items: NumericInputItem[];
}

// Value is a flat record of id -> value
// But we also need to track item metadata for user-added items
// So we store: { __items__: [...], itemId: number, ... }
// The __items__ key holds metadata, other keys are values
interface NumericInputsValue {
  __items__?: NumericInputItem[];
  [key: string]: number | NumericInputItem[] | undefined;
}

interface Props {
  data: NumericInputsData;
  value?: NumericInputsValue;
  onChange?: (val: NumericInputsValue) => void;
}

// Regex to validate numeric input (allows empty, integers, decimals)
const NUMERIC_REGEX = /^-?\d*\.?\d*$/;

export default function NumericInputsSection({ data, value, onChange }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newMax, setNewMax] = useState('');
  
  // Track display values as strings for better UX (allows empty input)
  const [displayValues, setDisplayValues] = useState<Record<string, string>>({});

  // Get items from value.__items__ or fall back to data.items
  const items: NumericInputItem[] = value?.__items__ || data.items || [];

  // Initialize on mount
  useEffect(() => {
    if (!value && onChange) {
      const initialItems = data.items || [];
      const initialValue: NumericInputsValue = {
        __items__: initialItems,
      };
      const initialDisplay: Record<string, string> = {};
      initialItems.forEach(item => {
        initialValue[item.id] = 0;
        initialDisplay[item.id] = '';
      });
      setDisplayValues(initialDisplay);
      onChange(initialValue);
    }
  }, [value, onChange, data.items]);

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
  }, [items]);

  // Get numeric value for an item
  const getValue = (itemId: string): number => {
    const val = value?.[itemId];
    return typeof val === 'number' ? val : 0;
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
      onChange?.({
        ...value,
        [itemId]: numValue,
      });
    }
  };

  // Delete an item
  const handleDelete = (itemId: string) => {
    const newItems = items.filter(item => item.id !== itemId);
    const newValue: NumericInputsValue = {
      __items__: newItems,
    };
    // Copy over values for remaining items
    newItems.forEach(item => {
      newValue[item.id] = getValue(item.id);
    });
    // Clean up display values
    setDisplayValues(prev => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
    onChange?.(newValue);
  };

  // Add a new item
  const handleAdd = () => {
    if (!newLabel.trim()) return;

    const newItem: NumericInputItem = {
      id: `custom-${Date.now()}`,
      label: newLabel.trim(),
      max: newMax ? parseFloat(newMax) : undefined,
    };

    const newItems = [...items, newItem];
    const newValue: NumericInputsValue = {
      ...value,
      __items__: newItems,
      [newItem.id]: 0,
    };

    setDisplayValues(prev => ({ ...prev, [newItem.id]: '' }));
    onChange?.(newValue);
    setNewLabel('');
    setNewMax('');
    setShowAddForm(false);
  };

  // Calculate total (exclude __items__ from sum)
  const total = items.reduce((sum, item) => sum + getValue(item.id), 0);

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
          const itemValue = getValue(item.id);
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
