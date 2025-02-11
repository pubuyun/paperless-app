import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ResizablePanel from './components/NoteEditor/ResizablePanel';
import TabPanel from './components/NoteEditor/TabPanel';
import './themes/default.css';
import './App.css';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('explorer');
  const [colorMode, setMode] = useState<'dark' | 'light'>('dark');

  const toggleDarkmode = () => {
    const newMode = colorMode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    document.documentElement.setAttribute('data-theme', newMode);
  };

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <ResizablePanel>
        {activeView === 'explorer' && <div className="panel-content">Explorer Content</div>}
        {activeView === 'search' && <div className="panel-content">Search Content</div>}
        {activeView === 'git' && <div className="panel-content">Git Content</div>}
      </ResizablePanel>
      <TabPanel />
    </div>
  );
};

export default App;