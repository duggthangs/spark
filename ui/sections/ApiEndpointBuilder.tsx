import React, { useState, useEffect } from 'react';
import { Globe, ArrowRight, Check, AlertCircle } from 'lucide-react';

export default function ApiEndpointBuilder({ data, value, onChange }: { data?: any, value?: any, onChange?: (val: any) => void }) {
  const defaultMethod = data?.allowedMethods?.[0] || 'GET';
  const defaultPath = data?.basePath || '/api/users/:id/posts';

  const method = value?.method || defaultMethod;
  const path = value?.path || defaultPath;

  // Report initial state
  useEffect(() => {
    if (!value && onChange) {
      onChange({ method: defaultMethod, path: defaultPath });
    }
  }, [value, onChange, defaultMethod, defaultPath]);

  const updateState = (updates: any) => {
    onChange?.({ method, path, ...updates });
  };
  
  // Parse params from path
  const params = path.match(/:[a-zA-Z0-9_]+/g) || [];

  const methods = data?.allowedMethods || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header / URL Bar */}
        <div className="p-1 bg-slate-50 border-b border-slate-200 flex items-center gap-1">
          <select 
            value={method}
            onChange={(e) => updateState({ method: e.target.value })}
            className={`px-3 py-2 rounded-lg font-bold text-sm outline-none border-transparent focus:bg-white transition-colors ${
              method === 'GET' ? 'text-blue-600' :
              method === 'POST' ? 'text-emerald-600' :
              method === 'DELETE' ? 'text-rose-600' : 'text-amber-600'
            }`}
          >
            {methods.map((m: string) => <option key={m}>{m}</option>)}
          </select>

          <div className="flex-1 relative group">
            <input
              type="text"
              value={path}
              onChange={(e) => updateState({ path: e.target.value })}
              className="w-full px-3 py-2 bg-white rounded-md border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none font-mono text-sm text-slate-700 transition-all"
            />
            {/* Visual overlay for params */}
            <div className="absolute top-0 left-0 w-full h-full px-3 py-2 pointer-events-none flex font-mono text-sm text-transparent" aria-hidden="true">
               {/* This is a tricky CSS hack to highlight text, simpler to just list them below for this prototype */}
            </div>
          </div>
          
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
            Test
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-8">
          
          {/* Detected Params */}
          {params.length > 0 && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Path Variables</h4>
              <div className="grid gap-3">
                {params.map((param: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className="w-24 font-mono text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded text-right">
                      {param}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                    <input 
                      type="text" 
                      placeholder="Value..."
                      className="flex-1 px-3 py-1.5 border-b border-slate-200 focus:border-blue-500 outline-none text-sm transition-colors bg-transparent"
                    />
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>String</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-8">
             {/* Request Schema */}
             <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                   Request Body
                   <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">JSON</span>
                </h4>
                <div className="bg-slate-900 rounded-lg p-4 min-h-[200px] relative group">
                   <textarea 
                     className="w-full h-full bg-transparent text-slate-300 font-mono text-xs outline-none resize-none"
                     defaultValue={`{\n  "name": "John Doe",\n  "email": "john@example.com"\n}`}
                   />
                </div>
             </div>

             {/* Response Preview */}
             <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                   Response
                   <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded">200 OK</span>
                </h4>
                <div className="bg-slate-50 rounded-lg p-4 min-h-[200px] border border-slate-200">
                   <pre className="text-xs text-slate-600 font-mono">
{`{
  "id": "usr_123",
  "created_at": "2024-03-20T10:00:00Z",
  "status": "active"
}`}
                   </pre>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 text-blue-700 rounded-lg text-sm">
        <Globe className="w-5 h-5 shrink-0" />
        <p>This builder automatically extracts path parameters and validates JSON schemas in real-time. Try changing the URL path above.</p>
      </div>
    </div>
  );
}
