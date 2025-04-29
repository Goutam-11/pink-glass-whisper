
import React from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import useWebSocket from '../hooks/useWebSocket';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const ChatInterface: React.FC = () => {
  const { messages, isConnected, isLoading, sendMessage } = useWebSocket();
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile);

  return (
    <div className="h-screen w-full pink-gradient p-4 flex flex-col">
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          "transition-all duration-300 ease-in-out h-full",
          sidebarCollapsed ? "w-0 opacity-0" : "w-full md:w-1/3 lg:w-1/4 opacity-100"
        )}>
          {!sidebarCollapsed && (
            <Sidebar messages={messages} isConnected={isConnected} />
          )}
        </div>

        {/* Toggle sidebar button (only visible on mobile) */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-6 left-4 z-10 md:hidden glass"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>

        {/* Chat window */}
        <div className="flex-1 h-full">
          <ChatWindow 
            messages={messages} 
            onSendMessage={sendMessage} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
