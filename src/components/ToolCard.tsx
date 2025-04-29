
import React, { useState } from 'react';
import { ToolCall } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolCardProps {
  toolCall: ToolCall;
}

const ToolCard: React.FC<ToolCardProps> = ({ toolCall }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="glass-card mb-3 overflow-hidden animate-fade-in">
      <CardHeader className="p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            {toolCall.name}
          </CardTitle>
          <span className="text-xs text-gray-500">
            {expanded ? 'Hide' : 'Show'}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className={cn(
        "p-0 overflow-hidden transition-all duration-200",
        expanded ? "max-h-96" : "max-h-0"
      )}>
        <div className="p-3 text-sm space-y-2">
          {toolCall.parameters.map((param, index) => (
            <div key={`${param.name}-${index}`} className="space-y-1">
              <div className="font-medium text-xs text-gray-600">{param.name}</div>
              <div className="font-mono text-xs bg-white/70 p-2 rounded-md break-all">
                {param.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolCard;
