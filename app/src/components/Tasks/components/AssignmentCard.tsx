import { Task, SubjectColor } from '../types';
import React from 'react';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';

interface AssignmentCardProps {
    task: Task;
}

function AssignmentCard(props: AssignmentCardProps) {
    const { task } = props;

    return (
        <Box minHeight={50} display="flex" alignItems="center">
            <Box width="10px" height="100%" bgcolor={SubjectColor[task.subject]} sx={{ borderTopLeftRadius: 5, borderBottomLeftRadius: 5 }}>
            </Box>
            <Box sx={{ 
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                backgroundColor: "#f5f5f5",
                padding: 1,
                borderTopRightRadius: 5,
                borderBottomRightRadius: 5,
                height: "5vh",
             }}>
                <Typography variant="h6" fontSize="20px">{task.title}</Typography>
                <Typography variant="body2" fontSize="14px">
                    Due <b>{new Date(task.endDateTime).toLocaleDateString('en-US', { weekday: 'short' })}</b> on <b>{new Date(task.endDateTime).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</b>
                </Typography>
            </Box>
        </Box>
    );
}

export default AssignmentCard;
