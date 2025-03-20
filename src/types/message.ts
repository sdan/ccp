/**
 * Base message interface for the Chat Context Protocol
 */
export interface Message {
  id: string;
  type: MessageType;
  timestamp: number;
  content: string;
  metadata?: Record<string, any>;
}

/**
 * Message types supported by the protocol
 */
export enum MessageType {
  LLM_OUTPUT = 'llm-output',
  USER_INPUT = 'user-input',
  TOOL_USAGE = 'tool-usage'
}

/**
 * Anthropic message format compatibility
 * Based on https://docs.anthropic.com/en/api/messages
 */
export interface AnthropicMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | AnthropicContent[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  metadata?: Record<string, any>;
}

export interface AnthropicContent {
  type: 'text' | 'image';
  text?: string;
  source?: {
    type: 'base64' | 'url';
    media_type: string;
    data: string;
  };
}

/**
 * OpenAI message format compatibility
 * Based on OpenAI API documentation
 */
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant' | 'function' | 'tool';
  content: string | null;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
  tool_calls?: {
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }[];
}
