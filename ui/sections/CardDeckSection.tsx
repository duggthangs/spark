import React, { useState, useEffect } from 'react';
import { Plus, GripVertical, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

interface CardDeckData {
  id: string;
  title?: string;
  description?: string;
  template: Record<string, string>;
  initialCards?: Record<string, any>[];
}

interface Props {
  data: CardDeckData;
  value?: Record<string, any>[];
  onChange?: (val: Record<string, any>[]) => void;
}

const MAX_CARDS = 10;

export default function CardDeckSection({ data, value, onChange }: Props) {
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Get template fields
  const templateFields = Object.keys(data.template || {});

  // Initialize cards from value or initialCards
  const cards = value || data.initialCards || [];

  // Report initial state on mount
  useEffect(() => {
    if (!value && onChange) {
      const initialCards = data.initialCards || [];
      onChange(initialCards);
    }
  }, [value, onChange, data.initialCards]);

  const createNewCard = () => {
    const newCard: Record<string, any> = { id: `card-${Date.now()}` };
    templateFields.forEach(field => {
      newCard[field] = '';
    });
    return newCard;
  };

  const handleAddCard = () => {
    if (cards.length >= MAX_CARDS) return;
    const newCards = [...cards, createNewCard()];
    onChange?.(newCards);
    setExpandedCardIndex(newCards.length - 1); // Expand the new card
  };

  const handleDeleteCard = (index: number) => {
    const newCards = cards.filter((_, i) => i !== index);
    onChange?.(newCards);
    if (expandedCardIndex === index) {
      setExpandedCardIndex(null);
    } else if (expandedCardIndex !== null && expandedCardIndex > index) {
      setExpandedCardIndex(expandedCardIndex - 1);
    }
  };

  const handleFieldChange = (cardIndex: number, field: string, newValue: string) => {
    const newCards = cards.map((card, i) => {
      if (i === cardIndex) {
        return { ...card, [field]: newValue };
      }
      return card;
    });
    onChange?.(newCards);
  };

  const toggleExpand = (index: number) => {
    setExpandedCardIndex(expandedCardIndex === index ? null : index);
  };

  // Drag and drop handlers (consistent with KanbanBoard)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }

    const newCards = [...cards];
    const draggedCard = newCards.splice(draggedIndex, 1)[0];
    if (!draggedCard) return;
    newCards.splice(targetIndex, 0, draggedCard);
    onChange?.(newCards);

    // Update expanded index if needed
    if (expandedCardIndex === draggedIndex) {
      setExpandedCardIndex(targetIndex);
    } else if (expandedCardIndex !== null) {
      if (draggedIndex < expandedCardIndex && targetIndex >= expandedCardIndex) {
        setExpandedCardIndex(expandedCardIndex - 1);
      } else if (draggedIndex > expandedCardIndex && targetIndex <= expandedCardIndex) {
        setExpandedCardIndex(expandedCardIndex + 1);
      }
    }

    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Get preview text for collapsed card (first 1-2 non-empty fields)
  const getCardPreview = (card: Record<string, any>) => {
    const previewFields = templateFields.slice(0, 2);
    const previews = previewFields
      .map(field => card[field])
      .filter(Boolean);
    return previews.length > 0 ? previews.join(' - ') : 'Empty card';
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <h2 className="text-3xl font-light text-slate-900 mb-2">{data.title}</h2>
      {data.description && (
        <p className="text-slate-500 mb-6">{data.description}</p>
      )}

      {/* Cards */}
      <div className="space-y-3">
        {cards.map((card, index) => {
          const isExpanded = expandedCardIndex === index;
          const isDragging = draggedIndex === index;

          return (
            <div
              key={card.id || index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-white rounded-xl border transition-all duration-200 ${
                isDragging
                  ? 'opacity-50 border-blue-300 shadow-lg'
                  : 'border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Card Header */}
              <div
                onClick={() => toggleExpand(index)}
                className="flex items-center gap-3 p-4 cursor-pointer select-none"
              >
                {/* Drag Handle */}
                <div
                  className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Expand/Collapse Icon */}
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}

                {/* Preview */}
                <span className="flex-1 font-medium text-slate-700 truncate">
                  {getCardPreview(card)}
                </span>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCard(index);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete card"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Card Body (Expanded) */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-slate-100">
                  <div className="pt-4 space-y-4">
                    {templateFields.map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5 capitalize">
                          {field}
                        </label>
                        <input
                          type="text"
                          value={card[field] || ''}
                          onChange={(e) => handleFieldChange(index, field, e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          placeholder={`Enter ${field}...`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={handleAddCard}
          disabled={cards.length >= MAX_CARDS}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            cards.length >= MAX_CARDS
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
          }`}
        >
          <Plus className="w-4 h-4" />
          Add Card
        </button>

        <span className="text-sm text-slate-400">
          {cards.length} of {MAX_CARDS} cards
        </span>
      </div>
    </div>
  );
}
