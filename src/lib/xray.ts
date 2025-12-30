// X-Ray SDK - Type-Safe SDK with Generics and Regression Mode
// Implements architectural patterns for production-ready AI debugging

import { Step, Trace, StepStatus } from '../types';
import { StorageInterface, FileStorageAdapter } from './storage';

/**
 * Step data with generics for type-safe input/output
 */
export interface TypedStepData<TInput = unknown, TOutput = unknown> {
  stepName: string;
  input: TInput;
  output: TOutput;
  reasoning: string;
  status: StepStatus;
}

/**
 * Regression check result
 */
export interface RegressionResult {
  hasRegression: boolean;
  changes: Array<{
    stepName: string;
    field: 'input' | 'output';
    previousStructure: string[];
    currentStructure: string[];
    addedKeys: string[];
    removedKeys: string[];
  }>;
}

/**
 * Get object keys recursively for structure comparison
 */
function getObjectStructure(obj: unknown, prefix = ''): string[] {
  if (obj === null || obj === undefined) return [];
  if (typeof obj !== 'object') return [prefix || 'value'];
  if (Array.isArray(obj)) {
    if (obj.length === 0) return [prefix + '[]'];
    return [prefix + '[]', ...getObjectStructure(obj[0], prefix + '[0]')];
  }
  
  const keys: string[] = [];
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    keys.push(fullKey);
    keys.push(...getObjectStructure((obj as Record<string, unknown>)[key], fullKey));
  }
  return keys;
}

/**
 * XRaySDK - Type-Safe Singleton with Adapter Pattern
 */
class XRaySDK {
  private static instance: XRaySDK;
  private currentTrace: Trace | null = null;
  private storage: StorageInterface;
  private regressionMode: boolean = false;
  private previousTraceStructure: Map<string, string[]> = new Map();

  private constructor(storage?: StorageInterface) {
    this.storage = storage || new FileStorageAdapter();
  }

  /**
   * Get singleton instance with optional custom storage adapter
   */
  static getInstance(storage?: StorageInterface): XRaySDK {
    if (!XRaySDK.instance) {
      XRaySDK.instance = new XRaySDK(storage);
    } else if (storage) {
      XRaySDK.instance.storage = storage;
    }
    return XRaySDK.instance;
  }

  /**
   * Configure storage adapter (demonstrates adapter pattern flexibility)
   */
  setStorage(storage: StorageInterface): void {
    this.storage = storage;
  }

  /**
   * Enable regression mode to detect structural changes
   */
  enableRegressionMode(): void {
    this.regressionMode = true;
  }

  /**
   * Disable regression mode
   */
  disableRegressionMode(): void {
    this.regressionMode = false;
    this.previousTraceStructure.clear();
  }

  /**
   * Start a new trace
   */
  startTrace(id: string, name: string): void {
    this.currentTrace = {
      id,
      name,
      timestamp: new Date().toISOString(),
      status: 'success',
      steps: [],
    };
  }

  /**
   * Add a type-safe step to the current trace
   * Singleton pattern for easy access
   * Uses generics to ensure type safety at compile time
   */
  addStep<TInput extends Record<string, unknown>, TOutput extends Record<string, unknown>>(
    stepData: TypedStepData<TInput, TOutput>
  ): void {
    if (!this.currentTrace) {
      throw new Error('No active trace. Call startTrace() first.');
    }

    const step: Step = {
      stepName: stepData.stepName,
      input: stepData.input,
      output: stepData.output,
      reasoning: stepData.reasoning,
      status: stepData.status,
      timestamp: new Date().toISOString(),
    };

    this.currentTrace.steps.push(step);

    // Update trace status if any step fails
    if (step.status === 'failure') {
      this.currentTrace.status = 'failure';
    }

    // Track structure for regression detection
    if (this.regressionMode) {
      const inputKey = `${stepData.stepName}.input`;
      const outputKey = `${stepData.stepName}.output`;
      this.previousTraceStructure.set(inputKey, getObjectStructure(stepData.input));
      this.previousTraceStructure.set(outputKey, getObjectStructure(stepData.output));
    }
  }

  /**
   * Check for structural regressions against a previous trace
   */
  async checkRegression(previousTraceId: string): Promise<RegressionResult> {
    if (!this.currentTrace) {
      return { hasRegression: false, changes: [] };
    }

    const previousTrace = await this.storage.getTrace(previousTraceId);
    if (!previousTrace) {
      return { hasRegression: false, changes: [] };
    }

    const changes: RegressionResult['changes'] = [];

    for (const currentStep of this.currentTrace.steps) {
      const previousStep = previousTrace.steps.find(s => s.stepName === currentStep.stepName);
      if (!previousStep) continue;

      // Compare input structure
      const prevInputStructure = getObjectStructure(previousStep.input);
      const currInputStructure = getObjectStructure(currentStep.input);
      const inputAdded = currInputStructure.filter(k => !prevInputStructure.includes(k));
      const inputRemoved = prevInputStructure.filter(k => !currInputStructure.includes(k));

      if (inputAdded.length > 0 || inputRemoved.length > 0) {
        changes.push({
          stepName: currentStep.stepName,
          field: 'input',
          previousStructure: prevInputStructure,
          currentStructure: currInputStructure,
          addedKeys: inputAdded,
          removedKeys: inputRemoved,
        });
      }

      // Compare output structure
      const prevOutputStructure = getObjectStructure(previousStep.output);
      const currOutputStructure = getObjectStructure(currentStep.output);
      const outputAdded = currOutputStructure.filter(k => !prevOutputStructure.includes(k));
      const outputRemoved = prevOutputStructure.filter(k => !currOutputStructure.includes(k));

      if (outputAdded.length > 0 || outputRemoved.length > 0) {
        changes.push({
          stepName: currentStep.stepName,
          field: 'output',
          previousStructure: prevOutputStructure,
          currentStructure: currOutputStructure,
          addedKeys: outputAdded,
          removedKeys: outputRemoved,
        });
      }
    }

    return {
      hasRegression: changes.length > 0,
      changes,
    };
  }

  /**
   * Save the current trace using the configured storage adapter
   */
  async save(): Promise<void> {
    if (!this.currentTrace) {
      throw new Error('No active trace to save.');
    }

    await this.storage.writeTrace(this.currentTrace);
    console.log(`✅ Trace "${this.currentTrace.id}" saved successfully.`);
    
    // Reset current trace
    this.currentTrace = null;
  }

  /**
   * Get current trace (for inspection)
   */
  getCurrentTrace(): Trace | null {
    return this.currentTrace;
  }

  /**
   * Set overall trace status
   */
  setTraceStatus(status: StepStatus): void {
    if (this.currentTrace) {
      this.currentTrace.status = status;
    }
  }

  /**
   * Get storage adapter (for advanced use cases)
   */
  getStorage(): StorageInterface {
    return this.storage;
  }
}

// Export singleton getter
export const xray = XRaySDK.getInstance();
export default XRaySDK;
