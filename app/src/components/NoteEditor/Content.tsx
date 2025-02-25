import * as React from "react";
import { useEffect } from "react";
import { Box } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { Milkdown, useEditor } from '@milkdown/react';
import DraggableTab from "./DraggableTab";
import Tab from "@mui/material/Tab";
import Stack from "@mui/material/Stack";
import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import { Crepe } from '@milkdown/crepe';
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import { replaceAll } from "@milkdown/kit/utils";
import { TabData, EditorType } from "./types";
import { writeFileContent } from "./FileExplorer/loadFiles";
import './Content.css';

interface DraggableTabsListProps {
  tabs: TabData[];
  setTabs: React.Dispatch<React.SetStateAction<TabData[]>>;
  activeValue: string;
  setActiveValue: React.Dispatch<React.SetStateAction<string>>;
}

export default function DraggableTabsList(props: DraggableTabsListProps) {
  const { tabs, setTabs } = props;
  const { activeValue, setActiveValue } = props;
  const [ content, setContent ] = React.useState('');

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const activeTab = tabs.find(t => t.value === activeValue);
        if (activeTab) {
          try {
            await writeFileContent(activeTab.filePath, activeTab.content);
            // Update the savedContent to match the current content
            setTabs(prevTabs => prevTabs.map(tab => 
              tab.value === activeValue 
                ? { ...tab, savedContent: tab.content }
                : tab
            ));
          } catch (error) {
            console.error('Failed to save file:', error);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeValue, setTabs]);

  const activeTab = tabs.find(t => t.value === activeValue);
  
  // Create editor instance and set up listeners
  const { get } = useEditor((root) => {
    const editor = new Crepe({
      root,
      defaultValue: activeTab?.content,
    });
    editor.on(listener => {
      console.log('editor listener on', listener);
      listener.markdownUpdated((ctx, markdown) => {
        setContent(markdown);
      });
    });
    return editor;
  }, []);
  const editor = get();
  // Update tabs if content changes
  useEffect(() => {
    console.log('content changed', activeValue, content);
    setTabs((prevtabs) => prevtabs.map(tab => tab.value === activeValue ? { ...tab, content } : tab)); 
  }, [activeValue, content, setTabs]);

  useEffect(() => {
    const activeTab = tabs.find(t => t.value === activeValue);
    if (!activeTab || !editor ) return;
    console.log('activeTab', activeTab);
    if (activeTab.editorType === EditorType.Markdown) {
      editor?.action(replaceAll(activeTab.content));
      console.log('replace all content to editor', tabs, "active:", activeTab.label);
    }
  }, [activeValue]);  

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveValue(newValue);
  };

  const handleTabClose = async (tabValue: string) => {
    const newTabs = tabs.filter((tab) => tab.value !== tabValue);
    setTabs(newTabs);
    if (activeValue === tabValue) {
      if (newTabs.length > 0) setActiveValue(newTabs[0].value);
      else setActiveValue("0");
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newTabs = Array.from(tabs);
    const draggedTab = newTabs.splice(result.source.index, 1)[0];
    newTabs.splice(result.destination.index, 0, draggedTab);
    setTabs(newTabs);
  };

  const _renderTabListWrappedInDroppable = () => (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ 
        display: "flex", 
        overflowX: "auto", 
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none'
      }}>
        <Droppable droppableId="1" direction="horizontal">
          {(droppableProvided) => (
            <div
              ref={droppableProvided.innerRef}
              {...droppableProvided.droppableProps}
            >
              <TabList
                onChange={handleChange}
                aria-label="Draggable Tabs"
                variant="scrollable"
                className="draggable-tabs"
                sx={{ overflowX: "auto", WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', maxWidth: '100%' }}
              >
                {tabs.map((tab, index) => {
                  const child = <Tab 
                    label={tab.label} 
                    value={tab.value} 
                    key={index} 
                    icon={
                    <Box onClick={(e) => {
                      e.stopPropagation();
                      handleTabClose(tab.value);
                    }}>
                      {tab.content == tab.savedContent && tab.content ? <CloseIcon fontSize="small" /> : <CancelIcon fontSize="small" />}
                    </Box>
                    }
                    iconPosition="end"
                    sx={{ 
                      minWidth: 120,
                      minHeight: 40,
                      cursor: "drag",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  />;

                  return (
                    <DraggableTab
                      label={tab.label}
                      value={tab.value}
                      index={index}
                      key={index}
                      child={child}
                    />
                  );
                })}
              </TabList>
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );

  return (
    <Box sx={{ minWidth: "0", typography: "body1", flex: 1, scrollbarWidth: 'none' }} className="content-area">
      <TabContext value={activeValue}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Stack direction="column">{_renderTabListWrappedInDroppable()}</Stack>
        </Box>
        <Box sx={{ padding: '2px' }}>
          <div 
            id="markdown-editor"
            className="outerEditor"
            style={{ 
              display: activeTab?.editorType === EditorType.Markdown ? 'block' : 'none' 
            }}
          > 
              <Milkdown />
          </div>
        </Box>
      </TabContext>
    </Box>
  );
}
