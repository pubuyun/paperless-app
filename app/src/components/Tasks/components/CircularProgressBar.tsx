import { CircularProgress } from "@mui/joy";
import { Box } from "@mui/material";
import React from "react";

interface CircularProgressBarProps {
    [subject: string]: number;
}

function CircularProgressBar(CircularProgressBarProps: CircularProgressBarProps) {
    return (
        <Box flex={1} display="flex" justifyContent="center" alignItems="center">
            <Box>
                
            </Box>
            <Box>
        
            </Box>
        </Box>
    );
}