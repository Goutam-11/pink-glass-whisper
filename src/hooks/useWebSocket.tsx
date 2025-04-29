
import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketMessageEvent, Message, ToolCall } from '../types';
import { toast } from '@/components/ui/sonner';
import { v4 as uuidv4 } from 'uuid';

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
          console.log('Received WebSocket message:', data);
          
          switch (data.type) {
            case 'message':
              // Handle AI message
              if (data.content) {
                const messageId = `ai-${Date.now()}`;
                
                setMessages(prevMessages => {
                  // Check if we already have a message from the AI that we should update
                  const lastMessage = prevMessages[prevMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'ai') {
                    // Update the existing message
                    const updatedMessages = [...prevMessages];
                    updatedMessages[prevMessages.length - 1] = {
                      ...lastMessage,
                      content: data.content
                    };
                    return updatedMessages;
                  } else {
                    // Add a new AI message
                    return [...prevMessages, {
                      id: messageId,
                      content: data.content,
                      role: 'ai',
                      timestamp: Date.now()
                    }];
                  }
                });
                
                setIsLoading(false);
              }
              break;
              
            case 'tools':
              // Parse tool call from content
              if (data.content) {
                try {
                  const toolData = JSON.parse(data.content);
                  
                  // Create a tool call object
                  const toolCall: ToolCall = {
                    id: toolData.id || uuidv4(),
                    name: toolData.name || "unknown_tool",
                    parameters: Object.entries(toolData.parameters || {}).map(([name, value]) => ({
                      name,
                      value: typeof value === 'string' ? value : JSON.stringify(value)
                    }))
                  };
                  
                  // Add the tool call to the last AI message or create a new one
                  setMessages(prevMessages => {
                    const lastMessage = prevMessages[prevMessages.length - 1];
                    if (lastMessage && lastMessage.role === 'ai') {
                      // Update the existing message with the tool call
                      const updatedMessage = {
                        ...lastMessage,
                        toolCalls: [...(lastMessage.toolCalls || []), toolCall]
                      };
                      return [...prevMessages.slice(0, -1), updatedMessage];
                    } else {
                      // Create a new AI message with the tool call
                      return [...prevMessages, {
                        id: `ai-${Date.now()}`,
                        content: '',
                        role: 'ai',
                        timestamp: Date.now(),
                        toolCalls: [toolCall]
                      }];
                    }
                  });
                } catch (error) {
                  console.error('Error parsing tool data:', error, data.content);
                  toast.error('Error processing tool response');
                }
              }
              break;
              
            case 'error':
              console.error('WebSocket error:', data);
              toast.error(`Error: ${data.content || 'Unknown error'}`);
              setIsLoading(false);
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
    
    // Send message to WebSocket server in the format the server expects
    socketRef.current.send(JSON.stringify({ 
      content, 
      sessionId: 'default-session' 
    }));
    
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
