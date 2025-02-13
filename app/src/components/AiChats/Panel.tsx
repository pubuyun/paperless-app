import React, { useState } from 'react';
import ResizablePanel from '../common/Panel';
import Box from '@mui/material/Box';
/* add icons : Addfile, Addfolder, Delete, copy */
import AddIcon from '@mui/icons-material/Add';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import MultiSelectFileExplorer from './FileExplorer/FileExplorer';
import { Button } from '@mui/material';

interface NoteEditorProps {
}

// create a NoteeditorPanel component extends ResizablePanel, add a text "Note Editor" to the panel
const NoteEditorPanel: React.FC<NoteEditorProps> = () => {
  return (
    <ResizablePanel>
      <Box
        sx={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-evenly',
        }}
      >
        <Button sx={{minWidth:`24px`}}><AddIcon/></Button>
        <Button sx={{minWidth:`24px`}}><CreateNewFolderIcon/></Button>
        <Button sx={{minWidth:`24px`}}><DeleteIcon/></Button>
        <Button sx={{minWidth:`24px`}}><ContentCopyIcon/></Button>
      </Box>
      <MultiSelectFileExplorer
        defaultExpandedItems={['1']}
        onSelectionChange={()=>{}}
      />
    </ResizablePanel>
  );
};

export default NoteEditorPanel;