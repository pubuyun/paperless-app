import * as React from "react";
import { Draggable, DraggableProvided } from "@hello-pangea/dnd";

interface DraggableTabProps {
  index: number;
  label: string;
  value: string;
  child: React.ReactElement;
}

export default function DraggableTab(props: DraggableTabProps) {
  return (
    <Draggable
      draggableId={`${props.index}`}
      index={props.index}
      disableInteractiveElementBlocking
    >
      {(draggableProvided: DraggableProvided) => (
        <div
          ref={draggableProvided.innerRef}
          {...draggableProvided.draggableProps}
        >
          {React.cloneElement(props.child, {
            ...props,
            ...draggableProvided.dragHandleProps,
            style: { cursor: "inherit" }
          })}
        </div>
      )}
    </Draggable>
  );
}
