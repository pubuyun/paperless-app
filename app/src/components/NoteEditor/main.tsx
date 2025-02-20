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
import {  } from "./FileExplorer/loadFiles";

import { writeFileContent } from "./FileExplorer/loadFiles";
import { EditorType, TabData, FileItem } from "./types";

import { MilkdownProvider } from '@milkdown/react';


export default function EditorWithExplorer() {
  const [tabs, setTabs] = React.useState<TabData[]>([]);
  const [items, setItems] = React.useState<FileItem[]>([]);
  const [activeValue, setActiveValue] = React.useState<string>('0');
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Load file tree and tabs on mount
  React.useEffect(() => {
    const loadData = async () => {
      if(await window.storeApi.has('fileTree')){
        const fileTree = await window.storeApi.get('fileTree') as FileItem[];
        setItems(fileTree);
      }
      if(await window.storeApi.has('expandedItems')){
        const expandedItems = await window.storeApi.get('expandedItems') as string[];
        setExpandedItems(expandedItems);
      }
      if(await window.storeApi.has('tabs')){
        const tabs = await window.storeApi.get('tabs') as TabData[];
        setTabs(tabs);
        if (tabs.length > 0) 
          setActiveValue(tabs[0].value);
      }
      if(await window.storeApi.has('activeValue')){
        const activeValue = await window.storeApi.get('activeValue') as string;
        setActiveValue(activeValue);
      }
      setIsLoaded(true);
    };
    loadData();
  }, []); // Only run on mount

  // Save file tree and tabs when they change, but only after initial load
  React.useEffect(() => {
    if (isLoaded) {
      window.storeApi.set('fileTree', items);
      window.storeApi.set('tabs', tabs);
      window.storeApi.set('expandedItems', expandedItems);
      window.storeApi.set('activeValue', activeValue);
    }
  }, [isLoaded, items, tabs, expandedItems, activeValue]);

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
    if (!selectedItem) return;
    const editorType = (() => {
      switch (selectedItem.fileType) {
        case 'markdown':
          return EditorType.Markdown;
        case 'image':
          return EditorType.Picture;
        case 'pdf':
          return EditorType.Pdf;
        case 'folder':
          return;
        default:
          return EditorType.Unsupported;
        }
    })();
    if (!editorType) return;
    // Check if file is already open in a tab
    const existingTab = tabs.find(tab => tab.filePath === filePath);
    if (existingTab) {
        setActiveValue(existingTab.value);
        return;
    }

    try {
        // Read file content
        const content = await window.FileApi.readFile(filePath);
        // Create new tab
        // Use timestamp to generate unique id and value
        const timestamp = Date.now();
        const newTab: TabData = {
            id: `tab${timestamp}`,
            label: selectedItem.label,
            value: `${timestamp}`,
            saved: true,
            editorType: editorType,
            content: content,
            filePath: filePath
        };
        setTabs(prevTabs => [...prevTabs, newTab]);
        setActiveValue(newTab.value);
    } catch (error) {
        console.error('Error opening file:', error);
    }
  };

  const saveTab = React.useCallback((tabValue:string) => {
    const activeTab = tabs.find(tab => tab.value === tabValue);
    if (!activeTab || activeTab.saved) return;
    const { content, filePath } = activeTab;
    if (!filePath) return;
    writeFileContent(filePath, content);
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.value === activeValue ? { ...tab, saved: true } : tab
      )
    );
  }, [tabs, activeValue]);
  // handle save file
  React.useEffect(() => {
    const handleKeyDown = (event:KeyboardEvent) => {
      // detect Ctrl + S（Windows/Linux）or ⌘ + S（Mac）
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault(); 
        saveTab(activeValue);
      }
    };
    window.removeEventListener("keydown", handleKeyDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [tabs, activeValue, saveTab]);
  const handleExpandedItemsChange = (event:unknown, newExpandedItems: string[]) => {
    setExpandedItems(newExpandedItems);
  }
//   const handleItemsChange = (newItems: FileItem[]) => {
    // setItems(newItems);
//   };

  return (
    isLoaded &&
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
            defaultExpandedItems={expandedItems?expandedItems:[]}
            onDoubleClick={handleFileDoubleClick}
            // onItemsChange={handleItemsChange}
            onExpandedItemsChange={handleExpandedItemsChange}
            items={items}
            setItems={setItems}
          />
      </ResizablePanel>
      <MilkdownProvider>
        <Content
            tabs={tabs}
            setTabs={setTabs}
            activeValue={activeValue}
            setActiveValue={setActiveValue}
        />    
      </MilkdownProvider> 
    </Box>
  );
}
