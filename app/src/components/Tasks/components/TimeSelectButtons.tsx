import { Button, Box } from "@mui/material";
import { TaskStatus, TimeSelector } from "../types";
import { Star, Event, DateRange } from "@mui/icons-material";

interface TimeSelectButtonsProps {
    TimeSelected: TimeSelector | null;
    setTimeSelected: (status: TimeSelector | null) => void;
}

function TimeSelectButtons(TimeSelectButtonsProps: TimeSelectButtonsProps) {
    const { TimeSelected, setTimeSelected } = TimeSelectButtonsProps;
    const ButtonStyle = {
        margin: '0.5rem',
        borderRadius: '1rem',
    }
    return (
        <Box>
            <Button
                variant={TimeSelected === 'TODAY' ? 'contained' : 'outlined'}
                color="error"
                startIcon={<Star />}
                sx={ButtonStyle}
                onClick={() => setTimeSelected(TimeSelected === TimeSelector.TODAY ? null : TimeSelector.TODAY)}
            >
                Today
            </Button>
            <Button
                variant={TimeSelected === 'TOMORROW' ? 'contained' : 'outlined'}
                color="warning"
                startIcon={<Event />}
                sx={ButtonStyle}
                onClick={() => setTimeSelected(TimeSelected === TimeSelector.TOMORROW ? null : TimeSelector.TOMORROW)}
            >
                Tomorrow
            </Button>
            <Button
                variant={TimeSelected === 'THIS_WEEK' ? 'contained' : 'outlined'}
                color="info"
                startIcon={<DateRange />}
                sx={ButtonStyle}
                onClick={() => setTimeSelected(TimeSelected === TimeSelector.THIS_WEEK ? null : TimeSelector.THIS_WEEK)}
            >
                This Week
            </Button>
        </Box>
    );
}

export default TimeSelectButtons;
