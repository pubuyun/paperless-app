import { ComponentConfig } from '../types/config';

export async function loadConfigs(): Promise<ComponentConfig[]> {
  const configs: ComponentConfig[] = [];
  
  // Use import.meta.glob to load all config files
  const modules = import.meta.glob('../components/*/config.ts', {
    eager: true, // Load all modules immediately
    import: 'default', // Only import default exports
  });

  // Process loaded configurations
  for (const path in modules) {
    const config = modules[path] as ComponentConfig;
    configs.push(config);
  }

  // Sort by button order
  return configs.sort((a, b) => (a.button.order || 0) - (b.button.order || 0));
}

// Helper function for dynamic component imports
export async function importComponent(componentPath: string) {
  // Remove leading './' if it exists
  const normalizedPath = componentPath.startsWith('./') 
    ? componentPath.slice(2) 
    : componentPath;
    
  // Use import.meta.glob to get all component files
  const modules = await import.meta.glob('../components/**/*.tsx', { eager: false });
  
  const matchingPath = Object.keys(modules).find(path => 
    path.includes(normalizedPath)
  );

  if (!matchingPath || !modules[matchingPath]) {
    throw new Error(`Component not found: ${componentPath}`);
  } 

  return modules[matchingPath]();
}
export async function getIconComponent(iconName: string) {
  // get the icon from mui icons
    const icon = import(`@mui/icons-material/${iconName}`);
    return icon;
}