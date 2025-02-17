import * as React from "react";
import { Box } from "@mui/material";
import Content from "./Content";
import ResizablePanel from '../common/Panel';
/* add icons : Addfile, Addfolder, Delete, copy */
import AddIcon from '@mui/icons-material/Add';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import DeleteIcon from '@mui/icons-material/Delete';

import MultiSelectFileExplorer from './FileExplorer/FileExplorer';
import { Button } from '@mui/material';
import { FileItem } from "./FileExplorer/loadFiles";

export interface TabData {
  id: string;
  label: string;
  value: string;
  content: string;
  filePath?: string; // Store the actual file path for saving
}

export default function EditorWithExplorer() {
  const [tabs, setTabs] = React.useState<TabData[]>([]);
  const [items, setItems] = React.useState<FileItem[]>([]);
  const [activeValue, setActiveValue] = React.useState<string>('1');

  const handleFileDoubleClick = async (clickedItems: string[]) => {
    // Only handle single file selection for now
    const filePath = clickedItems[0];
    if (!filePath) return;

    // Find the item in the file tree
    const findItem = (items: FileItem[], id: string): FileItem | null => {
        for (const item of items) {
            if (item.id === id) return item;
            if (item.children) {
            const found = findItem(item.children, id);
            if (found) return found;
            }
        }
        return null;
    };

    const selectedItem = findItem(items, filePath);
    if (!selectedItem || selectedItem.fileType === 'folder') return;

    // Check if file is already open in a tab
    const existingTab = tabs.find(tab => tab.filePath === filePath);
    if (existingTab) return;

    try {
        // Read file content
        const content = await window.FileApi.readFile(filePath);
        
        // Create new tab
        const newTab: TabData = {
            id: `tab${tabs.length + 1}`,
            label: selectedItem.label,
            value: `${tabs.length + 1}`,
            content: content,
            filePath: filePath
        };

        setTabs(prevTabs => [...prevTabs, newTab]);
        setActiveValue(newTab.value);

    } catch (error) {
        console.error('Error opening file:', error);
    }
  };

//   const handleItemsChange = (newItems: FileItem[]) => {
    // setItems(newItems);
//   };

  return (
    <Box sx={ { display: 'flex', flex: 1 } } className="page-container">
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
        onDoubleClick={handleFileDoubleClick}
        // onItemsChange={handleItemsChange}
        items={items}
        setItems={setItems}
      />
    </ResizablePanel>
        <Content
            tabs={tabs}
            setTabs={setTabs}
            activeValue={activeValue}
            setActiveValue={setActiveValue}
        />
    </Box>
  );
}