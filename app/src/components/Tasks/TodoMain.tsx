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
import AddTaskDialog from './components/Dialogs/AddTaskDialog';
import WebViewDialog from './components/Dialogs/WebViewDialog';
import { calculateProgress } from './utils/utils';

function TodoMain() {
    const [selected, setSelected] = React.useState<TaskStatus|"ALL">('ALL');
    const [timeSelected, setTimeSelected] = React.useState<TimeSelector | null>(null);
    const tasksContext = React.useContext(TasksContext);
    if (!tasksContext) return null;
    const { isWebViewOpen, webViewUrl, closeWebView, tasks, isTaskEditOpen, taskEditing, openTaskEdit, closeTaskEdit } = tasksContext;

    const undoneTasks = tasks.filter(task => task.status !== TaskStatus.DONE);
    const circularProgressBarData = {
        items: [
            // Calculate the overall progress
            {
                subject: "ALL",
                progress: undoneTasks.length ? undoneTasks.reduce((acc, task) => acc + calculateProgress(task), 0) / undoneTasks.length : 100
            },
            // Calculate progress for each subject
            ...Object.entries(undoneTasks.reduce((acc, task) => {
                if (!acc[task.subject]) {
                    acc[task.subject] = { total: 0, count: 0 };
                }
                acc[task.subject].total += calculateProgress(task);
                acc[task.subject].count += 1;
                return acc;
            }, {} as { [key: string]: { total: number, count: number } }))
            .map(([subject, { total, count }]) => ({
                subject,
                progress: total / count
            }))
            .sort((a, b) => b.progress - a.progress) // Sort by progress in descending order
            .slice(0, 2) // Take top 2 subjects
        ]
    };
    return (
        <Box className="todo-main" sx={ { display: 'flex', flexGrow: 1, background: 'radial-gradient(circle at center, rgba(150,150,150,0.8) 0%, rgba(0,0,0,0) 70%)', } }>
            <Box sx={{ display: 'flex', flexDirection: 'column', margin: 1 }}>
                <Tasklist selected={selected} timeSelected={timeSelected}/>
                <Button variant="contained" color="primary" sx={{ margin: 5 }} onClick={()=>openTaskEdit()}>Add Task</Button>
            </Box>
            <Box sx={ { display: 'flex', flexDirection: "column", gap: 2, flexGrow: 1, margin: 4} }>
                <SelectButtons Selected={selected} setSelected={setSelected} />
                <TimeSelectButtons TimeSelected={timeSelected} setTimeSelected={setTimeSelected} />
                <CircularProgressBar {...circularProgressBarData}></CircularProgressBar>
                <DayCalendar />
            </Box>
            <AddTaskDialog open={isTaskEditOpen} onClose={closeTaskEdit} task={taskEditing? taskEditing:undefined} />
            <WebViewDialog 
                open={isWebViewOpen}
                onClose={closeWebView}
                url={webViewUrl}
            />

        </Box>
    );
}

export default TodoMain;
