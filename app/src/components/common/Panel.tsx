import React, { useState, useCallback } from 'react';
import './Panel.css';

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  defaultWidth = 240,
  minWidth = 160,
  maxWidth = 480,
}) => {
  const [width, setWidth] = useState(defaultWidth);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    const startWidth = width;
    const startX = mouseDownEvent.pageX;

    const onMouseMove = (mouseMoveEvent: MouseEvent) => {
      const newWidth = startWidth + mouseMoveEvent.pageX - startX;
      setWidth(Math.min(Math.max(newWidth, minWidth), maxWidth));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [width, minWidth, maxWidth]);

  return (
    <div className="resizable-panel" style={{ width: `${width}px` }}>
      {children}
      <div className="resizer" onMouseDown={startResizing} />
    </div>
  );
};

export default ResizablePanel;