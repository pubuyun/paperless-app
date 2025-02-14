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

export type FileType = 'image' | 'pdf' | 'doc' | 'video' | 'folder' | 'pinned' | 'trash';

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

// Helper function to convert flat file list to tree structure
export function buildFileTree(files: FileItem[], parentId?: string, level = 0): FileTreeItem[] {
  return files
    .filter(file => {
      if (!parentId) return !file.path?.includes('/') || file.path.split('/').length === 1;
      return file.path?.startsWith(parentId + '/') && file.path.split('/').length === parentId.split('/').length + 1;
    })
    .map(file => {
      const treeItem: FileTreeItem = {
        ...file,
        level,
        expanded: false
      };
      
      const childFiles = files.filter(f => f.path?.startsWith(file.path + '/'));
      if (childFiles.length > 0) {
        treeItem.children = buildFileTree(files, file.path, level + 1);
        treeItem.fileType = treeItem.fileType || 'folder';
      }
      
      return treeItem;
    });
}

// Helper function to flatten tree structure back to list
export function flattenFileTree(tree: FileTreeItem[]): FileItem[] {
  return tree.reduce<FileItem[]>((acc, item) => {
    // Extract only FileItem properties
    const fileItem: FileItem = {
      id: item.id,
      label: item.label,
      fileType: item.fileType,
      path: item.path,
      size: item.size,
      modifiedAt: item.modifiedAt,
      createdAt: item.createdAt,
      metadata: item.metadata
    };

    acc.push(fileItem);
    if (item.children) {
      acc.push(...flattenFileTree(item.children as FileTreeItem[]));
    }
    return acc;
  }, []);
}


// Error handling wrapper
async function handleFileOperation<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    throw new Error(errorMessage);
  }
}

// File content operations
export async function readFileContent(path: string): Promise<string> {
  return handleFileOperation(
    () => window.electronApi.readFile(path),
    `Failed to read file: ${path}`
  );
}

export async function writeFileContent(path: string, content: string): Promise<void> {
  return handleFileOperation(
    () => window.electronApi.writeFile(path, content),
    `Failed to write to file: ${path}`
  );
}

// Utility functions
export async function ensureDirectory(path: string): Promise<void> {
  const exists = await window.electronApi.exists(path);
  if (!exists) {
    await createDirectory(path);
  }
}

export async function itemExists(path: string): Promise<boolean> {
  return handleFileOperation(
    () => window.electronApi.exists(path),
    `Failed to check if item exists: ${path}`
  );
}

export async function getItemStats(path: string) {
  return handleFileOperation(
    () => window.electronApi.stat(path),
    `Failed to get item stats: ${path}`
  );
}

export async function isDirectory(path: string): Promise<boolean> {
  const stats = await getItemStats(path);
  return stats.isDirectory;
}

// Batch operations
export async function deleteItems(paths: string[]): Promise<void> {
  await Promise.all(paths.map(path => 
    handleFileOperation(
      () => deleteItem(path),
      `Failed to delete item: ${path}`
    )
  ));
}

export async function copyItems(items: Array<{ src: string; dest: string }>): Promise<FileItem[]> {
  return await Promise.all(items.map(({ src, dest }) =>
    handleFileOperation(
      () => copyItem(src, dest),
      `Failed to copy from ${src} to ${dest}`
    )
  ));
}

// Path utilities
export function getParentPath(path: string): string {
  return path.split('/').slice(0, -1).join('/');
}

export function getFileName(path: string): string {
  return path.split('/').pop() || path;
}

export function combinePaths(...paths: string[]): string {
  return paths.join('/').replace(/\/+/g, '/');
}

// Sample data structure
// File system operations
export async function loadDirectoryContents(dirPath: string): Promise<FileItem[]> {
  const items: FileItem[] = [];
  const files = await window.electronApi.readDir(dirPath);
  
  for (const file of files) {
    const fullPath = dirPath.replace(/[/\\]+$/, '') + '/' + file;
    // const fullPath = file;
    console.log(dirPath, file);
    const stats = await window.electronApi.stat(fullPath);
    
    const item: FileItem = {
      id: fullPath,
      label: file,
      path: fullPath,
      size: stats.size,
      modifiedAt: stats.mtime,
      createdAt: stats.ctime,
      fileType: determineFileType(file, stats.isDirectory)
    };
    
    if (stats.isDirectory) {
      item.children = await loadDirectoryContents(fullPath);
    }
    
    items.push(item);
  }
  
  return items;
}

export async function createDirectory(path: string): Promise<FileItem> {
  await window.electronApi.mkdir(path);
  const stats = await window.electronApi.stat(path);
  const name = path.split('/').pop() || path;
  
  return {
    id: path,
    label: name,
    path,
    fileType: 'folder',
    createdAt: stats.ctime,
    modifiedAt: stats.mtime,
    children: []
  };
}

export async function createFile(path: string, content: string = ''): Promise<FileItem> {
  await window.electronApi.writeFile(path, content);
  const stats = await window.electronApi.stat(path);
  const name = path.split('/').pop() || path;
  
  return {
    id: path,
    label: name,
    path,
    fileType: determineFileType(name, false),
    size: stats.size,
    createdAt: stats.ctime,
    modifiedAt: stats.mtime
  };
}

export async function deleteItem(path: string): Promise<void> {
  await window.electronApi.delete(path);
}

export async function moveItem(oldPath: string, newPath: string): Promise<FileItem> {
  await window.electronApi.rename(oldPath, newPath);
  const stats = await window.electronApi.stat(newPath);
  const name = newPath.split('/').pop() || newPath;
  
  return {
    id: newPath,
    label: name,
    path: newPath,
    fileType: determineFileType(name, stats.isDirectory),
    size: stats.size,
    createdAt: stats.ctime,
    modifiedAt: stats.mtime
  };
}

