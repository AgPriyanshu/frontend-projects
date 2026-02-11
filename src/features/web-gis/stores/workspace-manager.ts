import { makeAutoObservable } from "mobx";

import { WorkspaceStore } from "./workspace-store";

/**
 * Global manager for multiple workspace instances.
 * Manages workspace lifecycle and provides access by ID.
 */
class WorkspaceManager {
  workspaces = new Map<string, WorkspaceStore>();
  activeWorkspaceId: string | null = null;

  constructor() {
    makeAutoObservable(this, {
      workspaces: false,
    });
  }

  /**
   * Creates a new workspace with the given ID.
   */
  createWorkspace(id: string): WorkspaceStore {
    if (this.workspaces.has(id)) {
      console.warn(`Workspace ${id} already exists`);
      return this.workspaces.get(id)!;
    }

    const workspace = new WorkspaceStore(id);

    this.workspaces.set(id, workspace);

    // Set as active if it's the first workspace.
    if (this.workspaces.size === 1) {
      this.activeWorkspaceId = id;
    }

    return workspace;
  }

  /**
   * Gets a workspace by ID.
   */
  getWorkspace(id: string): WorkspaceStore | undefined {
    return this.workspaces.get(id);
  }

  /**
   * Gets or creates a workspace.
   */
  getOrCreateWorkspace(id: string): WorkspaceStore {
    return this.workspaces.get(id) ?? this.createWorkspace(id);
  }

  /**
   * Sets the active workspace.
   */
  setActiveWorkspace(id: string): void {
    if (!this.workspaces.has(id)) {
      console.warn(`Workspace ${id} does not exist`);
      return;
    }
    this.activeWorkspaceId = id;
  }

  /**
   * Gets the currently active workspace.
   */
  get activeWorkspace(): WorkspaceStore | null {
    return this.activeWorkspaceId
      ? (this.workspaces.get(this.activeWorkspaceId) ?? null)
      : null;
  }

  /**
   * Gets all workspace IDs.
   */
  get workspaceIds(): string[] {
    return Array.from(this.workspaces.keys());
  }

  /**
   * Gets the number of workspaces.
   */
  get workspaceCount(): number {
    return this.workspaces.size;
  }

  /**
   * Closes and destroys a workspace.
   */
  closeWorkspace(id: string): void {
    const workspace = this.workspaces.get(id);
    if (!workspace) return;

    workspace.destroy();
    this.workspaces.delete(id);

    // Update active workspace if needed.
    if (this.activeWorkspaceId === id) {
      const remaining = this.workspaceIds;
      this.activeWorkspaceId = remaining.length > 0 ? remaining[0] : null;
    }
  }

  /**
   * Closes all workspaces.
   */
  closeAll(): void {
    for (const id of this.workspaceIds) {
      this.closeWorkspace(id);
    }
  }
}

/**
 * Global workspace manager singleton.
 */
export const workspaceManager = new WorkspaceManager();
