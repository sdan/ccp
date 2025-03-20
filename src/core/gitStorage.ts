import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Message } from '../types/message';

/**
 * GitStorage class for handling Git operations
 */
export class GitStorage {
  private repoPath: string;

  /**
   * Create a new GitStorage instance
   * @param repoPath Path to the Git repository
   */
  constructor(repoPath: string) {
    this.repoPath = repoPath;
    this.ensureRepoExists();
  }

  /**
   * Ensure the Git repository exists
   */
  private ensureRepoExists(): void {
    if (!fs.existsSync(path.join(this.repoPath, '.git'))) {
      execSync('git init', { cwd: this.repoPath });
    }
  }

  /**
   * Store a message as a Git blob
   * @param sessionId Session identifier
   * @param message Message to store
   * @returns SHA of the stored blob
   */
  public storeMessage(sessionId: string, message: Message): string {
    const sessionDir = path.join(this.repoPath, 'conversations', sessionId);
    fs.mkdirSync(sessionDir, { recursive: true });

    const filePath = path.join(sessionDir, `${message.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(message, null, 2));

    // Create a Git blob and get its SHA
    const blobSha = execSync(`git hash-object -w "${filePath}"`, { 
      cwd: this.repoPath 
    }).toString().trim();

    // Create a Git reference for the message
    this.updateRef(`refs/conversations/${sessionId}/${message.id}`, blobSha);

    return blobSha;
  }

  /**
   * Retrieve a message by its reference
   * @param sessionId Session identifier
   * @param messageId Message identifier
   * @returns The retrieved message
   */
  public getMessage(sessionId: string, messageId: string): Message {
    const ref = `refs/conversations/${sessionId}/${messageId}`;
    const blobSha = this.getRef(ref);
    
    if (!blobSha) {
      throw new Error(`Message ${messageId} not found in session ${sessionId}`);
    }

    const messageJson = execSync(`git cat-file -p ${blobSha}`, { 
      cwd: this.repoPath 
    }).toString();
    
    return JSON.parse(messageJson);
  }

  /**
   * Add metadata to a message using Git notes
   * @param blobSha SHA of the blob
   * @param metadata Metadata to add
   */
  public addMetadata(blobSha: string, metadata: Record<string, any>): void {
    const metadataJson = JSON.stringify(metadata);
    execSync(`git notes add -m '${metadataJson}' ${blobSha}`, { 
      cwd: this.repoPath 
    });
  }

  /**
   * Get metadata for a message
   * @param blobSha SHA of the blob
   * @returns The metadata or null if not found
   */
  public getMetadata(blobSha: string): Record<string, any> | null {
    try {
      const notes = execSync(`git notes show ${blobSha}`, { 
        cwd: this.repoPath 
      }).toString();
      return JSON.parse(notes);
    } catch (error) {
      return null;
    }
  }

  /**
   * Update a Git reference
   * @param ref Reference name
   * @param sha SHA to point to
   */
  private updateRef(ref: string, sha: string): void {
    execSync(`git update-ref ${ref} ${sha}`, { cwd: this.repoPath });
  }

  /**
   * Get a Git reference
   * @param ref Reference name
   * @returns SHA the reference points to or null if not found
   */
  private getRef(ref: string): string | null {
    try {
      return execSync(`git rev-parse ${ref}`, { 
        cwd: this.repoPath 
      }).toString().trim();
    } catch (error) {
      return null;
    }
  }
}
