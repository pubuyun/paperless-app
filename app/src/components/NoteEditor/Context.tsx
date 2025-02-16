import * as React from "react";
import { Box } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { DragDropContext, Droppable, DropResult, DroppableProvided } from "@hello-pangea/dnd";
import DraggableTab from "./DraggableTab";
import Tab from "@mui/material/Tab";
import Stack from "@mui/material/Stack";
import CloseIcon from '@mui/icons-material/Close';
import Tiptap from './Tiptap/Editor';
import './Context.scss'

export default function DraggableTabsList() {
  const [activeValue, setActiveValue] = React.useState("1");

  const [tabs, setTabs] = React.useState(
    [...Array(55)].map((_, index) => ({
      id: `tab${index + 1}`,
      label: `Tab ${index + 1}`,
      value: `${index + 1}`,
      content: `Content ${index + 1}`
    }))
  );

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveValue(newValue);
  };

  const handleTabClose = (tabValue: string) => {
    const newTabs = tabs.filter((tab) => tab.value !== tabValue);
    setTabs(newTabs);
    if (activeValue === tabValue) {
      const newActiveIndex = tabs.findIndex((tab) => tab.value === newTabs[0].value);
      setActiveValue(newTabs[newActiveIndex].value);
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
    <Box sx={{ minWidth: "0", typography: "body1", flex: 1 }}>
      <TabContext value={activeValue}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Stack direction="column">{_renderTabListWrappedInDroppable()}</Stack>
        </Box>
        {tabs.map((tab, index) => (
          <TabPanel value={tab.value} key={index} sx={{ padding: '2px' }}>
            <Tiptap content={tab.content} />
          </TabPanel>
        ))}
      </TabContext>
    </Box>
  );
}
