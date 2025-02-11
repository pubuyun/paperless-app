import React, {} from 'react';
import { ComponentConfig } from '../../types/config';
import { getIconComponent } from '../../utils/loader';
import './Sidebar.css';

interface SidebarProps {
  configs: ComponentConfig[];
  activeView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ configs, activeView, onViewChange }) => {
  return (
    <div className="sidebar">
      {configs.map((config) => {
        const IconComponent = getIconComponent(config.button.icon);

        return (
          <button
            key={config.id}
            className={`sidebar-button ${activeView === config.id ? 'active' : ''}`}
            onClick={() => onViewChange(config.id)}
            title={config.button.label}
          >
            <IconComponent />
          </button>
        );
      })}
    </div>
  );
};

export default Sidebar;