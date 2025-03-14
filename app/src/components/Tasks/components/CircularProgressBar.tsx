import { Circle } from "@mui/icons-material";
import { CircularProgress } from "@mui/joy";
import { Box } from "@mui/material";
import React from "react";

interface CircularProgressBarProps {
    [subject: string]: number;
}

function CircularProgressBar(props: CircularProgressBarProps) {
    const colors = [
        'primary',
        'success',
        'warning',
    ] as const;
    const recursiveShowCircle = (index: number = 0): React.ReactNode => {
        const entries = Object.entries(props);
        if (index >= entries.length) return null;
        const [, progress] = entries[index];
        
        return (
            <CircularProgress
                determinate
                value={progress}
                thickness={8 - index*0.5}
                color={colors[index % colors.length]}
                sx={{
                    '--CircularProgress-size': `${150 - index * 20}px`,
                }}
            >
                {recursiveShowCircle(index + 1)}
            </CircularProgress>
        );
    }
    return (
<Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: "#eeeeeecc", padding: 4, borderRadius: 5, maxWidth: "30vw"  }} >
            <Box display="flex" justifyContent="center" alignItems="center">
                {recursiveShowCircle(0)}
            </Box>
            <Box display="flex" flexDirection="column" ml={5} sx={{ flexGrow: 1 }} gap={1.5}>
                {Object.entries(props).map(([subject, progress], index) => (
                    <Box sx={{ display: 'flex', alignItems: "center", justifyContent: "space-between" }} key={subject}>
                        {/* seperate the circle and the text in two side */}
                        
                        <Box display="flex" alignItems="center" gap={1}><Circle color={colors[index % colors.length]} /> {subject}</Box>
                        <Box color="#bbb">{progress}%</Box>
                    </Box>
                ))} 
            </Box>
        </Box>
    );
}

export default CircularProgressBar;
