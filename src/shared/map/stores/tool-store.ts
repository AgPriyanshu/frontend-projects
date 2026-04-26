import { makeAutoObservable, reaction } from "mobx";

import type { DrawMode } from "../domain";
import type { IDrawEngine } from "../engines/ports";

/**
 * MobX store for draw tool state.
 * Syncs activeTool with IDrawEngine.
 */
export class ToolStore {
  activeTool: DrawMode | null = null;

  private engine: IDrawEngine | null = null;
  private disposeReaction: (() => void) | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Binds the store to an engine and sets up sync.
   */
  bind(engine: IDrawEngine): void {
    this.engine = engine;

    // MobX → Engine: Update engine mode when activeTool changes.
    this.disposeReaction = reaction(
      () => this.activeTool,
      (tool) => {
        this.engine?.setMode(tool);
      }
    );
  }

  /**
   * Sets the active draw tool.
   */
  setTool(tool: DrawMode): void {
    this.activeTool = tool;
  }

  /**
   * Clears the active tool (sets to null/static).
   */
  clearTool(): void {
    this.activeTool = null;
  }

  /**
   * Toggles a tool on/off.
   */
  toggleTool(tool: DrawMode): void {
    if (this.activeTool === tool) {
      this.clearTool();
    } else {
      this.setTool(tool);
    }
  }

  /**
   * Checks if a specific tool is active.
   */
  isToolActive(tool: DrawMode): boolean {
    return this.activeTool === tool;
  }

  /**
   * Cleans up subscriptions.
   */
  destroy(): void {
    this.disposeReaction?.();
    this.engine = null;
  }
}
