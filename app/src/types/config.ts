export interface ComponentConfig {
  id: string;
  name: string;
  Component: string; // path to component
  button: {
    icon: string;  // Icon name from @mui/icons-material
    label: string;
    order?: number;  // Optional order in sidebar
  };
}