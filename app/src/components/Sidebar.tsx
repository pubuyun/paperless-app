import React from 'react';
import { FolderOutlined, SearchOutlined, GitHub } from '@mui/icons-material';
import './Sidebar.css';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="sidebar">
      <button
        className={`sidebar-button ${activeView === 'explorer' ? 'active' : ''}`}
        onClick={() => onViewChange('explorer')}
      >
        <FolderOutlined />
      </button>
      <button
        className={`sidebar-button ${activeView === 'search' ? 'active' : ''}`}
        onClick={() => onViewChange('search')}
      >
        <SearchOutlined />
      </button>
      <button
        className={`sidebar-button ${activeView === 'git' ? 'active' : ''}`}
        onClick={() => onViewChange('git')}
      >
        <GitHub />
      </button>
    </div>
  );
};

export default Sidebar;