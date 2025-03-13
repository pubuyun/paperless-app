import React, { lazy, useState, useEffect, Suspense, ComponentType, useMemo } from 'react';
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
  const [loadedComponents, setLoadedComponents] = useState<{ [key: string]: ComponentType }>({});

  useEffect(() => {setActiveView("Tasks");}, []);

  // 预加载所有组件
  useEffect(() => {
    configs.forEach(config => {
      if (!loadedComponents[config.id]) {
        const Component = lazy(() => {
          // @vite-ignore
          return import(`./components/${config.id}/${config.Component}.tsx`)
            .then(module => ({ default: module.default || module }));
        });
        setLoadedComponents(prev => ({
          ...prev,
          [config.id]: Component
        }));
      }
    });
  }, [configs]);
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
        {Object.entries(loadedComponents).map(([id, Component]) => (
          <Box key={id} sx={{ display: id === activeView ? 'flex' : 'none', flexGrow: 1 }}>
            <Component />
          </Box>
        ))}
      </Suspense>
    </Box>
  );
};

export default App;
