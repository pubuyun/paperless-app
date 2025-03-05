import Grid from '@mui/joy/Grid';
import CircleIcon from '@mui/icons-material/Circle';
import LinearProgress from '@mui/joy/LinearProgress';
import { Task, TaskStatus, StatusColor } from './types';
import { Typography, Box } from '@mui/material';

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
        <Box sx={{
            padding: 2,
            margin: 3,
            borderRadius: 1
        }}>
            <Grid container spacing={2} alignItems="center">
                <Grid xs={1}>
                    <CircleIcon style={{ color: StatusColor[task.status] }} />
                </Grid>
                <Grid xs={7}>
                    <Typography>{task.title}</Typography>
                </Grid>
                <Grid xs={4}>
                    <Typography>{formatDate(task.endDateTime)}</Typography>
                </Grid>
                <Grid xs={12}>
                    <LinearProgress determinate value={Math.min(Math.max(progress, 0), 100)} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default TaskComponent;
