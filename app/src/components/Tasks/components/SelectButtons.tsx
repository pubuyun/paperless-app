import { Button, Box } from "@mui/material";
import { TaskStatus } from "../types";

interface SelectButtonsProps {
    Selected: TaskStatus | "ALL";
    setSelected: (status: TaskStatus | "ALL") => void;
}

function SelectButtons(SelectButtonsProps: SelectButtonsProps) {
    const { Selected, setSelected } = SelectButtonsProps;
    const ButtonStyle = {
        margin: '0.5rem',
        borderRadius: '0.5rem',
    }
    return (
        <Box>
            <Button sx={ButtonStyle} color="success" variant={Selected === 'ALL' ? 'contained' : 'outlined'} onClick={() => setSelected("ALL")}>ALL</Button>
            <Button sx={ButtonStyle} color="warning" variant={Selected === 'NOT_STARTED' ? 'contained' : 'outlined'} onClick={() => setSelected(TaskStatus.NOT_STARTED)}>Not Started</Button>
            <Button sx={ButtonStyle} color="info" variant={Selected === 'IN_PROGRESS' ? 'contained' : 'outlined'} onClick={() => setSelected(TaskStatus.IN_PROGRESS)}>In Progress</Button>
            <Button sx={ButtonStyle} color="error" variant={Selected === 'STUCK' ? 'contained' : 'outlined'} onClick={() => setSelected(TaskStatus.STUCK)}>Stuck</Button>
        </Box>
    );
}

export default SelectButtons;