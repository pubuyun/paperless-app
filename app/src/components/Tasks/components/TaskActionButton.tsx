import { IconButton, SxProps } from '@mui/material';
import { ReactElement } from 'react';

interface TaskActionButtonProps {
    color: {
        main: string;
        hover: string;
    };
    icon: ReactElement;
    onClick?: () => void;
    sx?: SxProps;
}

const TaskActionButton = ({ color, icon, onClick, sx }: TaskActionButtonProps) => {
    return (
        <IconButton 
            onClick={onClick}
            sx={{ 
                backgroundColor: color.main,
                color: 'white',
                borderTopLeftRadius: 1,
                borderBottomLeftRadius: 1,
                '&:hover': {
                    backgroundColor: color.hover
                },
                ...sx
            }}
        >
            {icon}
        </IconButton>
    );
};

export default TaskActionButton;
