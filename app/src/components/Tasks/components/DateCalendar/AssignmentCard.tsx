import { Task, SubjectColor } from '../../types';
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
            <Box width="10px" height="5vh" bgcolor={SubjectColor[task.subject]} sx={{ borderTopLeftRadius: 5, borderBottomLeftRadius: 5 }}>
            </Box>
            <Box sx={{ 
                display: 'flex',
                flexGrow: 1,
                paddingLeft: 2,
                flexDirection: 'column',
                justifyContent: 'center',
                backgroundColor: "#f5f5f5",
                borderTopRightRadius: 5,
                borderBottomRightRadius: 5,
                height: "5vh",
             }}>
                <Typography variant="h6" fontSize="20px" noWrap>{task.title}</Typography>
                <Typography variant="body2" fontSize="14px">
                    Due on <b>{new Date(task.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</b>
                </Typography>
            </Box>
        </Box>
    );
}

export default AssignmentCard;
