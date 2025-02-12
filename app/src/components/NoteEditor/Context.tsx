import React, { useState } from 'react';
import { Tabs, Tab, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Tiptap from './Editor';
import './Context.scss';

interface TabPanelItem {
  id: string;
  title: string;
  content: string;
}

const TabPanel: React.FC = () => {
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

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable tabs"
        >
          {tabs.map(tab => (
            <Tab
              key={tab.id}
              value={tab.id}
              label={
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
              }
            />
          ))}
        </Tabs>
      </Box>
      <Box>
        {tabs.map(tab => (
          <Box
            key={tab.id}
            role="tabpanel"
            hidden={activeTab !== tab.id}
            id={`tabpanel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
          >
            {activeTab === tab.id && (
              <Tiptap content={tab.content} />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default TabPanel;