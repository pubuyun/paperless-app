import TaskComponent from "./Task";
import { Task, TaskStatus, Subject } from "./types";
import { Box } from '@mui/joy';

function TodoMain() {
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
            endDateTime: new Date('2026-01-01T14:00:00'),
            url: 'https://example.com'
        },
    ] as Task[];

    return (
        <Box sx={{ 
          background: 'radial-gradient(circle at center, rgba(150,150,150,0.8) 0%, rgba(0,0,0,0) 70%)',
          minHeight: '100vh',
          padding: 2 
        }}>
            {tasks.map(task => <TaskComponent task={task} key={task.id} />)}
        </Box>
    );
}

export default TodoMain;
