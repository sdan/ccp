import * as fs from 'fs';
import * as path from 'path';
import { GitStorage } from '../core/gitStorage';
import { Message, MessageType } from '../types/message';

describe('GitStorage', () => {
  const testRepoPath = path.join(__dirname, '../../test-repo');
  let gitStorage: GitStorage;
  
  beforeEach(() => {
    // Create a fresh test repository for each test
    if (fs.existsSync(testRepoPath)) {
      fs.rmSync(testRepoPath, { recursive: true, force: true });
    }
    fs.mkdirSync(testRepoPath, { recursive: true });
    
    gitStorage = new GitStorage(testRepoPath);
  });
  
  afterEach(() => {
    // Clean up after tests
    if (fs.existsSync(testRepoPath)) {
      fs.rmSync(testRepoPath, { recursive: true, force: true });
    }
  });
  
  test('should store and retrieve a message', () => {
    const sessionId = 'test-session';
    const message: Message = {
      id: 'msg-test-001',
      type: MessageType.USER_INPUT,
      timestamp: Math.floor(Date.now() / 1000),
      content: 'Test message content',
      metadata: {
        test: 'metadata'
      }
    };
    
    const blobSha = gitStorage.storeMessage(sessionId, message);
    expect(blobSha).toBeTruthy();
    
    const retrievedMessage = gitStorage.getMessage(sessionId, message.id);
    expect(retrievedMessage).toEqual(message);
  });
  
  test('should add and retrieve metadata', () => {
    const sessionId = 'test-session';
    const message: Message = {
      id: 'msg-test-002',
      type: MessageType.LLM_OUTPUT,
      timestamp: Math.floor(Date.now() / 1000),
      content: 'Test message with metadata'
    };
    
    const blobSha = gitStorage.storeMessage(sessionId, message);
    const metadata = { confidence: 0.95, model: 'test-model' };
    
    gitStorage.addMetadata(blobSha, metadata);
    const retrievedMetadata = gitStorage.getMetadata(blobSha);
    
    expect(retrievedMetadata).toEqual(metadata);
  });
});
