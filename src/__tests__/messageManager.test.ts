import { GitStorage } from '../core/gitStorage';
import { MessageManager } from '../core/messageManager';
import { MessageType, AnthropicMessage, OpenAIMessage } from '../types/message';
import * as path from 'path';
import * as fs from 'fs';

describe('MessageManager', () => {
  const testRepoPath = path.join(__dirname, '../../test-repo');
  let gitStorage: GitStorage;
  let messageManager: MessageManager;
  
  beforeEach(() => {
    // Create a fresh test repository for each test
    if (fs.existsSync(testRepoPath)) {
      fs.rmSync(testRepoPath, { recursive: true, force: true });
    }
    fs.mkdirSync(testRepoPath, { recursive: true });
    
    gitStorage = new GitStorage(testRepoPath);
    messageManager = new MessageManager(gitStorage);
  });
  
  afterEach(() => {
    // Clean up after tests
    if (fs.existsSync(testRepoPath)) {
      fs.rmSync(testRepoPath, { recursive: true, force: true });
    }
  });
  
  test('should create and retrieve a message', () => {
    const sessionId = 'test-session';
    const content = 'Test message content';
    const metadata = { test: 'metadata' };
    
    const message = messageManager.createMessage(
      sessionId,
      MessageType.USER_INPUT,
      content,
      metadata
    );
    
    expect(message.id).toBeTruthy();
    expect(message.type).toBe(MessageType.USER_INPUT);
    expect(message.content).toBe(content);
    expect(message.metadata).toEqual(metadata);
    
    const retrievedMessage = messageManager.getMessage(sessionId, message.id);
    expect(retrievedMessage).toEqual(message);
  });
  
  test('should convert from Anthropic message format', () => {
    const anthropicMessage: AnthropicMessage = {
      role: 'assistant',
      content: 'Test Anthropic message',
      model: 'claude-3',
      temperature: 0.7
    };
    
    const ccpMessage = messageManager.fromAnthropicMessage(anthropicMessage);
    
    expect(ccpMessage.type).toBe(MessageType.LLM_OUTPUT);
    expect(ccpMessage.content).toBe('Test Anthropic message');
    expect(ccpMessage.metadata?.model).toBe('claude-3');
    expect(ccpMessage.metadata?.temperature).toBe(0.7);
  });
  
  test('should convert from OpenAI message format', () => {
    const openaiMessage: OpenAIMessage = {
      role: 'assistant',
      content: 'Test OpenAI message',
      name: 'gpt-4'
    };
    
    const ccpMessage = messageManager.fromOpenAIMessage(openaiMessage);
    
    expect(ccpMessage.type).toBe(MessageType.LLM_OUTPUT);
    expect(ccpMessage.content).toBe('Test OpenAI message');
    expect(ccpMessage.metadata?.role).toBe('assistant');
    expect(ccpMessage.metadata?.name).toBe('gpt-4');
  });
});
