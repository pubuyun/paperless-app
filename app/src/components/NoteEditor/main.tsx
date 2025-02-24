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
          console.log(fileTree)
          const folderPath = fileTree[0].id;
          const contents = await loadDirectoryContents(folderPath);
          const newFolder = {
            id: folderPath,
            label: folderPath,
            fileType: 'folder' as const,
            children: sortItems(contents)
          };
          setItems([newFolder]);
          if (await window.storeApi.has('expandedItems')) {
            const ExpandedItems = await window.storeApi.get('expandedItems') as string[];
            if (ExpandedItems) {
              setExpandedItems(ExpandedItems);
            }
          }
        }
        // if(await window.storeApi.has('tabs')){
        //   const Tabs = await window.storeApi.get('tabs') as TabData[];
        //   if (Tabs){
        //     await Promise.all(
        //       Tabs.map(async (Tab) => {
        //         try {
        //           const Content = await window.FileApi.readFile(Tab.filePath);
        //           if (Content !== Tab.savedContent) {
        //             return { ...Tab, savedContent: Content };
        //           }
        //           return Tab;
        //         } catch (error) {
        //           console.error('Error opening file:', error);
        //         }
        //       })
        //     );
        //     setTabs(Tabs);
        //     if(await window.storeApi.has('activeValue')){
        //       const ActiveValue = await window.storeApi.get('activeValue') as string;
        //       if (ActiveValue){
        //         setActiveValue(ActiveValue);
        //       }
        //     }
        //   }
        // }
      }
      setIsLoaded(true);
    };
    loadData();
  }, []); // Only run on mount
  const saveState = React.useCallback(() => {
    if (isLoaded) {
      window.storeApi.set('fileTree', items);
      window.storeApi.set('expandedItems', expandedItems)
      // window.storeApi.set('tabs', tabs);
      // window.storeApi.set('activeValue', activeValue);
    }
  }, [expandedItems, isLoaded, items]);
  // Save state when app is closed or when component unmounts
  React.useEffect(() => {
    return () => {
      saveState(); // Save one last time when unmounting
    };
  }, [saveState]);

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