export async function copyItem(src: string, dest: string): Promise<FileItem> {
  await window.electronApi.copy(src, dest);
  const stats = await window.electronApi.stat(dest);
  const name = dest.split('/').pop() || dest;
  
  return {
    id: dest,
    label: name,
    path: dest,
    fileType: determineFileType(name, stats.isDirectory),
    size: stats.size,
    createdAt: stats.ctime,
    modifiedAt: stats.mtime
  };
}

function determineFileType(filename: string, isDirectory: boolean): FileType {
  if (isDirectory) return 'folder';
  
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'image';
    case 'pdf':
      return 'pdf';
    case 'doc':
    case 'docx':
    case 'txt':
    case 'md':
      return 'doc';
    case 'mp4':
    case 'mov':
    case 'avi':
      return 'video';
    default:
      return 'doc';
  }
}

// Sample data structure
// Operation result types
export interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

// Validation functions
export function isValidPath(path: string): boolean {
  // Basic path validation
  if (!path || path.trim() === '') return false;
  
  // Check for invalid characters
  /*eslint no-control-regex: "off"*/
  const invalidChars = /[<>:"|?*\x00-\x1F]/g;
  if (invalidChars.test(path)) return false;
  
  // Check for reserved names (Windows)
  const reservedNames = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
  const parts = path.split('/');
  if (parts.some(part => reservedNames.test(part))) return false;
  
  return true;
}

export function isValidFileName(name: string): boolean {
  return isValidPath(name) && !name.includes('/');
}

export function sanitizePath(path: string): string {
  // Replace backslashes with forward slashes
  let sanitized = path.replace(/\\/g, '/');
  
  // Remove multiple consecutive slashes
  sanitized = sanitized.replace(/\/+/g, '/');
  
  // Remove trailing slashes
  sanitized = sanitized.replace(/\/+$/, '');
  
  return sanitized;
}

// Enhanced error classes
export class FileOperationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly path?: string
  ) {
    super(message);
    this.name = 'FileOperationError';
  }
}

export class FileNotFoundError extends FileOperationError {
  constructor(path: string) {
    super(`File not found: ${path}`, 'ENOENT', path);
    this.name = 'FileNotFoundError';
  }
}

export class FileExistsError extends FileOperationError {
  constructor(path: string) {
    super(`File already exists: ${path}`, 'EEXIST', path);
    this.name = 'FileExistsError';
  }
}

// Wrapped operations with better error handling
export async function safeCreateDirectory(path: string, options: CreateOptions = {}): Promise<OperationResult<FileItem>> {
  try {
    if (!isValidPath(path)) {
      throw new Error('Invalid path');
    }
    
    const exists = await itemExists(path);
    if (exists && !options.overwrite) {
      throw new FileExistsError(path);
    }
    
    const item = await createDirectory(path);
    return { success: true, data: item };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error occurred')
    };
  }
}

export async function safeCreateFile(
  path: string,
  content: string = '',
  options: CreateOptions = {}
): Promise<OperationResult<FileItem>> {
  try {
    if (!isValidPath(path)) {
      throw new Error('Invalid path');
    }
    
    const exists = await itemExists(path);
    if (exists && !options.overwrite) {
      throw new FileExistsError(path);
    }
    
    if (options.recursive) {
      const dirPath = getParentPath(path);
      await ensureDirectory(dirPath);
    }
    
    const item = await createFile(path, content);
    return { success: true, data: item };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error occurred')
    };
  }
}

export async function safeCopyItem(
  src: string,
  dest: string,
  options: CopyOptions = {}
): Promise<OperationResult<FileItem>> {
  try {
    if (!isValidPath(src) || !isValidPath(dest)) {
      throw new Error('Invalid path');
    }
    
    const sourceExists = await itemExists(src);
    if (!sourceExists) {
      throw new FileNotFoundError(src);
    }
    
    const destExists = await itemExists(dest);
    if (destExists && !options.overwrite) {
      throw new FileExistsError(dest);
    }
    
    if (options.recursive) {
      const dirPath = getParentPath(dest);
      await ensureDirectory(dirPath);
    }
    
    const item = await copyItem(src, dest);
    return { success: true, data: item };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error occurred')
    };
  }
}

export const SAMPLE_ITEMS = [
  {
    id: '1',
    label: 'Documents',
    children: [
      {
        id: '1.1',
        label: 'Company',
        children: [
          { id: '1.1.1', label: 'Invoice', fileType: 'pdf' },
          { id: '1.1.2', label: 'Meeting notes', fileType: 'doc' },
          { id: '1.1.3', label: 'Tasks list', fileType: 'doc' },
          { id: '1.1.4', label: 'Equipment', fileType: 'pdf' },
          { id: '1.1.5', label: 'Video conference', fileType: 'video' },
        ],
      },
      { id: '1.2', label: 'Personal', fileType: 'folder' },
      { id: '1.3', label: 'Group photo', fileType: 'image' },
    ],
  },
  {
    id: '2',
    label: 'Bookmarked',
    fileType: 'pinned',
    children: [
      { id: '2.1', label: 'Learning materials', fileType: 'folder' },
      { id: '2.2', label: 'News', fileType: 'folder' },
      { id: '2.3', label: 'Forums', fileType: 'folder' },
      { id: '2.4', label: 'Travel documents', fileType: 'pdf' },
    ],
  },
  { id: '3', label: 'History', fileType: 'folder' },
  { id: '4', label: 'Trash', fileType: 'trash' },
] as FileItem[];
