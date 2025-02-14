import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import CloseIcon from '@mui/icons-material/Close';
import { DragDropContext, Droppable, DropResult, DroppableProvided } from '@hello-pangea/dnd';
import DraggableTab from './DraggableTab';
import Tiptap from './Editor';
import './Context.scss';

interface TabPanelItem {
  id: string;
  title: string;
  content: string;
}

const TabContainer: React.FC = () => {
  const [tabs, setTabs] = useState<TabPanelItem[]>([
    { id: '1', title: 'index.tsx', content: 'Content of index.tsx' },
    { id: '2', title: 'styles.css', content: 'Content of styles.css' },
  ]);
  const [activeTab, setActiveTab] = useState('1');

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleTabClose = (event: React.MouseEvent, tabId: string) => {
    event.stopPropagation();
    setTabs(tabs.filter(tab => tab.id !== tabId));
    if (activeTab === tabId && tabs.length > 1) {
      setActiveTab(tabs[0].id === tabId ? tabs[1].id : tabs[0].id);
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
    <TabList
      onChange={handleTabChange}
      aria-label="Editor tabs"
      variant="scrollable"
      sx={{ minHeight: 48 , minWidth: '100%' }}
    >
      {tabs.map((tab, index) => {
        const label = (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {tab.title}
            <IconButton
              size="small"
              onClick={(e) => handleTabClose(e, tab.id)}
              sx={{ ml: 1 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        );

        return (
          <DraggableTab
            key={tab.id}
            id={tab.id}
            index={index}
            value={tab.id}
            label={label}
          />
        );
      })}
      {droppableProvided?.placeholder}
    </TabList>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="1" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{ display: 'flex', overflow: 'auto' }}
                >
                  {renderTabList(provided)}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Box>
        {tabs.map((tab) => (
          <TabPanel key={tab.id} value={tab.id}>
            <Tiptap content={tab.content} />
          </TabPanel>
        ))}
      </TabContext>
    </Box>
  );
};

export default TabContainer;
