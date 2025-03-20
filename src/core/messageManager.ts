import { v4 as uuidv4 } from 'uuid';
import { GitStorage } from './gitStorage';
import { Message, MessageType, AnthropicMessage, OpenAIMessage } from '../types/message';

/**
 * MessageManager class for handling conversation operations
 */
export class MessageManager {
  private gitStorage: GitStorage;

  /**
   * Create a new MessageManager instance
   * @param gitStorage GitStorage instance
   */
  constructor(gitStorage: GitStorage) {
    this.gitStorage = gitStorage;
  }

  /**
   * Create a new message
   * @param sessionId Session identifier
   * @param type Message type
   * @param content Message content
   * @param metadata Optional metadata
   * @returns The created message
   */
  public createMessage(
    sessionId: string,
    type: MessageType,
    content: string,
    metadata?: Record<string, any>
  ): Message {
    const message: Message = {
      id: `msg-${uuidv4().substring(0, 8)}`,
      type,
      timestamp: Math.floor(Date.now() / 1000),
      content,
      metadata
    };

    const blobSha = this.gitStorage.storeMessage(sessionId, message);

    if (metadata) {
      this.gitStorage.addMetadata(blobSha, metadata);
    }

    return message;
  }

  /**
   * Get a message by its ID
   * @param sessionId Session identifier
   * @param messageId Message identifier
   * @returns The retrieved message
   */
  public getMessage(sessionId: string, messageId: string): Message {
    return this.gitStorage.getMessage(sessionId, messageId);
  }

  /**
   * Create a branch for an alternative conversation path
   * @param sessionId Original session identifier
   * @param messageId Message identifier to branch from
   * @param newSessionId New session identifier
   */
  public createBranch(sessionId: string, messageId: string, newSessionId: string): void {
    const ref = `refs/conversations/${sessionId}/${messageId}`;
    const cmd = `git branch session-${newSessionId} ${ref}`;
    
    try {
      require('child_process').execSync(cmd, { 
        cwd: process.cwd() 
      });
    } catch (error) {
      throw new Error(`Failed to create branch: ${error}`);
    }
  }

  /**
   * Convert from Anthropic message format to CCP format
   * @param anthropicMessage Anthropic message
   * @returns CCP message
   */
  public fromAnthropicMessage(anthropicMessage: AnthropicMessage): Omit<Message, 'id' | 'timestamp'> {
    let type: MessageType;
    switch (anthropicMessage.role) {
      case 'assistant':
        type = MessageType.LLM_OUTPUT;
        break;
      case 'user':
        type = MessageType.USER_INPUT;
        break;
      default:
        type = MessageType.USER_INPUT;
    }

    let content: string;
    if (typeof anthropicMessage.content === 'string') {
      content = anthropicMessage.content;
    } else {
      // Extract text content from array format
      content = anthropicMessage.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');
    }

    return {
      type,
      content,
      metadata: {
        ...anthropicMessage.metadata,
        model: anthropicMessage.model,
        temperature: anthropicMessage.temperature,
        max_tokens: anthropicMessage.max_tokens
      }
    };
  }

  /**
   * Convert from OpenAI message format to CCP format
   * @param openaiMessage OpenAI message
   * @returns CCP message
   */
  public fromOpenAIMessage(openaiMessage: OpenAIMessage): Omit<Message, 'id' | 'timestamp'> {
    let type: MessageType;
    switch (openaiMessage.role) {
      case 'assistant':
        type = MessageType.LLM_OUTPUT;
        break;
      case 'user':
        type = MessageType.USER_INPUT;
        break;
      case 'function':
      case 'tool':
        type = MessageType.TOOL_USAGE;
        break;
      default:
        type = MessageType.USER_INPUT;
    }

    return {
      type,
      content: openaiMessage.content || '',
      metadata: {
        role: openaiMessage.role,
        name: openaiMessage.name,
        function_call: openaiMessage.function_call,
        tool_calls: openaiMessage.tool_calls
      }
    };
  }
}
