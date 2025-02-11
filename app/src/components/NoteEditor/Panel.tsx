import React from 'react';
import ResizablePanel from '../common/Panel';

interface NoteEditorProps {
}

// create a NoteeditorPanel component extends ResizablePanel, add a text "Note Editor" to the panel
const NoteEditorPanel: React.FC<NoteEditorProps> = () => {
  return (
    <ResizablePanel>
      <div>
        <h1> Note Editor </h1>
      </div>
    </ResizablePanel>
  );
};

export default NoteEditorPanel;