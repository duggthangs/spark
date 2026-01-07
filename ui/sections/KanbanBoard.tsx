import React, { useState, useEffect } from 'react';
import { Plus, GripVertical } from 'lucide-react';

type Task = { id: string; content: string; tag: string };
type Column = { id: string; title: string; tasks: Task[] };

export default function KanbanBoard({ data, value, onChange }: { data?: any, value?: any, onChange?: (val: any) => void }) {
  
  // Reconstruct UI state from schema-ready value
  const columns: Column[] = React.useMemo(() => {
    const rawColumns = data?.columns || [];
    const rawItems = data?.items || [];
    
    // If value is a Record<string, string[]>, use it to arrange items
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return rawColumns.map((col: any) => {
            const itemIds = value[col.id] || [];
            return {
                id: col.id,
                title: col.label,
                tasks: itemIds.map((id: string) => {
                    const item = rawItems.find((i: any) => i.id === id);
                    return {
                        id: id,
                        content: item?.label || id,
                        tag: 'General'
                    };
                })
            };
        });
    }

    // Fallback to data.items columnId mapping
    return rawColumns.map((col: any) => ({
        id: col.id,
        title: col.label,
        tasks: rawItems.filter((item: any) => item.columnId === col.id).map((item: any) => ({
            id: item.id,
            content: item.label,
            tag: 'General'
        }))
    }));
  }, [data, value]);

  // Report initial state
  useEffect(() => {
    if (!value && onChange) {
      const initialValue: Record<string, string[]> = {};
      columns.forEach(col => {
          initialValue[col.id] = col.tasks.map(t => t.id);
      });
      onChange(initialValue);
    }
  }, [value, onChange, columns]);

  const [draggedTask, setDraggedTask] = useState<{ taskId: string, sourceColId: string } | null>(null);

  const updateState = (newColumns: Column[]) => {
    const schemaReadyValue: Record<string, string[]> = {};
    newColumns.forEach(col => {
        schemaReadyValue[col.id] = col.tasks.map(t => t.id);
    });
    onChange?.(schemaReadyValue);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string, sourceColId: string) => {
    setDraggedTask({ taskId, sourceColId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    
    if (!draggedTask) return;
    if (draggedTask.sourceColId === targetColId) return;

    const sourceCol = columns.find(c => c.id === draggedTask.sourceColId)!;
    const task = sourceCol.tasks.find(t => t.id === draggedTask.taskId)!;

    const newSourceTasks = sourceCol.tasks.filter(t => t.id !== draggedTask.taskId);
    
    const targetCol = columns.find(c => c.id === targetColId)!;
    const newTargetTasks = [...targetCol.tasks, task];

    updateState(columns.map(col => {
      if (col.id === draggedTask.sourceColId) return { ...col, tasks: newSourceTasks };
      if (col.id === targetColId) return { ...col, tasks: newTargetTasks };
      return col;
    }));

    setDraggedTask(null);
  };

  return (
    <div className="h-full w-full max-w-[100vw] px-4">
      {/* Header */}
      {(data?.title || data?.description) && (
        <div className="max-w-2xl mx-auto mb-6">
          {data?.title && <h2 className="text-3xl font-light text-slate-900 mb-2">{data.title}</h2>}
          {data?.description && <p className="text-slate-500">{data.description}</p>}
        </div>
      )}
      
      {/* Kanban Board */}
      <div className="flex gap-6 h-full overflow-x-auto pb-4 justify-center">
        {columns.map(col => (
          <div 
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex-1 min-w-[300px] flex flex-col rounded-2xl transition-all duration-300 ${
               draggedTask && draggedTask.sourceColId !== col.id 
                 ? 'bg-slate-50 ring-2 ring-slate-200 ring-dashed' 
                 : 'bg-transparent'
            }`}
          >
            {/* Column Header */}
            <div className="p-4 flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-slate-900 text-lg">{col.title}</h3>
                <span className="bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  {col.tasks.length}
                </span>
              </div>
            </div>

            {/* Task List */}
            <div className="flex-1 space-y-3">
              {col.tasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id, col.id)}
                  className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-base font-medium text-slate-700">{task.content}</p>
                    <GripVertical className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                  <div className="mt-3 flex items-center">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                      {task.tag}
                    </span>
                  </div>
                </div>
              ))}
              
              <button className="w-full py-3 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 border-dashed text-sm transition-all">
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
