import * as React from "react";
import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { DragDropContext, Droppable, DropResult, DroppableProvided } from "@hello-pangea/dnd";
import DraggableTab from "./DraggableTab";
import Tab from "@mui/material/Tab";
import Stack from "@mui/material/Stack";
import CloseIcon from '@mui/icons-material/Close';
import { Crepe } from '@milkdown/crepe';
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import { TabData } from "./main";
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
  const editorsRef = useRef<Map<string, Crepe>>(new Map());
  
  useEffect(() => {
    // Initialize or switch editor when active tab changes
    // Function to initialize editor for a specific tab
    const initEditorForTab = async (tabValue: string) => {
      // Destroy existing editor for this tab if it exists
      const existingEditor = editorsRef.current.get(tabValue);
      if (existingEditor) {
        await existingEditor.destroy();
        editorsRef.current.delete(tabValue);
      }

      const tab = tabs.find(t => t.value === tabValue);
      const editorRoot = document.querySelector(`#editor-${tabValue}`);
      if (!tab || !editorRoot) return;

      const editor = new Crepe({
        root: editorRoot,
        defaultValue: tab.content || '# Untitled',
      });
      editor.on(listener => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        listener.markdownUpdated((ctx, markdown, prevMarkdown) => {
            tab.content = markdown;
          }
        )
      })
      await editor.create();
      // add custom settings here
      
      editorsRef.current.set(tabValue, editor);
    };
    const timer = setTimeout(() => {
      initEditorForTab(activeValue);
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [activeValue, tabs]);

  // Cleanup editors when component unmounts
  useEffect(() => {
    return () => {
      editorsRef.current.forEach(async (editor) => {
        await editor.destroy();
      });
      editorsRef.current.clear();
    };
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveValue(newValue);
  };

  const handleTabClose = async (tabValue: string) => {
    // Destroy editor for the closed tab
    const editor = editorsRef.current.get(tabValue);
    if (editor) {
      await editor.destroy();
      editorsRef.current.delete(tabValue);
    }

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
            <CloseIcon />
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
    <Box sx={{ minWidth: "0", typography: "body1", flex: 1 }} className="content-area">
      <TabContext value={activeValue}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Stack direction="column">{_renderTabListWrappedInDroppable()}</Stack>
        </Box>
        {tabs.map((tab, index) => (
          <TabPanel value={tab.value} key={index} sx={{ padding: '2px' }}>
            <div 
              id={`editor-${tab.value}`}
              className="outerEditor"
              style={{ display: tab.value === activeValue ? 'block' : 'none' }}
            />
          </TabPanel>
        ))}
      </TabContext>
    </Box>
  );
}
