
import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketMessageEvent, Message, ToolCall } from '../types';
import { toast } from '@/components/ui/sonner';

export const useWebSocket = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      const socket = new WebSocket('ws://localhost:3000');
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connection established');
        toast.success('Connected to AI agent');
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessageEvent;
          
          switch (data.type) {
            case 'message':
              if (data.data.role === 'ai') {
                setMessages(prevMessages => {
                  // Check if we're continuing an existing message stream
                  const existingIndex = prevMessages.findIndex(
                    m => m.id === data.data.id
                  );
                  
                  if (existingIndex >= 0) {
                    const updatedMessages = [...prevMessages];
                    updatedMessages[existingIndex] = {
                      ...updatedMessages[existingIndex],
                      content: data.data.content,
                    };
                    return updatedMessages;
                  } else {
                    // This is a new message
                    return [...prevMessages, data.data];
                  }
                });
                setIsLoading(false);
              } else {
                setMessages(prev => [...prev, data.data]);
              }
              break;
              
            case 'tool_call':
              setMessages(prevMessages => {
                const lastMessage = prevMessages[prevMessages.length - 1];
                if (lastMessage && lastMessage.role === 'ai') {
                  const updatedMessage = {
                    ...lastMessage,
                    toolCalls: [...(lastMessage.toolCalls || []), data.data]
                  };
                  return [...prevMessages.slice(0, -1), updatedMessage];
                }
                return prevMessages;
              });
              break;
              
            case 'error':
              console.error('WebSocket error:', data.data);
              toast.error(`Error: ${data.data.message || 'Unknown error'}`);
              break;
              
            case 'connection':
              console.log('Connection status:', data.data);
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket connection closed');
        toast.error('Disconnected from AI agent');
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 5000);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('WebSocket connection error');
      };

    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      toast.error('Failed to connect to AI agent');
      
      // Attempt to reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connect();
      }, 5000);
    }
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      toast.error('Not connected to AI agent');
      return;
    }

    const message: Message = {
      id: `user-${Date.now()}`,
      content,
      role: 'user',
      timestamp: Date.now()
    };

    // Add user message to state
    setMessages(prev => [...prev, message]);
    
    // Send message to WebSocket server
    socketRef.current.send(JSON.stringify({ type: 'message', data: message }));
    
    // Set loading state while waiting for response
    setIsLoading(true);
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    messages,
    isConnected,
    isLoading,
    sendMessage,
    connect,
    disconnect
  };
};

export default useWebSocket;
