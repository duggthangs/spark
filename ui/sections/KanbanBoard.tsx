import React, { useState, useEffect, useRef } from 'react';
import { Plus, GripVertical, Trash2 } from 'lucide-react';

type Task = { id: string; content: string; description?: string };
type Column = { id: string; title: string; tasks: Task[] };

export default function KanbanBoard({ data, value, onChange }: { data?: any, value?: any, onChange?: (val: any) => void }) {
  
  // State for inline editing
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const editingCardRef = useRef<HTMLDivElement>(null);
  
  // Reconstruct UI state from schema-ready value
  const columns: Column[] = React.useMemo(() => {
    const rawColumns = data?.columns || [];
    const rawItems = data?.items || [];
    const customItems = value?.__items__ || [];
    
    // Merge items: custom items override raw items
    const allItems = [...rawItems, ...customItems];
    const itemsById = new Map(allItems.map((item: any) => [item.id, item]));
    
    // If value is a Record<string, string[]>, use it to arrange items
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return rawColumns.map((col: any) => {
            const itemIds = value[col.id] || [];
            return {
                id: col.id,
                title: col.label,
                tasks: itemIds.map((id: string) => {
                    const item = itemsById.get(id);
                    return {
                        id: id,
                        content: item?.label || item?.content || '',
                        description: item?.description || ''
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
            content: item.label || item.content,
            description: item.description || ''
        }))
    }));
  }, [data, value]);

  // Click outside to close edit mode
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingCardRef.current && !editingCardRef.current.contains(event.target as Node)) {
        setEditingTaskId(null);
      }
    };

    if (editingTaskId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [editingTaskId]);

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
    onChange?.({ ...value, ...schemaReadyValue });
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

  const handleAddTask = (columnId: string) => {
    const newTask = {
      id: `task-${Date.now()}`,
      content: '',
      description: ''
    };
    
    // Get existing items
    const rawItems = data?.items || [];
    const customItems = value?.__items__ || [];
    const allItems = [...rawItems, ...customItems, newTask];
    
    // Update value to include new task in column
    const newValue = {
      ...value,
      __items__: allItems,
      [columnId]: [...(value?.[columnId] || []), newTask.id]
    };
    
    onChange?.(newValue);
    setEditingTaskId(newTask.id); // Auto-enter edit mode
  };

  const handleEditTask = (taskId: string, field: string, newValue: string) => {
    const rawItems = data?.items || [];
    const customItems = value?.__items__ || [];
    const allItems = [...rawItems, ...customItems];
    
    // Find and update the task
    const updatedItems = allItems.map((item: any) => 
      item.id === taskId ? { ...item, [field]: newValue } : item
    );
    
    // Filter to only custom items (user-created or edited)
    const customItemIds = new Set(customItems.map((i: any) => i.id));
    const finalItems = updatedItems.filter((item: any) => 
      customItemIds.has(item.id) || item.id === taskId
    );
    
    onChange?.({ ...value, __items__: finalItems });
  };

  const handleDeleteTask = (taskId: string, columnId: string) => {
    const customItems = value?.__items__ || [];
    const updatedItems = customItems.filter((item: any) => item.id !== taskId);
    const updatedColumn = (value?.[columnId] || []).filter((id: string) => id !== taskId);
    
    onChange?.({
      ...value,
      __items__: updatedItems,
      [columnId]: updatedColumn
    });
    
    if (editingTaskId === taskId) {
      setEditingTaskId(null);
    }
  };

  const handleTaskClick = (taskId: string) => {
    setEditingTaskId(taskId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditingTaskId(null);
    }
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
              {col.tasks.map(task => {
                const isEditing = editingTaskId === task.id;
                
                return (
                  <div
                    key={task.id}
                    ref={isEditing ? editingCardRef : null}
                    draggable={!isEditing}
                    onDragStart={(e) => !isEditing && handleDragStart(e, task.id, col.id)}
                    className={`bg-white p-5 rounded-xl shadow-sm border border-slate-100 transition-all duration-200 group ${
                      isEditing 
                        ? 'ring-2 ring-blue-500/20 shadow-md' 
                        : 'cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    {isEditing ? (
                      // Edit Mode
                      <div className="space-y-3" onKeyDown={handleKeyDown}>
                        <div className="flex items-start justify-between gap-3">
                          <input
                            type="text"
                            value={task.content}
                            onChange={(e) => handleEditTask(task.id, 'content', e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="Task name..."
                            autoFocus
                          />
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleDeleteTask(task.id, col.id);
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <textarea
                          value={task.description || ''}
                          onChange={(e) => handleEditTask(task.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                          placeholder="Add description..."
                          rows={2}
                        />
                      </div>
                    ) : (
                      // View Mode
                      <div onClick={() => handleTaskClick(task.id)} className="cursor-pointer">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-base font-medium text-slate-700">{task.content || 'Untitled Task'}</p>
                          <GripVertical className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                        {task.description && (
                          <p className="mt-2 text-sm text-slate-500 line-clamp-2">{task.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              
              <button 
                onClick={() => handleAddTask(col.id)}
                className="w-full py-3 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 border-dashed text-sm transition-all"
              >
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
