import { makeAutoObservable } from "mobx";

import type { ProcessingToolDefinition } from "api/web-gis";

/**
 * MobX store for the geoprocessing modal UI state.
 *
 * Lifted out of `ProcessingBar`'s local `useState` so that an external
 * agent action (`OpenProcessingToolAction`) can open and pre-fill the modal
 * without needing a React ref or event bus.
 */
export class ProcessingUIStore {
  /** The tool currently shown in the modal, or `null` when closed. */
  selectedTool: ProcessingToolDefinition | null = null;

  /**
   * Pre-filled default values injected by the agent action.
   * Keys match the form field names used by `ProcessingJobModal`
   * (e.g. `{ inputDatasetId: "uuid", distance: 50, units: "meters" }`).
   */
  defaultValues: Record<string, unknown> = {};

  /**
   * When true the modal will auto-submit after a 1-second preview delay,
   * giving the user a chance to see the pre-filled options before the job runs.
   */
  autoSubmit: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Opens the processing modal for the given tool, optionally pre-filling
   * form fields with `defaults` and opting into auto-submit behaviour.
   */
  openTool(
    tool: ProcessingToolDefinition,
    defaults: Record<string, unknown> = {},
    autoSubmit = false
  ): void {
    this.selectedTool = tool;
    this.defaultValues = defaults;
    this.autoSubmit = autoSubmit;
  }

  /**
   * Closes the modal and clears any pre-filled defaults.
   */
  close(): void {
    this.selectedTool = null;
    this.defaultValues = {};
    this.autoSubmit = false;
  }
}
