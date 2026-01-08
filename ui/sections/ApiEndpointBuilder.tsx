import React, { useState, useEffect } from 'react';
import { Globe, Plus, X, Copy, ChevronDown, ChevronRight } from 'lucide-react';
import type { ApiBuilderSection as ApiBuilderSectionType } from '../../engine/schema';
import EndpointEditor from '../components/EndpointEditor';
import type { Endpoint } from '../components/EndpointEditor';

export default function ApiEndpointBuilder({ data, value, onChange }: { data: ApiBuilderSectionType, value?: any, onChange?: (val: any) => void }) {
  const defaultMethod = data.allowedMethods?.[0] || 'GET';
  const defaultHeaders = data.defaultHeaders || [
    { key: 'Content-Type', value: 'application/json' }
  ];
  const defaultResponseCodes = data.responseCodes || [
    { code: 200, label: 'OK', body: '{\n  "success": true\n}' },
    { code: 201, label: 'Created' },
    { code: 400, label: 'Bad Request' },
    { code: 404, label: 'Not Found' }
  ];
  const maxEndpoints = data.maxEndpoints || 10;

  // Initialize endpoints from value or initialEndpoints
  const initialEndpoints: Endpoint[] = value?.endpoints || 
    data.initialEndpoints?.map((e: any): Endpoint => ({
      id: e.id,
      method: (e.method || defaultMethod),
      path: (e.path || ''),
      pathParams: {},
      queryParams: [],
      headers: [...defaultHeaders],
      body: data.defaultBody || '',
      responseCode: defaultResponseCodes[0]?.code || 200,
      responseBody: defaultResponseCodes[0]?.body || '',
      description: e.description || '',
    })) || [];

  const [endpoints, setEndpoints] = useState<Endpoint[]>(initialEndpoints);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(
    initialEndpoints.length > 0 ? 0 : null
  );

  // Report state changes
  useEffect(() => {
    onChange?.({ endpoints });
  }, [endpoints]);

  const methods = data.allowedMethods || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  const createNewEndpoint = (): Endpoint => ({
    id: `endpoint-${Date.now()}`,
    method: defaultMethod,
    path: data.basePath || '/',
    pathParams: {},
    queryParams: [],
    headers: [...defaultHeaders],
    body: data.defaultBody || '',
    responseCode: defaultResponseCodes[0]?.code || 200,
    responseBody: defaultResponseCodes[0]?.body || '',
  });

  const handleAddEndpoint = () => {
    if (endpoints.length >= maxEndpoints) return;
    const newEndpoint = createNewEndpoint();
    const newEndpoints = [...endpoints, newEndpoint];
    setEndpoints(newEndpoints);
    setExpandedIndex(newEndpoints.length - 1); // Auto-expand new endpoint
  };

  const handleDuplicateEndpoint = (index: number) => {
    if (endpoints.length >= maxEndpoints) return;
    const original = endpoints[index];
    if (!original) return;
    const duplicated: Endpoint = {
      ...original,
      id: `endpoint-${Date.now()}`,
    };
    const newEndpoints = [...endpoints];
    newEndpoints.splice(index + 1, 0, duplicated);
    setEndpoints(newEndpoints);
    setExpandedIndex(index + 1); // Auto-expand duplicated endpoint
  };

  const handleDeleteEndpoint = (index: number) => {
    const newEndpoints = endpoints.filter((_, i) => i !== index);
    setEndpoints(newEndpoints);
    if (expandedIndex === index) {
      setExpandedIndex(newEndpoints.length > 0 ? 0 : null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const handleUpdateEndpoint = (index: number, updates: Partial<Endpoint>) => {
    const newEndpoints = [...endpoints];
    const existing = newEndpoints[index];
    if (!existing) return;
    newEndpoints[index] = { ...existing, ...updates };
    setEndpoints(newEndpoints);
  };

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-blue-600 bg-blue-50';
      case 'POST': return 'text-emerald-600 bg-emerald-50';
      case 'PUT': return 'text-amber-600 bg-amber-50';
      case 'DELETE': return 'text-rose-600 bg-rose-50';
      case 'PATCH': return 'text-purple-600 bg-purple-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  // Empty state
  if (endpoints.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No endpoints defined yet</h3>
          <p className="text-sm text-slate-500 mb-6">Add your first API endpoint to get started</p>
          <button
            onClick={handleAddEndpoint}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Your First Endpoint
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Add Endpoint Button */}
      <div className="flex justify-end">
        <button
          onClick={handleAddEndpoint}
          disabled={endpoints.length >= maxEndpoints}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Endpoint
          {endpoints.length >= maxEndpoints && ` (Max ${maxEndpoints})`}
        </button>
      </div>

      {/* Endpoints List */}
      <div className="space-y-2">
        {endpoints.map((endpoint, index) => (
          <div key={endpoint.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Card Header - Collapsed View */}
            <div
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => toggleExpanded(index)}
            >
              <button className="p-1 hover:bg-slate-200 rounded transition-colors">
                {expandedIndex === index ? (
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                )}
              </button>
              
              <span className={`px-2 py-1 text-xs font-bold rounded ${getMethodColor(endpoint.method)}`}>
                {endpoint.method}
              </span>
              
              <span className="font-mono text-sm text-slate-700 flex-1">
                {endpoint.path || '(no path)'}
              </span>

              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleDuplicateEndpoint(index)}
                  disabled={endpoints.length >= maxEndpoints}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Duplicate endpoint"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteEndpoint(index)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  title="Delete endpoint"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card Body - Expanded View */}
            {expandedIndex === index && (
              <div className="border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                <EndpointEditor
                  endpoint={endpoint}
                  methods={methods}
                  defaultResponseCodes={defaultResponseCodes}
                  onUpdate={(updates) => handleUpdateEndpoint(index, updates)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 p-4 bg-blue-50 text-blue-700 rounded-lg text-sm">
        <Globe className="w-5 h-5 shrink-0" />
        <p>Define multiple API endpoints for your feature. Each endpoint can have its own path parameters, headers, and request/response schemas.</p>
      </div>
    </div>
  );
}
