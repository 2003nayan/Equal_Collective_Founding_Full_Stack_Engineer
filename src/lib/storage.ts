// X-Ray SDK - Storage Interface and Adapters
// Implements the Adapter Pattern for scalable storage backends

import * as fs from 'fs';
import * as path from 'path';
import { Trace, TracesData } from '../types';

/**
 * StorageInterface - Abstract interface for trace storage
 * Allows swapping between different storage backends (File, PostgreSQL, S3, etc.)
 */
export interface StorageInterface {
  /**
   * Read all traces from storage
   */
  readTraces(): Promise<TracesData>;
  
  /**
   * Write a new trace to storage
   */
  writeTrace(trace: Trace): Promise<void>;
  
  /**
   * Get a specific trace by ID
   */
  getTrace(traceId: string): Promise<Trace | null>;
  
  /**
   * Delete a trace by ID
   */
  deleteTrace(traceId: string): Promise<boolean>;
  
  /**
   * Check if storage is available/connected
   */
  isAvailable(): Promise<boolean>;
}

/**
 * FileStorageAdapter - Stores traces in a local JSON file
 * Perfect for development and CLI tools
 */
export class FileStorageAdapter implements StorageInterface {
  private filePath: string;
  
  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), 'data', 'traces.json');
  }
  
  private ensureDirectory(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  async readTraces(): Promise<TracesData> {
    try {
      if (!fs.existsSync(this.filePath)) {
        return { traces: [] };
      }
      const content = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error reading traces:', error);
      return { traces: [] };
    }
  }
  
  async writeTrace(trace: Trace): Promise<void> {
    this.ensureDirectory();
    const data = await this.readTraces();
    data.traces.push(trace);
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }
  
  async getTrace(traceId: string): Promise<Trace | null> {
    const data = await this.readTraces();
    return data.traces.find(t => t.id === traceId) || null;
  }
  
  async deleteTrace(traceId: string): Promise<boolean> {
    const data = await this.readTraces();
    const initialLength = data.traces.length;
    data.traces = data.traces.filter(t => t.id !== traceId);
    if (data.traces.length !== initialLength) {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
      return true;
    }
    return false;
  }
  
  async isAvailable(): Promise<boolean> {
    try {
      this.ensureDirectory();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * MemoryStorageAdapter - In-memory storage for testing
 */
export class MemoryStorageAdapter implements StorageInterface {
  private traces: Trace[] = [];
  
  async readTraces(): Promise<TracesData> {
    return { traces: [...this.traces] };
  }
  
  async writeTrace(trace: Trace): Promise<void> {
    this.traces.push(trace);
  }
  
  async getTrace(traceId: string): Promise<Trace | null> {
    return this.traces.find(t => t.id === traceId) || null;
  }
  
  async deleteTrace(traceId: string): Promise<boolean> {
    const initialLength = this.traces.length;
    this.traces = this.traces.filter(t => t.id !== traceId);
    return this.traces.length !== initialLength;
  }
  
  async isAvailable(): Promise<boolean> {
    return true;
  }
  
  clear(): void {
    this.traces = [];
  }
}

/**
 * PostgresStorageAdapter - Example interface for PostgreSQL
 * Not implemented, but demonstrates the pattern
 */
export abstract class PostgresStorageAdapter implements StorageInterface {
  abstract readTraces(): Promise<TracesData>;
  abstract writeTrace(trace: Trace): Promise<void>;
  abstract getTrace(traceId: string): Promise<Trace | null>;
  abstract deleteTrace(traceId: string): Promise<boolean>;
  abstract isAvailable(): Promise<boolean>;
}

// Export default adapter
export const createDefaultStorage = (): StorageInterface => {
  return new FileStorageAdapter();
};
