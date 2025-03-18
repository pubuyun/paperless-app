import { Box } from '@mui/joy';
import { Button } from '@mui/material';
import { TasksContext } from './context/TasksContext';
import React from 'react';
import Tasklist from './components/TaskList/TaskList';
import { TaskStatus, TimeSelector } from './types';
import SelectButtons from './components/SelectorButtons/SelectButtons';
import TimeSelectButtons from './components/SelectorButtons/TimeSelectButtons';
import CircularProgressBar from './components/CircularProgressBar/CircularProgressBar';
import DayCalendar from './components/DateCalendar/DayCalendar';
import AddTaskDialog from './components/TaskList/AddTaskDialog';
import WebViewDialog from './components/TaskList/WebViewDialog';

function TodoMain() {
    const [selected, setSelected] = React.useState<TaskStatus|"ALL">('ALL');
    const [timeSelected, setTimeSelected] = React.useState<TimeSelector | null>(null);
    const [openAddTaskDialog, setOpenAddTaskDialog] = React.useState(false);
    const tasksContext = React.useContext(TasksContext);
    if (!tasksContext) return null;

    const { isWebViewOpen, webViewUrl, closeWebView } = tasksContext;

    return (
        <Box className="todo-main" sx={ { display: 'flex', flexGrow: 1, background: 'radial-gradient(circle at center, rgba(150,150,150,0.8) 0%, rgba(0,0,0,0) 70%)', } }>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Tasklist selected={selected} timeSelected={timeSelected}/>
                <Button variant="contained" color="primary" sx={{ margin: 5 }} onClick={()=>{setOpenAddTaskDialog(true)}}>Add Task</Button>
            </Box>
            <Box sx={ { display: 'flex', flexDirection: "column", gap: 2, flexGrow: 1, margin: 4} }>
                <SelectButtons Selected={selected} setSelected={setSelected} />
                <TimeSelectButtons TimeSelected={timeSelected} setTimeSelected={setTimeSelected} />
                <CircularProgressBar ALL={10} MATH={50} ENGLISH={30}></CircularProgressBar>
                <DayCalendar />
            </Box>
            <AddTaskDialog open={openAddTaskDialog} onClose={() => setOpenAddTaskDialog(false)} />
            <WebViewDialog 
                open={isWebViewOpen}
                onClose={closeWebView}
                url={webViewUrl}
            />
        </Box>
    );
}

export default TodoMain;
