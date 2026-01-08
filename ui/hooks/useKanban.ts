import { useMemo, useState, useEffect } from 'react';
import type { KanbanSection } from '../../engine/schema';

export type Task = { id: string; content: string; description?: string };
export type Column = { id: string; title: string; tasks: Task[] };

export function useKanban(data: KanbanSection, value: any, onChange?: (val: any) => void) {
  // State for drag and drop
  const [draggedTask, setDraggedTask] = useState<{ taskId: string, sourceColId: string } | null>(null);

  // Reconstruct UI state from schema-ready value
  const columns: Column[] = useMemo(() => {
    const rawColumns = data.columns || [];
    const rawItems = data.items || [];
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
                }).filter((t: any) => t.id) // Filter out undefined if item not found
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

    const sourceCol = columns.find(c => c.id === draggedTask.sourceColId);
    if (!sourceCol) return;
    
    const task = sourceCol.tasks.find(t => t.id === draggedTask.taskId);
    if (!task) return;

    const newSourceTasks = sourceCol.tasks.filter(t => t.id !== draggedTask.taskId);
    
    const targetCol = columns.find(c => c.id === targetColId);
    if (!targetCol) return;
    
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
    const rawItems = data.items || [];
    const customItems = value?.__items__ || [];
    const allItems = [...rawItems, ...customItems, newTask];
    
    // Update value to include new task in column
    const newValue = {
      ...value,
      __items__: allItems,
      [columnId]: [...(value?.[columnId] || []), newTask.id]
    };
    
    onChange?.(newValue);
    return newTask.id; // Return ID so UI can focus it
  };

  const handleEditTask = (taskId: string, field: string, newValue: string) => {
    const rawItems = data.items || [];
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
  };

  return {
    columns,
    draggedTask,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleAddTask,
    handleEditTask,
    handleDeleteTask
  };
}
