import React, { useEffect, useState } from 'react';
import { GripVertical, Plus, Trash2, X } from 'lucide-react';
import { useDragReorder } from '../hooks/useDragReorder';
import type { RankSection as RankSectionType } from '../../engine/schema';

interface RankItem {
  id: string;
  label: string;
}

export default function RankSection({ data, value, onChange }: { data: RankSectionType, value?: any, onChange?: (val: any) => void }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  // Normalize value: support both legacy string[] and new RankItem[] formats
  const normalizeItems = (): RankItem[] => {
    if (!value) return [];
    if (Array.isArray(value) && value.length > 0) {
      // Check if it's the new format (objects with id/label)
      if (typeof value[0] === 'object' && 'id' in value[0]) {
        return value as RankItem[];
      }
      // Legacy format: string[] of IDs - convert using data.items
      return (value as string[]).map(id => {
        const found = data.items?.find(i => i.id === id);
        return found || { id, label: id };
      });
    }
    return [];
  };

  const items: RankItem[] = normalizeItems();
  
  // Guard for onChange to satisfy hooks
  const safeOnChange = (val: RankItem[]) => onChange?.(val);

  const {
    getDragProps,
    getDropZoneProps,
    getFinalDropZoneProps,
    isDragging,
    isDropTarget,
    showFinalDropZone,
  } = useDragReorder({ items, onChange: safeOnChange });

  useEffect(() => {
    if (!value && data.items) {
      // Initialize with data.items as full objects
      safeOnChange(data.items.map(i => ({ id: i.id, label: i.label })));
    }
  }, []);

  // Add a new item
  const handleAdd = () => {
    if (!newLabel.trim()) return;
    const newItem: RankItem = {
      id: `custom-${Date.now()}`,
      label: newLabel.trim(),
    };
    safeOnChange([...items, newItem]);
    setNewLabel('');
    setShowAddForm(false);
  };

  // Delete an item
  const handleDelete = (id: string) => {
    safeOnChange(items.filter(item => item.id !== id));
  };

  // Arrow-based move (accessibility fallback)
  const move = (id: string, dir: number) => {
    const idx = items.findIndex(item => item.id === id);
    if (idx === -1) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= items.length) return;
    
    const newItems = [...items];
    const temp = newItems[idx];
    const swapWith = newItems[newIdx];
    if (temp !== undefined && swapWith !== undefined) {
      newItems[idx] = swapWith;
      newItems[newIdx] = temp;
      safeOnChange(newItems);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-light text-slate-900 mb-2">{data.title}</h2>
      {data.description && <p className="text-slate-500 mb-8">{data.description}</p>}
      
      <div className="space-y-3">
        {items.map((item: RankItem, index: number) => {
          return (
            <div 
              key={item.id} 
              className="relative group"
              {...getDropZoneProps(index)}
            >
              {/* Drop indicator line - appears above the target item */}
              {isDropTarget(index) && (
                <div className="absolute -top-1.5 left-4 right-4 h-0.5 bg-blue-500 rounded-full z-10" />
              )}
              
              <div 
                {...getDragProps(index)}
                className={`flex items-center gap-4 bg-white p-4 rounded-xl border-2 shadow-sm transition-all duration-150 ${
                  isDragging(index) 
                    ? 'opacity-50 border-blue-300 scale-[0.98]' 
                    : 'border-slate-100 cursor-grab active:cursor-grabbing'
                }`}
              >
                {/* Drag handle - always visible */}
                <GripVertical className="w-5 h-5 text-slate-300 shrink-0" />
                
                {/* Rank number */}
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold text-slate-500">
                  {index + 1}
                </div>
                
                {/* Label */}
                <span className="flex-1 font-medium text-slate-700">{item.label}</span>
                
                {/* Action buttons - hover only */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => move(item.id, -1)}
                    disabled={index === 0}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button 
                    onClick={() => move(item.id, 1)}
                    disabled={index === items.length - 1}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Final drop zone - for dropping after the last item */}
        {showFinalDropZone && (
          <div 
            className="h-12 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-sm transition-colors hover:border-blue-300 hover:bg-blue-50/50"
            {...getFinalDropZoneProps()}
          >
            Drop here to move to last
          </div>
        )}

        {/* Add Item Form */}
        {showAddForm ? (
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Item Label
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g., New priority item"
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
            Add Item
          </button>
        )}
      </div>
    </div>
  );
}
