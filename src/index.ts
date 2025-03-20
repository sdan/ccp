export * from './types/message';
export * from './core/gitStorage';
export * from './core/messageManager';

// Re-export main classes for convenience
import { GitStorage } from './core/gitStorage';
import { MessageManager } from './core/messageManager';

export { GitStorage, MessageManager };
