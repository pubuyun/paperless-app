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
import { loadDirectoryContents } from "./FileExplorer/loadFiles";

import { writeFileContent, sortItems, } from "./FileExplorer/loadFiles";
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
      if (await window.storeApi.has('fileTree')) {
        const fileTree = await window.storeApi.get('fileTree') as FileItem[];
        if (fileTree){
          const Items = await loadDirectoryContents(fileTree[0].id);
          setItems(sortItems(Items));
          console.log('Items:', Items);
          if(await window.storeApi.has('tabs')){
            const Tabs = await window.storeApi.get('tabs') as TabData[];
            if (Tabs){
              for (const Tab of Tabs) {
                try {
                  // Read file content
                  const Content = await window.FileApi.readFile(Tab.filePath);
                  // Create new tab
                  const newTab: TabData = {
                      id: `tab${Tab.filePath}`,
                      label: Tab.label,
                      value: Tab.filePath,
                      savedContent: Content,
                      editorType: Tab.editorType,
                      content: Content,
                      filePath: Tab.filePath
                  };
                  setTabs(prevTabs => [...prevTabs, newTab]);
                } catch (error) {
                    console.error('Error opening file:', error);
                }
              }
              if(await window.storeApi.has('activeValue')){
                const ActiveValue = await window.storeApi.get('activeValue') as string;
                if (ActiveValue){
                  setActiveValue(ActiveValue);
                  return;
                }
              }
              setActiveValue(Tabs[0].value);
            }
          }
        }
      }
      setIsLoaded(true);
    };
    loadData();
  }, []); // Only run on mount

  // Save file tree and tabs when they change, but only after initial load
  React.useEffect(() => {
    if (isLoaded && items) {
      window.storeApi.set('fileTree', items);
      window.storeApi.set('tabs', tabs);
      window.storeApi.set('activeValue', activeValue);
    }
  }, [activeValue, isLoaded, items, tabs]);

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
        const Content = await window.FileApi.readFile(filePath);
        // Create new tab
        // Use timestamp to generate unique id and value
        const newTab: TabData = {
            id: `tab${filePath}`,
            label: selectedItem.label,
            value: filePath,
            savedContent: Content,
            editorType: editorType,
            content: Content,
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
    if (!activeTab || (activeTab.savedContent === activeTab.content)) return;
    const { content, filePath } = activeTab;
    if (!filePath) return;
    writeFileContent(filePath, content);
    // Update saved content
    setTabs(tabs.map(tab => tab.value === tabValue ? { ...tab, savedContent: content } : tab));
  }, [tabs]);
  // handle save file
  const handleKeyDown = React.useCallback((event:KeyboardEvent) => {
    // detect Ctrl + S（Windows/Linux）or ⌘ + S（Mac）
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault(); 
      saveTab(activeValue);
    }
  }, [saveTab, activeValue]);
  window.removeEventListener("keydown", handleKeyDown);
  window.addEventListener("keydown", handleKeyDown);
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
