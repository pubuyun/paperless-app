import Grid from '@mui/joy/Grid';
import CircleIcon from '@mui/icons-material/Circle';
import DoneIcon from '@mui/icons-material/Done';
import InfoIcon from '@mui/icons-material/Info';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LinearProgress from '@mui/joy/LinearProgress';
import TaskActionButton from './TaskActionButton';
import { Task, StatusColor } from '../types';
import { Typography, Box } from '@mui/material';
import { width } from '@mui/system';

interface TaskProps {
    task: Task;
}

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function TaskComponent({ task }: TaskProps) {
    const progress = ((new Date().getTime() - task.startDateTime.getTime()) / 
                     (task.endDateTime.getTime() - task.startDateTime.getTime())) * 100;
                     
    return (
        <Box sx={{flexDirection: 'row', display: 'flex', margin: 3}}>  
            <Box sx={{
                borderRadius: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                flexGrow: 1,
                padding: 3,
            }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid xs={1}>
                        <CircleIcon style={{ color: StatusColor[task.status] }} />
                    </Grid>
                    <Grid xs={7}>
                        <Typography noWrap>{task.title}</Typography>
                    </Grid>
                    <Grid xs={4}>
                        <Typography fontSize={13}>{formatDate(task.endDateTime)}</Typography>
                    </Grid>
                    <Grid xs={12}>
                        <LinearProgress determinate value={Math.min(Math.max(progress, 0), 100)} />
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{ 
                flexDirection: 'column', 
                display: 'flex',
                width: '28px',
            }}>   
                <TaskActionButton
                    color={{ main: '#4caf50', hover: '#388e3c' }}
                    icon={<DoneIcon fontSize='small' />}
                />
                <TaskActionButton
                    color={{ main: '#2196f3', hover: '#1976d2' }}
                    icon={<InfoIcon fontSize='small' />}
                />
                <TaskActionButton
                    color={{ main: '#ff9800', hover: '#f57c00' }}
                    icon={<CalendarTodayIcon fontSize='small' />}
                    sx={{ marginBottom: 0 }}
                />
            </Box>
        </Box>
    );
}

export default TaskComponent;
