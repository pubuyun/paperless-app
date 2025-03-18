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

const TasksProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([] as Task[]);
  const [loading, setLoading] = useState(true);
  const [webViewUrl, setWebViewUrl] = useState("");
  const [isWebViewOpen, setIsWebViewOpen] = useState(false);
  // load tasks from electron Store
  useEffect(() => {
    (async () => {
      if (await window.storeApi.has('tasks')) {
        const storedTasks = await window.storeApi.get('tasks') as StoredTask[];
        // convert date strings to Date objects
        const tasksWithDates = storedTasks.map((task) => ({
          ...task,
          startDateTime: new Date(task.startDateTime),
          endDateTime: new Date(task.endDateTime)
        }));
        setTasks(tasksWithDates);
      }
      setLoading(false);
    })();
  }, []);

  // save tasks in electron Store 
  useEffect(() => {
    if (!loading) window.storeApi.set('tasks', tasks);
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

  const openWebView = (url: string) => {
    setWebViewUrl(url);
    setIsWebViewOpen(true);
  };

  const closeWebView = () => {
    setIsWebViewOpen(false);
    setWebViewUrl("");
  };

  const value = useMemo(() => ({
    tasks,
    addTask,
    updateTask,
    deleteTask,
    setTasks,
    // WebView相关状态和方法
    webViewUrl,
    isWebViewOpen,
    openWebView,
    closeWebView
  }), [tasks, webViewUrl, isWebViewOpen]);

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
};

export default TasksProvider;
