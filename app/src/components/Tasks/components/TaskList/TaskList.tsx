import { Task, TaskStatus, TimeSelector } from "../../types";
import Box from '@mui/joy/Box';
import TaskComponent from "./Task";
import React from 'react';
import { TasksContext } from "../../context/TasksContext";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface TasklistProps {
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
        case TimeSelector.PAST_DUE:
            return endDate < new Date();
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
function Tasklist({ selected, timeSelected }: TasklistProps) {
    const tasksContext = React.useContext(TasksContext);
    if(!tasksContext) return null;
    const { tasks, setTasks } = tasksContext;

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const filteredTasks = tasks.filter(task => 
            ((selected === 'ALL' && task.status !== TaskStatus.DONE) || task.status === selected) && 
            matchesTimeFilter(task, timeSelected)
        );

        const reorderedTask = filteredTasks[result.source.index];
        const newTasks = Array.from(tasks);
        const sourceIndex = tasks.findIndex(t => t.id === reorderedTask.id);
        const targetTask = filteredTasks[result.destination.index];
        const destinationIndex = tasks.findIndex(t => t.id === targetTask.id);
        
        const [removed] = newTasks.splice(sourceIndex, 1);
        newTasks.splice(destinationIndex, 0, removed);
        
        setTasks(newTasks);
    };

        const filteredTasks = tasks.filter(task => 
            ((selected === 'ALL' && task.status !== TaskStatus.DONE) || task.status === selected) && 
            matchesTimeFilter(task, timeSelected)
        );

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Box>
                <Droppable droppableId="tasks-list">
                    {(provided) => (
                        <Box
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            sx={{ 
                                maxHeight: '80vh',
                                width: '45vw',
                                overflowY: 'scroll',
                                scrollbarWidth: 'none',
                                flexGrow: 1,
                                padding: 2 
                            }}
                        >
                            {filteredTasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            <TaskComponent task={task} selected={selected} />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </Box>
                    )}
                </Droppable>
            </Box>
        </DragDropContext>
    );
}

export default Tasklist;
