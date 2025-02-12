import React, { lazy, useState, useEffect, Suspense, ComponentType } from 'react';
import Sidebar from './components/common/Sidebar';
import { loadConfigs } from './utils/loader';
import { ComponentConfig } from './types/config';
import './themes/default.css';
import './App.css';
import { Box } from '@mui/material';

const App: React.FC = () => {
  const [configs, setConfigs] = useState<ComponentConfig[]>([]);
  const [activeView, setActiveView] = useState<string>('explorer');
  // const [colorMode, setMode] = useState<'dark' | 'light'>('dark');
  useEffect(() => {
    loadConfigs().then(setConfigs);
  }, []);
  const [ActivePanel, setActivePanel] = useState<ComponentType>(() => () => <div>Loading panel...</div>);
  const [ActiveContext, setActiveContext] = useState<ComponentType>(() => () => <div>Loading context...</div>);
  useEffect(() => {setActiveView("NoteEditor");}, []);
  useEffect(() => {
    const activeConfig = configs.find(config => config.id === activeView);
    
    if (activeConfig) {
      // Load panel component
      const PanelComponent = lazy(() => {
        // @vite-ignore
        return import(`./components/${activeConfig.id}/${activeConfig.panelComponent}.tsx`)
          .then(module => ({ default: module.default || module }));
      });
      
      // Load context component
      const ContextComponent = lazy(() => {
        // @vite-ignore
        return import(`./components/${activeConfig.id}/${activeConfig.contextComponent}.tsx`)
          .then(module => ({ default: module.default || module }));
      });

      setActivePanel(() => PanelComponent);
      setActiveContext(() => ContextComponent);
    }
  }, [activeView, configs]);
  // const toggleDarkmode = () => {
  //   const newMode = colorMode === 'dark' ? 'light' : 'dark';
  //   setMode(newMode);
  //   document.documentElement.setAttribute('data-theme', newMode);
  // };

  return (
    <Box className="app-container">
      <Sidebar
        configs={configs}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <Suspense fallback={<div>Loading panel...</div>}>
        <ActivePanel />
        <ActiveContext />
      </Suspense>
    </Box>
  );
};

export default App;