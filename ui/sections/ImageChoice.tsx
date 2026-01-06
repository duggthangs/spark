import React, { useState, useEffect } from 'react';
import { Check, ZoomIn } from 'lucide-react';

export default function ImageChoice({ data, value, onChange }: { data?: any, value?: any, onChange?: (val: any) => void }) {
  const selectedId = typeof value === 'string' ? value : null;

  // Report initial state if not present (though for choice, null is often intended)
  useEffect(() => {
    if (value === undefined && onChange) {
      onChange(null);
    }
  }, [value, onChange]);

  const images = data?.images || [
    { id: '1', src: 'https://images.unsplash.com/photo-1554188248-986adbbccd32?q=80&w=600&auto=format&fit=crop', title: 'Abstract Waves', description: 'Fluid motion and calm tones.' },
    { id: '2', src: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop', title: 'Geometric Shapes', description: 'Structured, clean lines.' },
    { id: '3', src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop', title: 'Liquid Gradient', description: 'Vibrant and modern colors.' },
    { id: '4', src: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=600&auto=format&fit=crop', title: 'Neon Glow', description: 'High contrast and energy.' },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-light text-slate-900 mb-3">Choose Your Aesthetic</h2>
        <p className="text-lg text-slate-500 max-w-lg mx-auto">Select a visual style that best represents the mood of your project.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 w-full max-w-3xl">
        {images.map((img: any) => {
          const isSelected = selectedId === img.id;
          return (
            <div 
              key={img.id}
              onClick={() => onChange?.(img.id)}
              className={`group relative flex items-center p-4 cursor-pointer rounded-2xl border transition-all duration-300 ${
                isSelected 
                  ? 'bg-slate-900 border-slate-900 ring-2 ring-offset-2 ring-slate-900 shadow-xl scale-[1.02]' 
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg hover:-translate-y-1'
              }`}
            >
              {/* Image Thumbnail */}
              <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden mr-5 shadow-sm">
                <img 
                  src={img.src} 
                  alt={img.title || img.label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium text-lg mb-1 truncate transition-colors ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {img.title || img.label}
                </h3>
                <p className={`text-sm truncate transition-colors ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                   {img.description || 'Visual style variant'}
                </p>
              </div>

              {/* Selection Indicator */}
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ml-4 transition-all ${
                isSelected 
                  ? 'bg-blue-500 border-blue-500 text-white scale-110' 
                  : 'border-slate-300 bg-white text-transparent group-hover:border-slate-400'
              }`}>
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

