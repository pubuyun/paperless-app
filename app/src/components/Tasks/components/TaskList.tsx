import { Task, TaskStatus, Subject, TimeSelector } from "../types";
import Box from '@mui/joy/Box';
import TaskComponent from "./Task";
import { Button } from "@mui/material";

interface TasklistProps {
    tasks: Task[];
    selected: TaskStatus | 'ALL';
    timeSelected: TimeSelector | null;
}

const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
};

const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.getDate() === tomorrow.getDate() &&
        date.getMonth() === tomorrow.getMonth() &&
        date.getFullYear() === tomorrow.getFullYear();
};

const isThisWeek = (date: Date) => {
    const today = new Date();
    const endOfWeek = new Date();
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
    return date <= endOfWeek && date >= today;
};

const matchesTimeFilter = (task: Task, timeSelected: TimeSelector | null): boolean => {
    if (!timeSelected) return true;
    const endDate = new Date(task.endDateTime);
    
    switch(timeSelected) {
        case TimeSelector.TODAY:
            return isToday(endDate);
        case TimeSelector.TOMORROW:
            return isTomorrow(endDate);
        case TimeSelector.THIS_WEEK:
            return isThisWeek(endDate);
        default:
            return true;
    }
}
function Tasklist(TasklistProps: TasklistProps) {
    const { tasks, selected, timeSelected } = TasklistProps;
    return (
        <Box>
            <Box sx={{ 
            maxHeight: '85vh',
            width: '45vw',
            overflowY: 'scroll',
            scrollbarWidth: 'none',
            flexGrow: 1,
            padding: 2 
            }}>
                {tasks.map((task) => {
                    if ((selected === 'ALL' || task.status === selected) && matchesTimeFilter(task, timeSelected)) {
                        return <TaskComponent task={task} key={task.id} />;
                    }
                    return null;
                })}
            </Box>
            <Button variant="contained" color="primary" sx={{ margin: 5 }}>Add Task</Button>
        </Box>
    );
}

export default Tasklist;
