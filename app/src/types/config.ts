export interface ComponentConfig {
  id: string;
  name: string;
  panelComponent: string;  // Path to panel component
  contextComponent: string;  // Path to context component
  button: {
    icon: string;  // Icon name from @mui/icons-material
    label: string;
    order?: number;  // Optional order in sidebar
  };
}