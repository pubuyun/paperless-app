import React, { lazy, useState, useEffect, Suspense, ComponentType } from 'react';
import Sidebar from './components/common/Sidebar';
import { loadConfigs } from './utils/loader';
import { ComponentConfig } from './types/config';
import './themes/default.css';
import './App.css';
import config from './components/NoteEditor/config';

const App: React.FC = () => {

  const [configs, setConfigs] = useState<ComponentConfig[]>([]);
  const [activeView, setActiveView] = useState<string>('explorer');
  const [colorMode, setMode] = useState<'dark' | 'light'>('dark');
  useEffect(() => {
    loadConfigs().then(setConfigs);
  }, []);
  const [ActivePanel, setActivePanel] = useState<ComponentType>();
  const [ActiveContext, setActiveContext] = useState<ComponentType>();
  
  setActiveView(config[0].id);
  useEffect(() => {
    const activeConfig = configs.find(config => config.id === activeView);
    
    if (activeConfig) {
      // Load panel component
      const PanelComponent = lazy(() => {
        // @vite-ignore
        return import(activeConfig.panelComponent)
          .then(module => ({ default: module.default || module }));
      });
      
      // Load context component
      const ContextComponent = lazy(() => {
        // @vite-ignore
        return import(activeConfig.contextComponent)
          .then(module => ({ default: module.default || module }));
      });

      setActivePanel(() => PanelComponent);
      setActiveContext(() => ContextComponent);
    }
  }, [activeView, configs]);

  const toggleDarkmode = () => {
    const newMode = colorMode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    document.documentElement.setAttribute('data-theme', newMode);
  };

  const activeConfig = configs.find(config => config.id === activeView);
  
  

  return (
    <div className="app-container">
      <Sidebar
        configs={configs}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <Suspense fallback={<div>Loading panel...</div>}>
        <ActivePanel />
        <ActiveContext />
      </Suspense>
    </div>
  );
};

export default App;