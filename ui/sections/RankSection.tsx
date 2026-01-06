import React, { useEffect } from 'react';

export default function RankSection({ data, value, onChange }: { data: any, value: any, onChange: (val: any) => void }) {
  const items = Array.isArray(value) ? value : data.items?.map((i: any) => i.id) || [];

  useEffect(() => {
    if (!value && data.items) {
      onChange(data.items.map((i: any) => i.id));
    }
  }, []);

  const move = (id: string, dir: number) => {
    const idx = items.indexOf(id);
    if (idx === -1) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= items.length) return;
    
    const newItems = [...items];
    [newItems[idx], newItems[newIdx]] = [newItems[newIdx], newItems[idx]];
    onChange(newItems);
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
            <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-xl border-2 border-slate-100 shadow-sm group">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold text-slate-500">
                {index + 1}
              </div>
              <span className="flex-1 font-medium text-slate-700">{item.label}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                   onClick={() => move(item.id, -1)}
                   disabled={index === 0}
                   className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-30"
                >
                  ↑
                </button>
                <button 
                   onClick={() => move(item.id, 1)}
                   disabled={index === items.length - 1}
                   className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
