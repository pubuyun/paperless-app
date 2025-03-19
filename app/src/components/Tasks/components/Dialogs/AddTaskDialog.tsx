import { Modal, ModalDialog, Typography, FormControl, FormLabel, Input, Button, Select, Option, Stack } from "@mui/joy";
import { DateTimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { zhCN } from 'date-fns/locale/zh-CN';
import { TasksContext } from "../../context/TasksContext";
import { Subject, TaskStatus, Task } from "../../types";
import React from "react";
import { SubjectColor } from "../../types";
import { Circle } from "@mui/icons-material";

interface AddTaskDialogProps {
    open: boolean;
    onClose: () => void;
    task?: Task;
}

function AddTaskDialog(prop: AddTaskDialogProps) {
    const { open, onClose, task } = prop;
    const [title, setTitle] = React.useState(task?.title ?? "");
    const [subject, setSubject] = React.useState<Subject>(task?.subject ?? Subject.OTHER);
    const startDateTime = new Date();
    const [endDateTime, setEndDateTime] = React.useState<Date>(task?.endDateTime ?? new Date());
    const [url, setUrl] = React.useState(task?.url ?? "");

    React.useEffect(() => {
        if (task) {
            setTitle(task.title);
            setSubject(task.subject);
            setEndDateTime(task.endDateTime);
            setUrl(task.url ?? "");
        }
    }, [task]);

    const tasksContext = React.useContext(TasksContext);
    if(!tasksContext) return null;
    const { addTask, updateTask, deleteTask } = tasksContext;

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (task){
            updateTask(task.id, { title, subject, endDateTime, url });
        } else {
            addTask({
                id: Date.now(),
                title,
                subject,
                startDateTime,
                endDateTime,
                status: "NOT_STARTED" as TaskStatus,
                url: url? url: undefined,
            });
        }
        // Reset form and close dialog
        setTitle("");
        setSubject(Subject.OTHER);
        setEndDateTime(new Date());
        onClose();
    };

    const handleDelete = () => {
        if (task) {
            deleteTask(task.id);
            onClose();
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
            <Modal open={open} onClose={onClose}>   
                <ModalDialog
                    aria-labelledby="add-task-dialog-title"
                    sx={{
                        maxWidth: 500,
                        borderRadius: 'md',
                        p: 3,
                        boxShadow: 'lg',
                    }}
                >
                    <Typography id="add-task-dialog-title" component="h2" level="h4" marginBottom={2}>
                        {task? "Edit Task": "Add Task"}
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <FormControl required sx={{ mb: 2 }}>
                            <FormLabel>Title</FormLabel>
                            <Input
                                placeholder="Enter title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </FormControl>
                        <FormControl required sx={{ mb: 2 }}>
                            <FormLabel>Subject</FormLabel>
                            <Select
                                placeholder="Select subject"
                                value={subject}
                                onChange={(_, value) => setSubject(value as Subject)}
                            >
                                {Object.values(Subject).map((subj) => (
                                    <Option 
                                        key={subj}
                                        value={subj}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                        }}
                                    >
                                        <Circle fontSize="small" sx={{ color: SubjectColor[subj], marginRight: 1 }} />
                                        {subj}
                                    </Option>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl required sx={{ mb: 3 }}>
                            <FormLabel>Due Date</FormLabel>
                            <DateTimePicker
                                ampm={false}
                                value={endDateTime}
                                onChange={(newValue: Date | null) => setEndDateTime(newValue || new Date())}
                                minDateTime={startDateTime}
                            />
                        </FormControl>
                        <FormControl sx={{ mb: 2 }}>
                            <FormLabel>url to task description</FormLabel>
                            <Input placeholder="Enter url" value={url} onChange={(e)=>{setUrl(e.target.value)}}/>
                        </FormControl>
                        <Stack spacing={2}>
                            <Button type="submit" sx={{ width: '100%' }}>
                                {task ? "Save Changes" : "Add Task"}
                            </Button>
                            {task && (
                                <Button 
                                    color="danger" 
                                    variant="solid"
                                    onClick={handleDelete}
                                    sx={{ width: '100%' }}
                                >
                                    Delete Task
                                </Button>
                            )}
                        </Stack>
                    </form>
                </ModalDialog>
            </Modal>
        </LocalizationProvider>
    );
}

export default AddTaskDialog;
