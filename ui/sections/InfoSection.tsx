import React, { useEffect } from 'react';
import type { InfoSection as InfoSectionType } from '../../engine/schema';

export default function InfoSection({ data, onChange }: { data: InfoSectionType, onChange?: (val: any) => void }) {
  useEffect(() => {
    // Info sections don't have user input but we report "true" to indicate viewed
    onChange?.(true);
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-light text-slate-900 mb-6">{data.title}</h2>
      <div className="prose prose-slate prose-lg">
        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
          {data.content}
        </p>
      </div>
    </div>
  );
}
