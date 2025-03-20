# Chat Context Protocol (CCP)

A TypeScript implementation of the Chat Context Protocol (CCP) that efficiently manages, versions, and tracks conversational data using Git's object database.

## Features

- **Git-Based Storage**: Store each message as a JSON blob in Git's object database
- **Conversation Versioning**: Use Git refs to organize conversation steps and support branching
- **Metadata Support**: Attach metadata to blobs using Git notes
- **Logical Structure**: Organize sessions within a clear directory hierarchy
- **API Compatibility**: Compatible with Anthropic and OpenAI message formats
- **TypeScript Support**: Full TypeScript typing for better development experience

## Installation

```bash
npm install ccp
```

## Usage

### Basic Usage

```typescript
import { GitStorage, MessageManager, MessageType } from 'ccp';

// Initialize the storage with a repository path
const gitStorage = new GitStorage('./conversations-repo');

// Create a message manager
const messageManager = new MessageManager(gitStorage);

// Create a new session
const sessionId = 'session-abc123';

// Store a message
const message = messageManager.createMessage(
  sessionId,
  MessageType.USER_INPUT,
  'How does Git store objects?',
  { confidence: 0.95 }
);

// Retrieve a message
const retrievedMessage = messageManager.getMessage(sessionId, message.id);
console.log(retrievedMessage);
```

### Working with Anthropic Messages

```typescript
import { GitStorage, MessageManager, AnthropicMessage } from 'ccp';

const gitStorage = new GitStorage('./conversations-repo');
const messageManager = new MessageManager(gitStorage);
const sessionId = 'session-anthropic';

// Convert from Anthropic format
const anthropicMessage: AnthropicMessage = {
  role: 'assistant',
  content: 'Git stores objects in a content-addressable filesystem.',
  model: 'claude-3-opus-20240229',
  temperature: 0.7
};

// Convert and store
const ccpMessageData = messageManager.fromAnthropicMessage(anthropicMessage);
const message = messageManager.createMessage(
  sessionId,
  ccpMessageData.type,
  ccpMessageData.content,
  ccpMessageData.metadata
);
```

### Working with OpenAI Messages

```typescript
import { GitStorage, MessageManager, OpenAIMessage } from 'ccp';

const gitStorage = new GitStorage('./conversations-repo');
const messageManager = new MessageManager(gitStorage);
const sessionId = 'session-openai';

// Convert from OpenAI format
const openaiMessage: OpenAIMessage = {
  role: 'assistant',
  content: 'Git uses a content-addressable filesystem to store objects.',
  name: 'gpt-4'
};

// Convert and store
const ccpMessageData = messageManager.fromOpenAIMessage(openaiMessage);
const message = messageManager.createMessage(
  sessionId,
  ccpMessageData.type,
  ccpMessageData.content,
  ccpMessageData.metadata
);
```

### Branching Conversations

```typescript
import { GitStorage, MessageManager, MessageType } from 'ccp';

const gitStorage = new GitStorage('./conversations-repo');
const messageManager = new MessageManager(gitStorage);

// Original session
const originalSessionId = 'session-original';
const message = messageManager.createMessage(
  originalSessionId,
  MessageType.USER_INPUT,
  'What is Git?'
);

// Create a branch from this message
const newSessionId = 'session-branch';
messageManager.createBranch(originalSessionId, message.id, newSessionId);

// Continue the conversation in the new branch
messageManager.createMessage(
  newSessionId,
  MessageType.LLM_OUTPUT,
  'Git is a distributed version control system.'
);
```

## Repository Structure

The conversations are stored in a clear directory hierarchy:

```
conversations/
├── session-abc123/
│   ├── msg-0001.json
│   ├── msg-0002.json
│   └── metadata.json
└── session-xyz789/
    ├── msg-0001.json
    └── msg-0002.json
```

## License

MIT
