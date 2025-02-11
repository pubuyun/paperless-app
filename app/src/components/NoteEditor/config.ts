import { ComponentConfig } from '../../types/config';

const config: ComponentConfig = {
  id: 'NoteEditor',
  name: 'Note Editor',
  panelComponent: './components/NoteEditor/Panel.tsx',
  contextComponent: './components/NoteEditor/Context.tsx',
  button: {
    icon: 'FolderOutlined',
    label: 'Explorer',
    order: 1
  }
};

export default config;