import React from 'react';

export type Connection = { sourceId: string; targetId: string };

interface ConnectionLayerProps {
  connections: Connection[];
  dragSource: string | null;
  mousePos: { x: number; y: number } | null;
  getCoords: (id: string, side: 'right' | 'left') => { x: number; y: number };
}

export default function ConnectionLayer({ connections, dragSource, mousePos, getCoords }: ConnectionLayerProps) {
  return (
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
  );
}
