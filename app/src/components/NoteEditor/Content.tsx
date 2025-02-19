import * as React from "react";
import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { DragDropContext, Droppable, DropResult, DroppableProvided } from "@hello-pangea/dnd";
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
  const editorRef = React.useRef<Crepe | null>(null);
  const activeTab = tabs.find(t => t.value === activeValue);

  // Create editor once when component mounts
  useEffect(() => {
    const createEditor = async () => {
      if(editorRef.current) return;
      const editorRoot = document.querySelector('#markdown-editor');
      if (!editorRoot) return;

      const editor = new Crepe({
        root: editorRoot,
        defaultValue: '',
      });

      editor.on(listener => {
        listener.markdownUpdated((ctx, markdown) => {
          const currentTab = tabs.find(t => t.value === activeValue);
          if (currentTab) {
            currentTab.content = markdown;
            currentTab.saved = false;
            setTabs(prevTabs => prevTabs.map(t => 
              t.value === activeValue ? {...t, content: markdown, saved: false} : t
            ));
          }
        });
      });

      await editor.create();
      editorRef.current = editor;
      if (!activeTab || !editorRef.current) return;
    
      if (activeTab.editorType === EditorType.Markdown) {
        editorRef.current.editor.action(replaceAll(activeTab.content));
      }
    };

    createEditor();

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []); // Only run on mount

  // Update editor content when active tab changes
  useEffect(() => {
    if (!activeTab || !editorRef.current) return;
    
    if (activeTab.editorType === EditorType.Markdown) {
      editorRef.current.editor.action(replaceAll(activeTab.content));
      console.log('Updating editor content');
    }
  }, [activeValue]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveValue(newValue);
  };

  const handleTabClose = async (tabValue: string) => {
    const newTabs = tabs.filter((tab) => tab.value !== tabValue);
    setTabs(newTabs);
    if (activeValue === tabValue && newTabs.length > 0) {
      setActiveValue(newTabs[0].value);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newTabs = Array.from(tabs);
    const draggedTab = newTabs.splice(result.source.index, 1)[0];
    newTabs.splice(result.destination.index, 0, draggedTab);
    setTabs(newTabs);
  };

  const _renderTabList = (droppableProvided: DroppableProvided | undefined) => (
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
            {tab.saved ? <CloseIcon fontSize="small" /> : <CancelIcon fontSize="small" />}
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
      {droppableProvided ? droppableProvided.placeholder : null}
    </TabList>
  );

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
              {_renderTabList(droppableProvided)}
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
          />
        </Box>
      </TabContext>
    </Box>
  );
}
