import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface CommentPanelProps {
  sectionId: string;
  sectionTitle: string;
  comment: string;
  onClose: () => void;
  onSave: (comment: string) => void;
}

export default function CommentPanel({
  sectionId,
  sectionTitle,
  comment,
  onClose,
  onSave,
}: CommentPanelProps) {
  const [localComment, setLocalComment] = useState(comment);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Sync local state when section changes
  useEffect(() => {
    setLocalComment(comment);
  }, [sectionId, comment]);

  // Save on blur
  const handleBlur = () => {
    if (localComment !== comment) {
      onSave(localComment);
    }
  };

  // Handle click outside panel to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      // Save before closing if changed
      if (localComment !== comment) {
        onSave(localComment);
      }
      onClose();
    }
  };

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (localComment !== comment) {
          onSave(localComment);
        }
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [localComment, comment, onSave, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={handleBackdropClick}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-[360px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-200 ease-out"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-slate-500 mb-0.5">Comment</h3>
            <p className="text-base font-semibold text-slate-900 truncate">{sectionTitle}</p>
          </div>
          <button
            onClick={() => {
              if (localComment !== comment) {
                onSave(localComment);
              }
              onClose();
            }}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 overflow-y-auto">
          <textarea
            ref={textareaRef}
            value={localComment}
            onChange={(e) => setLocalComment(e.target.value)}
            onBlur={handleBlur}
            placeholder="Add feedback or notes..."
            className="w-full h-full min-h-[200px] p-4 text-slate-700 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
          Changes save automatically when you click away
        </div>
      </div>
    </>
  );
}
