
import React, { useState } from 'react';
import { Message, ToolCall } from '../types';
import ReactMarkdown from 'react-markdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  message: Message;
}

const ToolCallDetails: React.FC<{ toolCall: ToolCall }> = ({ toolCall }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-2 mb-1">
      <div 
        className="flex items-center gap-2 bg-white/40 p-2 rounded-lg cursor-pointer hover:bg-white/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <Badge variant="outline" className="bg-pink-50 text-pink-800 border-pink-200">
          {toolCall.name}
        </Badge>
        <span className="text-xs text-gray-500">
          {expanded ? 'Hide details' : 'Show details'}
        </span>
      </div>
      
      {expanded && (
        <div className="ml-6 mt-2 p-3 bg-white/30 rounded-lg border border-gray-100 text-sm">
          <div className="font-medium mb-2 text-gray-700">Parameters:</div>
          <div className="space-y-1">
            {toolCall.parameters.map((param) => (
              <div key={param.name} className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                  {param.name}:
                </span>
                <span className="font-mono text-xs bg-white px-2 py-1 rounded break-all">
                  {param.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isAi = message.role === 'ai';
  
  return (
    <div className={cn(
      "w-full max-w-3xl mb-4",
      isAi ? "mr-auto" : "ml-auto"
    )}>
      <div className={cn(
        isAi ? "chat-bubble-ai" : "chat-bubble-user",
        isAi ? "glow-border" : "",
        "overflow-hidden"
      )}>
        {isAi ? (
          <div className="markdown-content">
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">
            {message.content}
          </div>
        )}
      </div>
      
      {/* Tool calls section */}
      {isAi && message.toolCalls && message.toolCalls.length > 0 && (
        <div className="mt-1 space-y-1">
          {message.toolCalls.map((toolCall) => (
            <ToolCallDetails key={toolCall.id} toolCall={toolCall} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
