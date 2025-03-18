import { Modal, ModalDialog, Typography, FormControl, FormLabel, Input, Button, Select, Option } from "@mui/joy";
import { DateTimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { zhCN } from 'date-fns/locale/zh-CN';
import { TasksContext } from "../../context/TasksContext";
import { Subject, TaskStatus } from "../../types";
import React from "react";
import { SubjectColor } from "../../types";
import { Circle } from "@mui/icons-material";

interface AddTaskDialogProps {
    open: boolean;
    onClose: () => void;
}

function AddTaskDialog(prop: AddTaskDialogProps) {
    const { open, onClose } = prop;
    const [title, setTitle] = React.useState("");
    const [subject, setSubject] = React.useState<Subject>(Subject.OTHER);
    const startDateTime = new Date();
    const [endDateTime, setEndDateTime] = React.useState<Date>(new Date());
    const [url, setUrl] = React.useState("");

    const tasksContext = React.useContext(TasksContext);
    if(!tasksContext) return null;
    const { addTask } = tasksContext;

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        addTask({
            id: Date.now(),
            title,
            subject,
            startDateTime,
            endDateTime,
            status: "NOT_STARTED" as TaskStatus,
            url: url? url: undefined,
        });
        // Reset form and close dialog
        setTitle("");
        setSubject(Subject.OTHER);
        setEndDateTime(new Date());
        onClose();
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
                        Add Task
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
                        <Button type="submit" sx={{ width: '100%' }}>
                            Add Task
                        </Button>
                    </form>
                </ModalDialog>
            </Modal>
        </LocalizationProvider>
    );
}

export default AddTaskDialog;
