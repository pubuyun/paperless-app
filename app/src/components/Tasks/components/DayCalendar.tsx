import { Task } from '../types';
import Box from '@mui/material/Box';
import React from 'react';
import DateSelector from './DateSelector';
import { format, addDays, subDays } from 'date-fns';
import AssignmentCard from './AssignmentCard';

interface DayCalendarProps {
    tasks: Task[];
}

function DayCalendar(props: DayCalendarProps) {
    // -1 ~ 3, 0 for today
    const [DateSelected, setDateSelected] = React.useState(0);
    const { tasks } = props;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', backgroundColor: "#eeeeeecc", padding: 4, borderRadius: 5, maxWidth: "30vw" }}>
            <DateSelector DateSelected={DateSelected} setDateSelected={setDateSelected} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 2 }}>
                {tasks.map(task => {
                    const date = DateSelected < 0 ? subDays(new Date(), Math.abs(DateSelected)) : addDays(new Date(), DateSelected);
                    if (task.endDateTime.getDate() !== date.getDate()) return null;
                    return <AssignmentCard task={task} key={task.id} />
                })}
            </Box>
        </Box>
    );
}

export default DayCalendar;