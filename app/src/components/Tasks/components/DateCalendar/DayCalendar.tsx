import { Task } from '../../types';
import { TasksContext } from '../../context/TasksContext';
import Box from '@mui/material/Box';
import React from 'react';
import DateSelector from './DateSelector';
import { addDays, subDays } from 'date-fns';
import AssignmentCard from './AssignmentCard';
import Typography from '@mui/material/Typography';


function DayCalendar() {
    // -1 ~ 3, 0 for today
    const [DateSelected, setDateSelected] = React.useState(0);
    const tasksContext = React.useContext(TasksContext);
    if(!tasksContext) return null;
    const { tasks } = tasksContext;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', backgroundColor: "#eeeeeecc", padding: 4, borderRadius: 5, maxWidth: "35vw" }}>
            <DateSelector DateSelected={DateSelected} setDateSelected={setDateSelected} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 2, maxHeight: "20vh", overflowY: "scroll", scrollbarWidth: "none" }}>
                {(() => {
                    const date = DateSelected < 0 ? subDays(new Date(), Math.abs(DateSelected)) : addDays(new Date(), DateSelected);
                    const todayTasks = tasks.filter(task => task.endDateTime.getDate() === date.getDate());
                    const todayTasksOrdered = todayTasks.sort((a: Task, b: Task) => a.endDateTime.getTime() - b.endDateTime.getTime());
                    return todayTasks.length > 0 
                        ? todayTasksOrdered.map(task => <AssignmentCard task={task} key={task.id} />)
                        : <Typography variant="body1" textAlign="center" color="text.secondary">No Assignment</Typography>;
                })()}
            </Box>
        </Box>
    );
}

export default DayCalendar;
