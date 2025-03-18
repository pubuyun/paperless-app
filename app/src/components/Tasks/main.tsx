import React from 'react';
import TasksProvider from './context/TasksProvider';
import TodoMain from './TodoMain';

const Tasks: React.FC = () => {
  return (
    <TasksProvider>
      <TodoMain />
    </TasksProvider>
  );
};

export default Tasks;
