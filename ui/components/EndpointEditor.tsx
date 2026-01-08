import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, X, ArrowRight } from 'lucide-react';

export interface Endpoint {
  id: string;
  method: string;
  path: string;
  pathParams?: Record<string, string>;
  queryParams?: Array<{ key: string; value: string }>;
  headers?: Array<{ key: string; value: string }>;
  body?: string;
  responseCode?: number;
  responseBody?: string;
  description?: string;
}

interface EndpointEditorProps {
  endpoint: Endpoint;
  methods: string[];
  defaultResponseCodes: any[];
  onUpdate: (updates: Partial<Endpoint>) => void;
}

export default function EndpointEditor({
  endpoint,
  methods,
  defaultResponseCodes,
  onUpdate,
}: EndpointEditorProps) {
  const [headersExpanded, setHeadersExpanded] = useState(false);

  // Parse params from path
  const detectedParams = endpoint.path.match(/:[a-zA-Z0-9_]+/g) || [];

  const handlePathParamChange = (param: string, value: string) => {
    const newPathParams = { ...endpoint.pathParams, [param]: value };
    onUpdate({ pathParams: newPathParams });
  };

  const addQueryParam = () => {
    const newQueryParams = [...(endpoint.queryParams || []), { key: '', value: '' }];
    onUpdate({ queryParams: newQueryParams });
  };

  const updateQueryParam = (index: number, field: 'key' | 'value', value: string) => {
    const newQueryParams = [...(endpoint.queryParams || [])];
    newQueryParams[index] = { ...(newQueryParams[index] || { key: '', value: '' }), [field]: value };
    onUpdate({ queryParams: newQueryParams });
  };

  const removeQueryParam = (index: number) => {
    const newQueryParams = (endpoint.queryParams || []).filter((_, i) => i !== index);
    onUpdate({ queryParams: newQueryParams });
  };

  const addHeader = () => {
    const newHeaders = [...(endpoint.headers || []), { key: '', value: '' }];
    onUpdate({ headers: newHeaders });
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...(endpoint.headers || [])];
    newHeaders[index] = { ...(newHeaders[index] || { key: '', value: '' }), [field]: value };
    onUpdate({ headers: newHeaders });
  };

  const removeHeader = (index: number) => {
    const newHeaders = (endpoint.headers || []).filter((_, i) => i !== index);
    onUpdate({ headers: newHeaders });
  };

  const handleResponseCodeChange = (code: number) => {
    const selectedResponse = defaultResponseCodes.find((r: any) => r.code === code);
    onUpdate({
      responseCode: code,
      responseBody: selectedResponse?.body || endpoint.responseBody || '',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* URL Bar */}
      <div className="flex items-center gap-2">
        <select
          value={endpoint.method}
          onChange={(e) => onUpdate({ method: e.target.value })}
          className={`px-3 py-2 rounded-lg font-bold text-sm outline-none border border-slate-200 focus:border-blue-400 transition-colors ${
            endpoint.method === 'GET' ? 'text-blue-600' :
            endpoint.method === 'POST' ? 'text-emerald-600' :
            endpoint.method === 'DELETE' ? 'text-rose-600' : 'text-amber-600'
          }`}
        >
          {methods.map((m: string) => <option key={m}>{m}</option>)}
        </select>

        <input
          type="text"
          value={endpoint.path}
          onChange={(e) => onUpdate({ path: e.target.value })}
          className="flex-1 px-3 py-2 bg-white rounded-md border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none font-mono text-sm text-slate-700 transition-all"
          placeholder="/api/v1/users/:id"
        />
      </div>

      {/* Path Parameters */}
      {detectedParams.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Path Variables</h4>
          <div className="grid gap-3">
            {detectedParams.map((param: string, i: number) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className="w-24 font-mono text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded text-right">
                  {param}
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300" />
                <input
                  type="text"
                  placeholder="Value..."
                  value={endpoint.pathParams?.[param] || ''}
                  onChange={(e) => handlePathParamChange(param, e.target.value)}
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

      {/* Query Parameters */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Query Parameters</h4>
          <button
            onClick={addQueryParam}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>
        {(!endpoint.queryParams || endpoint.queryParams.length === 0) ? (
          <div className="text-sm text-slate-400 italic">No query parameters</div>
        ) : (
          <div className="space-y-2">
            {endpoint.queryParams.map((param: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="key"
                  value={param.key}
                  onChange={(e) => updateQueryParam(i, 'key', e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-md focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                />
                <span className="text-slate-400">=</span>
                <input
                  type="text"
                  placeholder="value"
                  value={param.value}
                  onChange={(e) => updateQueryParam(i, 'value', e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-md focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                />
                <button
                  onClick={() => removeQueryParam(i)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Headers (Collapsible) */}
      <div>
        <button
          onClick={() => setHeadersExpanded(!headersExpanded)}
          className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
        >
          {headersExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          Headers
        </button>
        {headersExpanded && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            {(endpoint.headers || []).map((header: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Header name"
                  value={header.key}
                  onChange={(e) => updateHeader(i, 'key', e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-md focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-mono"
                />
                <span className="text-slate-400">:</span>
                <input
                  type="text"
                  placeholder="value"
                  value={header.value}
                  onChange={(e) => updateHeader(i, 'value', e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-md focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-mono"
                />
                <button
                  onClick={() => removeHeader(i)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addHeader}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add Header
            </button>
          </div>
        )}
      </div>

      {/* Request Body & Response */}
      <div className="grid grid-cols-2 gap-6">
        {/* Request Body */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            Request Body
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">JSON</span>
          </h4>
          <div className="bg-slate-900 rounded-lg p-4 min-h-[200px] relative group">
            <textarea
              value={endpoint.body || ''}
              onChange={(e) => onUpdate({ body: e.target.value })}
              className="w-full h-full min-h-[180px] bg-transparent text-slate-300 font-mono text-xs outline-none resize-none"
              placeholder='{\n  "key": "value"\n}'
            />
          </div>
        </div>

        {/* Response Preview */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            Response
            <select
              value={endpoint.responseCode}
              onChange={(e) => handleResponseCodeChange(Number(e.target.value))}
              className={`text-[10px] px-1.5 py-0.5 rounded outline-none border-none ${
                (endpoint.responseCode || 0) >= 200 && (endpoint.responseCode || 0) < 300 ? 'bg-emerald-100 text-emerald-600' :
                (endpoint.responseCode || 0) >= 400 && (endpoint.responseCode || 0) < 500 ? 'bg-amber-100 text-amber-600' :
                'bg-rose-100 text-rose-600'
              }`}
            >
              {defaultResponseCodes.map((rc: any) => (
                <option key={rc.code} value={rc.code}>
                  {rc.code} {rc.label}
                </option>
              ))}
            </select>
          </h4>
          <div className="bg-slate-50 rounded-lg p-4 min-h-[200px] border border-slate-200">
            <textarea
              value={endpoint.responseBody || ''}
              onChange={(e) => onUpdate({ responseBody: e.target.value })}
              className="w-full h-full min-h-[180px] bg-transparent text-slate-600 font-mono text-xs outline-none resize-none"
              placeholder='{\n  "id": "123"\n}'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
