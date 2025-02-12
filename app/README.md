# App
Vscode-like ui, Sidebar + Explorer + right content area
Using Material-UI
## Development
### Create a new page
panel and content will be loaded as this image:\
![layout](layout.png)
> buttons are used to switch between pages
essential components are in src/components/common/\
To create a new page, create a new folder in src/components/\
you can import ResizablePanel for Panel template\
```tsx
/* code to create a custom panel */
import React from 'react';
import ResizablePanel from '../common/Panel';

interface CustomProps {
    prop1: number,
    prop2: string
}

// create a CustomPanel component extends ResizablePanel, add custom components to the panel
const CustomPanel: React.FC<CustomProps> = () => {
  return (
    <ResizablePanel>
        add your custom components here
    </ResizablePanel>
  );
};

export default CustomPanel;
```
\
you can create your Context.tsx
```tsx
/* code to create a custom panel */
import React from 'react';

interface CustomProps {
    prop1: number,
    prop2: string
}

const CustomContent: React.FC<CustomProps> = () => {
  return (
    <Box> add your context page here </Box>
  );
};

export default CustomContent;
```
finally, config your page by creating `config.ts`
```ts
import { ComponentConfig } from '../../types/config';

const config: ComponentConfig = {
  id: 'NoteEditor', /* id, must be the same as folder name */
  name: 'Note Editor', /* name */
  panelComponent: 'Panel',  /* the name of the Panel component tsx file */
  contextComponent: 'Context',  /* the name of the Context component tsx file */
  button: {
    icon: 'FolderOutlined', /* the name of the icon in material ui icons module, you can find them in https://mui.com/material-ui/material-icons */
    label: 'Explorer', /* name, will not be rendered */
    order: 1 /* order of the button on sidebar, optional */
  }
};

export default config;
```
\
Then, loader will load your page as config.ts