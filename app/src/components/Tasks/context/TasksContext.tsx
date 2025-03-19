import React from 'react';
import { Task } from '../types';

export type TasksContextType = {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (taskId: number, updatedTask: Partial<Task>) => void;
  deleteTask: (taskId: number) => void;
  setTasks: (tasks: Task[]) => void;
  // WebView相关状态
  webViewUrl: string;
  isWebViewOpen: boolean;
  openWebView: (url: string) => void;
  closeWebView: () => void;
  // Task编辑相关状态
  taskEditing: Task | null;
  isTaskEditOpen: boolean;
  openTaskEdit: (taskId?: number) => void;
  closeTaskEdit: () => void;
};

export const TasksContext = React.createContext<TasksContextType | undefined>(undefined);
