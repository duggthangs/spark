import React from 'react';

export default function DecisionSection({ data, onSubmit }: { data: any, onSubmit: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center animate-in zoom-in-95 duration-300">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-8">
        <div className="text-4xl">🎉</div>
      </div>
      <h2 className="text-3xl font-light text-slate-900 mb-6">All Set!</h2>
      <p className="text-lg text-slate-600 mb-8">{data.message || "You've completed the setup. Ready to launch?"}</p>
      <button
        onClick={onSubmit}
        className="px-8 py-4 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 hover:shadow-xl active:scale-95"
      >
        Submit Experience
      </button>
    </div>
  );
}
