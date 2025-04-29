
export type MessageRole = 'user' | 'ai';

export interface ToolParameter {
  name: string;
  value: string;
}

export interface ToolCall {
  id: string;
  name: string;
  parameters: ToolParameter[];
}

export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: number;
  toolCalls?: ToolCall[];
}

export interface WebSocketMessageEvent {
  type: 'message' | 'tool_call' | 'error' | 'connection';
  data: any;
}
