import React, { useEffect } from 'react';

export default function TextReviewSection({ data, value, onChange }: { data: any, value: any, onChange: (val: any) => void }) {
  useEffect(() => {
    if (!value) onChange("");
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-light text-slate-900 mb-6">{data.title}</h2>
      {data.content && (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8 italic text-slate-600">
          {data.content}
        </div>
      )}
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Leave your comments here..."
        className="w-full h-40 p-4 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all resize-none"
      />
    </div>
  );
}
