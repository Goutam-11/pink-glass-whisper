
import React from 'react';
import { Message } from '../types';
import ToolCard from './ToolCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  messages: Message[];
  isConnected: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ messages, isConnected }) => {
  // Extract all tool calls from messages
  const toolCalls = messages
    .filter(msg => msg.role === 'ai' && msg.toolCalls && msg.toolCalls.length > 0)
    .flatMap(msg => msg.toolCalls || []);

  return (
    <div className="h-full flex flex-col glass rounded-xl">
      <div className="p-4 border-b border-white/20">
        <h2 className="text-lg font-semibold">Agent Tools</h2>
        <div className="flex items-center mt-2">
          <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-3">
        {toolCalls.length > 0 ? (
          <div className="space-y-3">
            {toolCalls.map(toolCall => (
              <ToolCard key={toolCall.id} toolCall={toolCall} />
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm p-4 text-center">
            No tool calls yet. Ask the AI to use tools in your conversation.
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
