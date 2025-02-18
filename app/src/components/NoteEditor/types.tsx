export enum EditorType {
  Markdown = 'markdown',
  Picture = 'picture',
  Pdf = 'pdf',
  Unsupported = 'unsupported',
}

export interface TabData {
  id: string;
  label: string;
  value: string;
  saved: boolean;
  editorType: EditorType;
  content: string;
  filePath?: string; // Store the actual file path for saving
}
// Event types for file operations
export interface FileOperationEvent {
  type: 'create' | 'delete' | 'move' | 'copy' | 'update';
  items: FileItem[];
  error?: Error;
}

// Operation options
export interface CreateOptions {
  overwrite?: boolean;
  recursive?: boolean;
}

export interface CopyOptions {
  overwrite?: boolean;
  recursive?: boolean;
}

export interface DeleteOptions {
  recursive?: boolean;
  force?: boolean;
}

export type FileType = 'image' | 'pdf' | 'doc' | 'video' | 'folder' | 'pinned' | 'trash' | 'markdown';

export type MetadataValue = string | number | boolean | Date | null | { [key: string]: MetadataValue };

export interface FileItem {
  id: string;
  label: string;
  fileType?: FileType;
  children?: FileItem[];
  path?: string;        // Actual file system path
  size?: number;        // File size in bytes
  modifiedAt?: Date;    // Last modified timestamp
  createdAt?: Date;     // Creation timestamp
  metadata?: {          // Optional metadata
    [key: string]: MetadataValue;
  };
}

export type FileTreeItem = FileItem & {
  parent?: FileTreeItem;  // Reference to parent item for navigation
  level: number;          // Nesting level in the tree
  expanded?: boolean;     // Whether the item is expanded in the tree view
};
