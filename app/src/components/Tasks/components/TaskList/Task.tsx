import Grid from '@mui/joy/Grid';
import CircleIcon from '@mui/icons-material/Circle';
import DoneIcon from '@mui/icons-material/Done';
import InfoIcon from '@mui/icons-material/Info';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LinearProgress from '@mui/joy/LinearProgress';
import TaskActionButton from '../SelectorButtons/TaskActionButton';
import { Task, StatusColor, SubjectColor, TaskStatus } from '../../types';
import { Typography, Box } from '@mui/material';
import { TasksContext } from '../../context/TasksContext';
import { useContext, useState, useRef } from 'react';

interface TaskProps {
    task: Task;
    selected: TaskStatus | 'ALL';
}

function TaskComponent({ task, selected }: TaskProps) {
    const [progress, setProgress] = useState(
        Math.min(
            Math.max(
                (((new Date().getTime() - task.startDateTime.getTime()) / 
                (task.endDateTime.getTime() - task.startDateTime.getTime())) * 100)
            , 0)
        , 100)
    );
    const intervalRef = useRef<NodeJS.Timeout>();
    const taskBoxRef = useRef<HTMLDivElement>(null);
    const buttonsBoxRef = useRef<HTMLDivElement>(null);

    const tasksContext = useContext(TasksContext);
    if(!tasksContext) return null;
    const { updateTask, openWebView } = tasksContext;
    const AnimatedDisappear = () => {
        if (taskBoxRef.current && buttonsBoxRef.current) {
            taskBoxRef.current.style.transform = 'translateX(100vw) rotate(10deg)';
            taskBoxRef.current.style.opacity = '0';
            buttonsBoxRef.current.style.transform = 'translateX(200vw) rotate(20deg)';
            buttonsBoxRef.current.style.opacity = '0';
        }
    }
    const AnimatedProgressReload = () => {
        // Clear any existing animation
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        const originalProgress = Math.min(
            Math.max(
                (((new Date().getTime() - task.startDateTime.getTime()) / 
                (task.endDateTime.getTime() - task.startDateTime.getTime())) * 100)
            , 0)
        , 100);
        // Animate the progress bar reload in 0.3s
        const step = originalProgress/(300/5);
        setProgress(0);
        intervalRef.current = setInterval(() => {
            setProgress(prev => prev + step);
        }, 5);
        setTimeout(() => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = undefined;
            }
            setProgress(originalProgress);
        }, 300);
    }

    const handleDone = () => {
        AnimatedDisappear();
        setTimeout(() => {
            updateTask(task.id, { status: TaskStatus.DONE });
        }, 500);
    };

    const handleNextStatus = () => {
        const nextStatus = {
            [TaskStatus.NOT_STARTED]: TaskStatus.IN_PROGRESS,
            [TaskStatus.IN_PROGRESS]: TaskStatus.STUCK,
            [TaskStatus.STUCK]: TaskStatus.NOT_STARTED,
            [TaskStatus.DONE]: TaskStatus.IN_PROGRESS,
        }[task.status];
        if (selected !== 'ALL'){
            AnimatedDisappear();
            setTimeout(() => {
                updateTask(task.id, { status: nextStatus });
            }, 500);
        } else {
            updateTask(task.id, { status: nextStatus });
            AnimatedProgressReload();
        }
    };
    
    return (
        <Box sx={{flexDirection: 'row', display: 'flex', margin: 3}}>  
            <Box 
                ref={taskBoxRef}
                sx={{
                borderRadius: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                flexGrow: 1,
                padding: 3,
                transform: 'translateX(0) rotate(0deg)',
                opacity: 1,
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                }
            }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid xs={1}>
                        <CircleIcon style={{ color: SubjectColor[task.subject] }} />
                    </Grid>
                    <Grid xs={7}>
                        <Typography noWrap>{task.title}</Typography>
                    </Grid>
                    <Grid xs={4}>
                        <Typography fontSize={13}>
                            Due <b>{new Date(task.endDateTime).toLocaleDateString('en-US', { weekday: 'short' })}</b> on <b>{new Date(task.endDateTime).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</b>
                        </Typography>
                    </Grid>
                    <Grid xs={12}>
                        <LinearProgress 
                            determinate 
                            value={progress} 
                            sx={{ 
                                color: StatusColor[task.status], 
                                '--LinearProgress-radius': '12px',
                                '--LinearProgress-thickness': '16px',
                            }}
                        >
                            <Typography
                                sx={{ 
                                    color: 'black',
                                    position: 'absolute', 
                                    width: '100%', 
                                    textAlign: 'center', 
                                    fontSize: 12,
                                }}
                            >
                                {task.status}
                            </Typography>    
                        </LinearProgress>
                    </Grid>
                </Grid>
            </Box>
            <Box 
                ref={buttonsBoxRef}
                sx={{ 
                    flexDirection: 'column', 
                    display: 'flex',
                    width: '28px',
                    transform: 'translateX(0) rotate(0deg)',
                    opacity: 1,
                    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-out',
                }}>   
                <TaskActionButton
                    color={{ main: '#4caf50', hover: '#388e3c' }}
                    icon={<DoneIcon fontSize='small' />}
                    onClick={handleDone}
                />
                <TaskActionButton
                    color={{ main: '#2196f3', hover: '#1976d2' }}
                    icon={<InfoIcon fontSize='small' />}
                    onClick={() => task.url && openWebView(task.url)}
                />
                <TaskActionButton
                    color={{ main: '#ff9800', hover: '#f57c00' }}
                    icon={<CalendarTodayIcon fontSize='small' />}
                    onClick={handleNextStatus}
                    sx={{ marginBottom: 0 }}
                />
            </Box>
        </Box>
    );
}

export default TaskComponent;
