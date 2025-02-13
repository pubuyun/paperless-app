import * as React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Tab } from "@mui/material";

interface DraggableTabProps {
  id: string;
  label: React.ReactNode;
  value: string;
  index: number;
  icon?: React.ReactElement;
  onClick?: () => void
}

export default function DraggableTab(props: DraggableTabProps) {
  const { id, label, value, index, icon, onClick } = props;
  
  return (
    <Draggable draggableId={id} index={index} disableInteractiveElementBlocking={true}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div {...provided.dragHandleProps}/>
          <Tab
            value={value}
            label={label}
            icon={icon}
            iconPosition="end"  
            onClick={onClick}  
            sx={{
              display: 'flex',
              alignItems: 'center',
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              minWidth: "108px",
              justifyContent: "space-between"
            }}
          />
        </div>
      )}
    </Draggable>
  );
}
