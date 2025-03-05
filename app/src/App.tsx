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
  const [ActivePage, setActivePage] = useState<ComponentType>(() => () => <div>Loading page...</div>);
  useEffect(() => {setActiveView("Tasks");}, []);
  useEffect(() => {
    const activeConfig = configs.find(config => config.id === activeView);
    if (activeConfig) {
      const Component = lazy(() => {
        // @vite-ignore
        return import(`./components/${activeConfig.id}/${activeConfig.Component}.tsx`)
          .then(module => ({ default: module.default || module }));
      });
      setActivePage(() => Component);
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
      <Suspense fallback={<div>Loading page...</div>}>
        <ActivePage />
      </Suspense>
    </Box>
  );
};

export default App;