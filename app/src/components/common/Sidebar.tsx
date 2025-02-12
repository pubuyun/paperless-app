import React from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { ComponentConfig } from '../../types/config';
import { getIconComponent } from '../../utils/loader';

interface SidebarProps {
  configs: ComponentConfig[];
  activeView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ configs, activeView, onViewChange }) => {
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    onViewChange(newValue);
  };

  return (
    <Box>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={activeView}
        onChange={handleChange}
        aria-label="Sidebar navigation"
      >
        {configs.map((config) => {
          const IconComponent = getIconComponent(config.button.icon);
          return (
            <Tab
              key={config.id}
              value={config.id}
              icon={<IconComponent />}
              aria-label={config.button.label}
              title={config.button.label}
              sx={{
                padding: 0,
                minWidth: 48,
              }}
            />
          );
        })}
      </Tabs>
    </Box>
  );
};

export default Sidebar;