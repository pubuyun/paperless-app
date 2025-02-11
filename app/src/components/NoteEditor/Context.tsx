import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import './Context.css';

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

  const handleTabClose = (event: React.MouseEvent, tabId: string) => {
    event.stopPropagation();
    setTabs(tabs.filter(tab => tab.id !== tabId));
    if (activeTab === tabId && tabs.length > 1) {
      setActiveTab(tabs[0].id === tabId ? tabs[1].id : tabs[0].id);
    }
  };

  return (
    <div className="tab-container">
      <div className="tabs-header">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.title}
            <button
              className="close-button"
              onClick={(e) => handleTabClose(e, tab.id)}
            >
              <CloseIcon fontSize="small" />
            </button>
          </button>
        ))}
      </div>
      <div className="tab-content">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default TabPanel;