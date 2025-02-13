import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Tab } from '@mui/material';

interface DraggableTabProps {
  id: string;
  index: number;
  label: React.ReactNode;
  value: string;
}

const DraggableTab: React.FC<DraggableTabProps> = ({ id, index, label, value }) => {
  return (
    <Draggable draggableId={id} index={index} disableInteractiveElementBlocking>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <Tab
            value={value}
            label={label}
            {...provided.dragHandleProps}
            sx={{ cursor: 'inherit' }}
          />
        </div>
      )}
    </Draggable>
  );
};

export default DraggableTab;