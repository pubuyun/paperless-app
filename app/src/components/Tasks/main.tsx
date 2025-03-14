import { Box } from '@mui/joy';
import React from 'react';
import Tasklist from './components/TaskList';
import { Task, TaskStatus, TimeSelector } from './types';
import SelectButtons from './components/SelectButtons';
import TimeSelectButtons from './components/TimeSelectButtons';
import CircularProgressBar from './components/CircularProgressBar';
import DayCalendar from './components/DayCalendar';

function TodoMain() {
  const [selected, setSelected] = React.useState<TaskStatus|"ALL">('ALL');
  const [timeSelected, setTimeSelected] = React.useState<TimeSelector | null>(null);
  const tasks = [
    {
        id: 1,
        title: 'Math Homework',
        status: 'NOT_STARTED',
        done: false,
        subject: 'MATH',
        startDateTime: new Date('2022-01-01T09:00:00'),
        endDateTime: new Date('2026-01-01T10:00:00'),
        url: 'https://example.com'
    },
    {
        id: 2,
        title: 'English Essay',
        status: 'IN_PROGRESS',
        done: false,
        subject: 'ENGLISH',
        startDateTime: new Date('2022-01-01T10:00:00'),
        endDateTime: new Date('2026-01-01T12:00:00'),
        url: 'https://example.com'
    },
    {
        id: 3,
        title: 'Physics Lab',
        status: 'STUCK',
        done: false,
        subject: 'PHYSICS',
        startDateTime: new Date('2022-01-01T12:00:00'),
        endDateTime: new Date('2025-03-14T14:00:00'),
        url: 'https://example.com'
    },
] as Task[];

  return (
    <Box className="todo-main" sx={ { display: 'flex', flexGrow: 1, background: 'radial-gradient(circle at center, rgba(150,150,150,0.8) 0%, rgba(0,0,0,0) 70%)', } }>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Tasklist tasks={tasks} selected={selected} timeSelected={timeSelected}/>
        </Box>
        <Box sx={ { display: 'flex', flexDirection: "column", gap: 2, flexGrow: 1, margin: 4} }>
            <SelectButtons Selected={selected} setSelected={setSelected} />
            <TimeSelectButtons TimeSelected={timeSelected} setTimeSelected={setTimeSelected} />
            <CircularProgressBar ALL={10} MATH={50} ENGLISH={30}></CircularProgressBar>
            <DayCalendar tasks={tasks}></DayCalendar>
        </Box>
    </Box>
  );
}

export default TodoMain;
