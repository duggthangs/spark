import React, { useEffect } from 'react';
import { GripVertical } from 'lucide-react';
import { useDragReorder } from '../hooks/useDragReorder';

export default function RankSection({ data, value, onChange }: { data: any, value: any, onChange: (val: any) => void }) {
  const items: string[] = Array.isArray(value) ? value : data.items?.map((i: any) => i.id) || [];

  const {
    getDragProps,
    getDropZoneProps,
    getFinalDropZoneProps,
    isDragging,
    isDropTarget,
    showFinalDropZone,
  } = useDragReorder({ items, onChange });

  useEffect(() => {
    if (!value && data.items) {
      onChange(data.items.map((i: any) => i.id));
    }
  }, []);

  // Arrow-based move (accessibility fallback)
  const move = (id: string, dir: number) => {
    const idx = items.indexOf(id);
    if (idx === -1) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= items.length) return;
    
    const newItems = [...items];
    const temp = newItems[idx];
    const swapWith = newItems[newIdx];
    if (temp !== undefined && swapWith !== undefined) {
      newItems[idx] = swapWith;
      newItems[newIdx] = temp;
      onChange(newItems);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-light text-slate-900 mb-2">{data.title}</h2>
      {data.description && <p className="text-slate-500 mb-8">{data.description}</p>}
      
      <div className="space-y-3">
        {items.map((itemId: string, index: number) => {
          const item = data.items.find((i: any) => i.id === itemId);
          if (!item) return null;

          return (
            <div 
              key={item.id} 
              className="relative"
              {...getDropZoneProps(index)}
            >
              {/* Drop indicator line - appears above the target item */}
              {isDropTarget(index) && (
                <div className="absolute -top-1.5 left-4 right-4 h-0.5 bg-blue-500 rounded-full z-10" />
              )}
              
              <div 
                {...getDragProps(index)}
                className={`flex items-center gap-4 bg-white p-4 rounded-xl border-2 shadow-sm group transition-all duration-150 ${
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
                
                {/* Arrow buttons - hover only (accessibility fallback) */}
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
      </div>
    </div>
  );
}
