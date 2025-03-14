import { Task, StatusColor } from '../types';
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
            <Box width="10px" height="100%" bgcolor={StatusColor[task.status]} sx={{ borderTopLeftRadius: 5, borderBottomLeftRadius: 5 }}>
            </Box>
            <Box sx={{ 
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: "#f5f5f5",
                padding: 1,
                borderTopRightRadius: 5,
                borderBottomRightRadius: 5,
                height: "5vh",
             }}>
                <Typography variant="h6" fontSize="16px">{task.title}</Typography>
                <Typography variant="body1" fontSize="10px">{task.subject}</Typography>
                <Typography variant="body2" fontSize="10px">{task.startDateTime.toLocaleString()} - {task.endDateTime.toLocaleString()}</Typography>
            </Box>
        </Box>
    );
}

export default AssignmentCard;