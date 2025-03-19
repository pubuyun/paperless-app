import CircleIcon from '@mui/icons-material/Circle';
import DoneIcon from '@mui/icons-material/Done';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LinearProgress from '@mui/joy/LinearProgress';
import TaskActionButton from '../SelectorButtons/TaskActionButton';
import { Task, StatusColor, SubjectColor, TaskStatus } from '../../types';
import { Typography, Box, Button } from '@mui/material';
import { TasksContext } from '../../context/TasksContext';
import { useContext, useState, useRef } from 'react';
import { calculateProgress } from '../../utils/utils';


interface TaskProps {
    task: Task;
    selected: TaskStatus | 'ALL';
}

function TaskComponent({ task, selected }: TaskProps) {
    const [progress, setProgress] = useState(
        calculateProgress(task) 
    );
    const intervalRef = useRef<NodeJS.Timeout>();
    const taskBoxRef = useRef<HTMLDivElement>(null);
    const buttonsBoxRef = useRef<HTMLDivElement>(null);

    const tasksContext = useContext(TasksContext);
    if(!tasksContext) return null;
    const { updateTask, openWebView, openTaskEdit } = tasksContext;

    const daysLeft = (task.endDateTime.getTime() - Date.now())/1000/60/60/24;
    const piority = daysLeft < 1 ? 'error' : daysLeft < 3 ? 'warning' : 'primary';

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

        const originalProgress = calculateProgress(task);
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
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Button 
                        disabled
                        color={piority}
                        variant="contained"  
                        sx={{ 
                            width: 'fit-content', 
                            height: '30px',
                            marginBottom: 1,
                            color: (theme) => theme.palette[piority].main,
                            backgroundColor: (theme) => `${theme.palette[piority].main}20`,
                            '&.Mui-disabled': {
                                color: (theme) => theme.palette[piority].main,
                                backgroundColor: (theme) => `${theme.palette[piority].main}20`,
                            },
                            '&:hover': {
                                backgroundColor: (theme) => `${theme.palette[piority].main}20`,
                            }
                        }}
                    >
                        {new Date(task.endDateTime).toLocaleDateString('en-US', { weekday: 'short' })}
                        {' '}
                        {new Date(task.endDateTime).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                    </Button>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CircleIcon style={{ color: SubjectColor[task.subject] }} />
                        <Typography noWrap>{task.title}</Typography>
                    </Box>
                    <Box sx={{ width: '100%', marginTop: 'auto' }}>
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
                    </Box>
                </Box>
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
                />
                <TaskActionButton
                    color={{ main: '#f44336', hover: '#e53935' }}
                    icon={<EditIcon fontSize='small' />}
                    onClick={()=>openTaskEdit(task.id)}
                    sx={{ marginBottom: 0 }}
                />
            </Box>
        </Box>
    );
}

export default TaskComponent;
