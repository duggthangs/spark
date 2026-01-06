import React, { useRef, useEffect, useState } from 'react';
import { Database, Monitor, ArrowRight, Link as LinkIcon, X } from 'lucide-react';

type Field = { id: string; label: string; type: string };
type Connection = { sourceId: string; targetId: string };

export default function DataMapper({ data, value, onChange }: { data?: any, value?: any, onChange?: (val: any) => void }) {
  const [dragSource, setDragSource] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{x:number, y:number} | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  // We'll use a map of refs to track field positions
  const fieldRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const connections: Connection[] = Array.isArray(value) ? value : [];

  // Report initial state
  useEffect(() => {
    if (!value && onChange) {
      onChange([]);
    }
  }, [value, onChange]);

  const updateConnections = (newConnections: Connection[]) => {
    onChange?.(newConnections);
  };

  const sourceFields: Field[] = data?.sources?.map((s: any) => ({
      id: s.id,
      label: s.label,
      type: 'String' 
  })) || [
    { id: 'user.id', label: 'User ID', type: 'UUID' },
    { id: 'user.firstName', label: 'First Name', type: 'String' },
    { id: 'user.lastName', label: 'Last Name', type: 'String' },
    { id: 'user.email', label: 'Email', type: 'String' },
    { id: 'user.avatar', label: 'Avatar URL', type: 'URI' },
    { id: 'meta.created', label: 'Created At', type: 'Date' },
  ];

  const targetProps: Field[] = data?.targets?.map((t: any) => ({
      id: t.id,
      label: t.label,
      type: 'String'
  })) || [
    { id: 'profile.uid', label: 'Profile ID', type: 'String' },
    { id: 'profile.fullName', label: 'Full Name', type: 'String' },
    { id: 'profile.image', label: 'Image Source', type: 'String' },
    { id: 'profile.joined', label: 'Join Date', type: 'String' },
    { id: 'settings.theme', label: 'Theme Preference', type: 'Enum' },
  ];

  const handleDragStart = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setDragSource(id);
  };

  const handleDragEnd = (targetId: string) => {
    if (dragSource && dragSource !== targetId) {
      // Avoid duplicates
      if (!connections.find(c => c.sourceId === dragSource && c.targetId === targetId)) {
        updateConnections([...connections, { sourceId: dragSource, targetId }]);
      }
    }
    setDragSource(null);
    setMousePos(null);
  };

  // Track mouse for the drag line
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragSource && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };
    
    const handleGlobalMouseUp = () => {
       if (dragSource) setDragSource(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragSource]);

  // Helper to get coordinates
  const getCoords = (id: string, side: 'right' | 'left') => {
    const el = fieldRefs.current.get(id);
    if (!el || !containerRef.current) return { x: 0, y: 0 };
    
    const rect = el.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    return {
      x: (side === 'right' ? rect.right : rect.left) - containerRect.left,
      y: (rect.top + rect.height / 2) - containerRect.top
    };
  };

  const removeConnection = (index: number) => {
    updateConnections(connections.filter((_, i) => i !== index));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
         <div>
             <h3 className="text-lg font-bold text-slate-800">Data Mapping</h3>
             <p className="text-sm text-slate-500">Connect source data to component props</p>
         </div>
         <button 
            onClick={() => updateConnections([])}
            className="text-xs text-red-500 hover:text-red-600 font-medium px-3 py-1 bg-red-50 rounded-full"
         >
            Reset Mappings
         </button>
      </div>

      <div 
        ref={containerRef} 
        className="relative flex-1 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex"
      >
        {/* SVG Layer */}
        <svg className="absolute inset-0 pointer-events-none w-full h-full z-10 overflow-visible">
          <defs>
             <marker id="head" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
               <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
             </marker>
          </defs>
          
          {/* Existing connections */}
          {connections.map((conn, i) => {
            const start = getCoords(conn.sourceId, 'right');
            const end = getCoords(conn.targetId, 'left');
            
            // Bezier curve
            const controlPointOffset = Math.abs(end.x - start.x) / 2;
            const path = `M ${start.x} ${start.y} C ${start.x + controlPointOffset} ${start.y}, ${end.x - controlPointOffset} ${end.y}, ${end.x} ${end.y}`;

            return (
              <g key={i}>
                <path 
                  d={path} 
                  stroke="#cbd5e1" 
                  strokeWidth="2" 
                  fill="none" 
                  className="transition-all"
                />
                <path 
                  d={path} 
                  stroke="#64748b" 
                  strokeWidth="2" 
                  fill="none" 
                  markerEnd="url(#head)"
                  className="animate-draw"
                  strokeDasharray="5"
                />
              </g>
            );
          })}

          {/* Active drag line */}
          {dragSource && mousePos && (
             <path 
               d={`M ${getCoords(dragSource, 'right').x} ${getCoords(dragSource, 'right').y} L ${mousePos.x} ${mousePos.y}`}
               stroke="#3b82f6" 
               strokeWidth="2" 
               strokeDasharray="4"
               fill="none" 
             />
          )}
        </svg>

        {/* Source Column */}
        <div className="w-1/3 bg-white border-r border-slate-200 p-6 z-20 flex flex-col gap-4">
           <div className="flex items-center gap-2 text-slate-800 font-semibold mb-2">
              <Database className="w-4 h-4 text-slate-500" />
              Source Data
           </div>
           {sourceFields.map(field => (
             <div 
               key={field.id}
               ref={el => { if(el) fieldRefs.current.set(field.id, el) }}
               onMouseDown={(e) => handleDragStart(field.id, e)}
               className={`group p-3 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative flex items-center justify-between
                 ${connections.some(c => c.sourceId === field.id) ? 'border-blue-200 bg-blue-50/50' : ''}
               `}
             >
                <div>
                   <div className="text-sm font-medium text-slate-700 group-hover:text-blue-700">{field.label}</div>
                   <div className="text-[10px] font-mono text-slate-400">{field.id}</div>
                </div>
                <div className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{field.type}</div>
                
                {/* Connector Dot */}
                <div className="absolute -right-1.5 w-3 h-3 bg-white border-2 border-slate-300 rounded-full group-hover:border-blue-500 group-hover:bg-blue-500 transition-colors" />
             </div>
           ))}
        </div>

        {/* Middle Spacer */}
        <div className="flex-1 bg-slate-50/50 relative">
            {/* Could put transformation logic here later */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
               <ArrowRight className="w-32 h-32" />
            </div>
            
            {/* Mapping List (Active Transformations) */}
            <div className="absolute top-6 left-0 right-0 px-8 pointer-events-auto">
               <div className="space-y-2">
                 {connections.map((conn, i) => (
                    <div key={i} className="bg-white/80 backdrop-blur border border-slate-200 rounded-full px-3 py-1 text-xs flex items-center justify-between shadow-sm w-fit mx-auto gap-3">
                       <span className="font-mono text-slate-600">{conn.sourceId}</span>
                       <ArrowRight className="w-3 h-3 text-slate-300" />
                       <span className="font-mono text-slate-600">{conn.targetId}</span>
                       <button onClick={() => removeConnection(i)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                    </div>
                 ))}
               </div>
            </div>
        </div>

        {/* Target Column */}
        <div className="w-1/3 bg-white border-l border-slate-200 p-6 z-20 flex flex-col gap-4">
           <div className="flex items-center gap-2 text-slate-800 font-semibold mb-2">
              <Monitor className="w-4 h-4 text-slate-500" />
              Component Props
           </div>
           {targetProps.map(field => (
             <div 
               key={field.id}
               ref={el => { if(el) fieldRefs.current.set(field.id, el) }}
               onMouseUp={() => handleDragEnd(field.id)}
               className={`group p-3 rounded-lg border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-md transition-all relative flex items-center justify-between
                 ${connections.some(c => c.targetId === field.id) ? 'border-emerald-200 bg-emerald-50/50' : ''}
               `}
             >
                {/* Connector Dot */}
                <div className="absolute -left-1.5 w-3 h-3 bg-white border-2 border-slate-300 rounded-full group-hover:border-emerald-500 group-hover:bg-emerald-500 transition-colors" />
                
                <div>
                   <div className="text-sm font-medium text-slate-700 group-hover:text-emerald-700">{field.label}</div>
                   <div className="text-[10px] font-mono text-slate-400">{field.id}</div>
                </div>
                <div className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{field.type}</div>
             </div>
           ))}
        </div>

      </div>
    </div>
  );
}
