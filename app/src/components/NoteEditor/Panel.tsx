import React, {  } from 'react';
import ResizablePanel from '../common/Panel';
import Box from '@mui/material/Box';
/* add icons : Addfile, Addfolder, Delete, copy */
import AddIcon from '@mui/icons-material/Add';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import DeleteIcon from '@mui/icons-material/Delete';

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
        <Button sx={{minWidth:`24px`}} onClick={
          async ()=>{
            const result = await window.FileApi.showSaveDialog({
              title: 'Create New File',
              buttonLabel: 'Create',
              properties: ['createFile']
            });
            window.IpcApi.mainsend('new-file-dialog-completed', result);
          }
        }><AddIcon/></Button>
        <Button sx={{minWidth:`24px`}} onClick={
          async ()=>{
            const result = await window.FileApi.showSaveDialog({
              title: 'Create New Folder',
              buttonLabel: 'Create',
              properties: ['createDirectory']
            });
            window.IpcApi.mainsend('new-folder-dialog-completed', result);
          }
        }><CreateNewFolderIcon/></Button>
        <Button sx={{minWidth:`24px`}} onClick={
          async ()=>{
            const result = await window.FileApi.showMessageBox({
              type: 'warning',
              title: 'Delete',
              message: 'Are you sure you want to delete the selected items?',
              buttons: ['Yes', 'No'],
              defaultId: 1,
              cancelId: 1
            });
            window.IpcApi.mainsend('delete-confirmed', result);
          }
        }><DeleteIcon/></Button>
      </Box>
      <MultiSelectFileExplorer
        defaultExpandedItems={[]}
        onSelectionChange={()=>{}}
        onItemsChange={()=>{}}
      />
    </ResizablePanel>
  );
};

export default NoteEditorPanel;
