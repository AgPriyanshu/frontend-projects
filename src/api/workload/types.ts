export type LoadStatus = "UNDER" | "HEALTHY" | "OVER";

export interface Employee {
  id: string;
  name: string;
  email: string;
  designation: string;
  capacity: number;
  manager: string | null;
  account: number | null;
  activeTaskCount: number;
  loadRatio: number;
  loadStatus: LoadStatus;
  createdAt: string;
  updatedAt: string;
}

export type EmployeeListResponse = Employee[];

export interface CreateEmployeePayload {
  name: string;
  email?: string;
  designation: string;
  capacity?: number;
  manager?: string | null;
}

export interface UpdateEmployeePayload {
  name?: string;
  email?: string;
  designation?: string;
  capacity?: number;
  manager?: string | null;
}

export type WorkItemStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface WorkItem {
  id: string;
  employee: string;
  title: string;
  status: WorkItemStatus;
  externalKey: string | null;
  url: string | null;
  createdAt: string;
  updatedAt: string;
}

export type WorkItemListResponse = WorkItem[];

export interface CreateWorkItemPayload {
  employee: string;
  title: string;
  status?: WorkItemStatus;
}

export interface UpdateWorkItemPayload {
  title?: string;
  status?: WorkItemStatus;
}
