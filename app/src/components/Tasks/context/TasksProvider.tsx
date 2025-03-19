import React, { useState, useMemo, useEffect } from 'react';
import { TasksContext } from './TasksContext';
import { Task, TaskStatus, Subject } from '../types';

interface StoredTask {
  id: number;
  title: string;
  status: TaskStatus;
  subject: Subject;
  startDateTime: string;
  endDateTime: string;
  url?: string;
}

// Convert stored task format to runtime format
const convertStoredTaskToTask = (storedTask: StoredTask): Task => ({
  ...storedTask,
  startDateTime: new Date(storedTask.startDateTime),
  endDateTime: new Date(storedTask.endDateTime),
});

const TasksProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // WebView states
  const [webViewUrl, setWebViewUrl] = useState("");
  const [isWebViewOpen, setIsWebViewOpen] = useState(false);
  
  // Task editing states
  const [taskEditing, setTaskEditing] = useState<Task | null>(null);
  const [isTaskEditOpen, setIsTaskEditOpen] = useState(false);

  // Load tasks from electron Store
  useEffect(() => {
    (async () => {
      try {
        if (await window.storeApi.has('tasks')) {
          const storedTasks = await window.storeApi.get('tasks') as StoredTask[];
          const tasksWithDates = storedTasks.map(convertStoredTaskToTask);
          setTasks(tasksWithDates);
        }
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Save tasks to electron Store
  useEffect(() => {
    if (!loading) {
      window.storeApi.set('tasks', tasks).catch(error => {
        console.error('Failed to save tasks:', error);
      });
    }
  }, [tasks, loading]);

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const updateTask = (taskId: number, updated: Partial<Task>) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, ...updated } : t))
    );
  };

  const deleteTask = (taskId: number) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // WebView related methods
  const openWebView = (url: string) => {
    setWebViewUrl(url);
    setIsWebViewOpen(true);
  };

  const closeWebView = () => {
    setWebViewUrl("");
    setIsWebViewOpen(false);
  };

  // Task editing related methods
  const openTaskEdit = (taskId?: number) => {
    if (!taskId) {
      setTaskEditing(null);
      setIsTaskEditOpen(true);
      return;
    }
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setTaskEditing(task);
      setIsTaskEditOpen(true);
    }
  };

  const closeTaskEdit = () => {
    setTaskEditing(null);
    setIsTaskEditOpen(false);
  };

  // Cache context value
  // Note: Function references (addTask, updateTask, etc.) are stable and don't need
  // to be included in the dependency array as they don't change between renders
  const value = useMemo(() => ({
    // Task management
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    setTasks,
    
    // WebView related states and methods
    webViewUrl,
    isWebViewOpen,
    openWebView,
    closeWebView,
    
    // Task editing related states and methods
    taskEditing,
    isTaskEditOpen,
    openTaskEdit,
    closeTaskEdit,
  }), [
    tasks,
    loading,
    webViewUrl,
    isWebViewOpen,
    taskEditing,
    isTaskEditOpen
  ]);

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
};

export default TasksProvider;
