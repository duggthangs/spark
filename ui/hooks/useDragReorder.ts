import { useState, useCallback } from 'react';

interface UseDragReorderOptions<T> {
  items: T[];
  onChange: (items: T[]) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

interface DragProps {
  draggable: true;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

interface DropZoneProps {
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

interface UseDragReorderReturn<T> {
  draggedIndex: number | null;
  dropTargetIndex: number | null;
  
  /** Props to spread on the draggable element */
  getDragProps: (index: number) => DragProps;
  
  /** Props to spread on the drop zone container */
  getDropZoneProps: (index: number) => DropZoneProps;
  
  /** Props for the final drop zone (after last item) */
  getFinalDropZoneProps: () => DropZoneProps;
  
  /** Check if item at index is being dragged */
  isDragging: (index: number) => boolean;
  
  /** Check if item at index is a drop target */
  isDropTarget: (index: number) => boolean;
  
  /** Whether to show the final drop zone */
  showFinalDropZone: boolean;
}

export function useDragReorder<T>({
  items,
  onChange,
  onReorder,
}: UseDragReorderOptions<T>): UseDragReorderReturn<T> {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const reorder = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const newItems = [...items];
    const dragged = newItems.splice(fromIndex, 1)[0];
    if (dragged === undefined) return;
    newItems.splice(toIndex, 0, dragged);
    onChange(newItems);
    onReorder?.(fromIndex, toIndex);
  }, [items, onChange, onReorder]);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDropTargetIndex(index);
  }, [draggedIndex]);

  const handleDragLeave = useCallback(() => {
    setDropTargetIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDropTargetIndex(null);
      return;
    }

    reorder(draggedIndex, targetIndex);
    setDraggedIndex(null);
    setDropTargetIndex(null);
  }, [draggedIndex, reorder]);

  const handleFinalDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const targetIndex = items.length - 1;
    if (draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDropTargetIndex(null);
      return;
    }

    // Move to end
    const newItems = [...items];
    const dragged = newItems.splice(draggedIndex, 1)[0];
    if (dragged === undefined) return;
    newItems.push(dragged);
    onChange(newItems);
    onReorder?.(draggedIndex, newItems.length - 1);

    setDraggedIndex(null);
    setDropTargetIndex(null);
  }, [draggedIndex, items, onChange, onReorder]);

  const getDragProps = useCallback((index: number): DragProps => ({
    draggable: true,
    onDragStart: (e) => handleDragStart(e, index),
    onDragEnd: handleDragEnd,
  }), [handleDragStart, handleDragEnd]);

  const getDropZoneProps = useCallback((index: number): DropZoneProps => ({
    onDragOver: (e) => handleDragOver(e, index),
    onDragLeave: handleDragLeave,
    onDrop: (e) => handleDrop(e, index),
  }), [handleDragOver, handleDragLeave, handleDrop]);

  const getFinalDropZoneProps = useCallback((): DropZoneProps => ({
    onDragOver: (e) => {
      e.preventDefault();
      setDropTargetIndex(items.length);
    },
    onDragLeave: handleDragLeave,
    onDrop: handleFinalDrop,
  }), [items.length, handleDragLeave, handleFinalDrop]);

  const isDragging = useCallback((index: number) => draggedIndex === index, [draggedIndex]);
  
  const isDropTarget = useCallback((index: number) => 
    dropTargetIndex === index && draggedIndex !== index, 
    [dropTargetIndex, draggedIndex]
  );

  const showFinalDropZone = draggedIndex !== null && draggedIndex !== items.length - 1;

  return {
    draggedIndex,
    dropTargetIndex,
    getDragProps,
    getDropZoneProps,
    getFinalDropZoneProps,
    isDragging,
    isDropTarget,
    showFinalDropZone,
  };
}
