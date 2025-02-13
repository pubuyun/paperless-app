import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import CloseIcon from '@mui/icons-material/Close';
import { DragDropContext, Droppable, DropResult, DroppableProvided } from '@hello-pangea/dnd';
import DraggableTab from './DraggableTab';
import Tiptap from './Editor';
import Stack from "@mui/material/Stack";
import './Context.scss';

interface tabInterface {
  id: string;
  label: string;
  value: string;
  content: string;
}

const TabContainer: React.FC = () => {
  const [tabs, setTabs] = React.useState<tabInterface[]>(
    [...Array(55)].map((_, index) => ({
      id: `${index + 1}`,
      label: `Tab ${index + 1}`,
      value: `${index + 1}`,
      content: `Content ${index + 1}`
    }))
  );
  const [activeTabValue, setactiveTabValue] = useState('1');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setactiveTabValue(newValue);
  };

  const handleTabClick = (value: string) => {
    setactiveTabValue(value);
  };

  const handleTabClose = (event: React.MouseEvent, tabId: string) => {
    event.stopPropagation();
    setTabs(tabs.filter(tab => tab.id !== tabId));
    if (activeTabValue === tabId && tabs.length > 1) {
      setactiveTabValue(tabs[0].id === tabId ? tabs[1].id : tabs[0].id);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newTabs = Array.from(tabs);
    const [draggedTab] = newTabs.splice(result.source.index, 1);
    newTabs.splice(result.destination.index, 0, draggedTab);
    setTabs(newTabs);
  };

  const renderTabList = (droppableProvided: DroppableProvided) => (
    <div
      ref={droppableProvided.innerRef}
      {...droppableProvided.droppableProps}
    >
      <TabList
        onChange={handleTabChange}
        aria-label="Editor tabs"
        variant="scrollable"
        sx={{ minHeight: 48, minWidth: '100%' }}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {tabs.map((tab, index) => {
          return (
            <DraggableTab
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={
                <IconButton
                  size="small"
                  onClick={(event) => handleTabClose(event, tab.id)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
              value={tab.value}
              index={index}
              onClick={() => handleTabClick(tab.value)}
            />
          );
        })}
      </TabList>
      {droppableProvided?.placeholder}
    </div>
  );
  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <TabContext value={activeTabValue}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Stack direction="column">
            <DragDropContext onDragEnd={onDragEnd}>
              <div>
                <Droppable droppableId="tabs" direction="horizontal" >
                  {renderTabList}
                </Droppable>
              </div>
            </DragDropContext>
          </Stack>
        </Box>
        {tabs.map((tab) => (
          <TabPanel value={tab.value} key={tab.id}>
            <Tiptap content={tab.content} />
          </TabPanel>
        ))}
      </TabContext>
    </Box>
  );
};

export default TabContainer;
