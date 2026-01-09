import type { Task } from "../types";

export type TodoListItemProps = {
  task: Task;
  key: string;
};

type CheckedState = boolean | "indeterminate";

export interface CheckedChangeDetails {
  checked: CheckedState;
}
