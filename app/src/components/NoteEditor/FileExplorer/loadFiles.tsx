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
export async function buildFileTree(files: FileItem[], parentId?: string, level = 0): Promise<FileTreeItem[]> {
  const filteredFiles = await Promise.all(files.filter(async file => {
    if (!parentId) {
      if (!file.path) return false;
      const parentPath = await parhDirname(file.path);
      return parentPath === file.path;
    }
    
    if (!file.path) return false;
    const parentPath = await parhDirname(file.path);
    return parentPath === parentId;
  }));

  const treeItems = await Promise.all(filteredFiles.map(async file => {
    const treeItem: FileTreeItem = {
      ...file,
      level,
      expanded: false
    };
    
    const childFiles = await Promise.all(files.filter(async f => {
      if (!f.path || !file.path) return false;
      const parentPath = await parhDirname(f.path);
      return parentPath === file.path;
    }));

    if (childFiles.length > 0) {
      treeItem.children = await buildFileTree(files, file.path, level + 1);
      treeItem.fileType = treeItem.fileType || 'folder';
    }
    
    return treeItem;
  }));
  
  return treeItems;
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
    () => window.FileApi.readFile(path),
    `Failed to read file: ${path}`
  );
}

export async function writeFileContent(path: string, content: string): Promise<void> {
  return handleFileOperation(
    () => window.FileApi.writeFile(path, content),
    `Failed to write to file: ${path}`
  );
}

// Utility functions
export async function ensureDirectory(path: string): Promise<void> {
  const exists = await window.FileApi.exists(path);
  if (!exists) {
    await createDirectory(path);
  }
}

export async function itemExists(path: string): Promise<boolean> {
  return handleFileOperation(
    () => window.FileApi.exists(path),
    `Failed to check if item exists: ${path}`
  );
}

export async function getItemStats(path: string) {
  return handleFileOperation(
    () => window.FileApi.stat(path),
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
export async function parhDirname(path: string): Promise<string> {
  return window.FileApi.pathDirname(path);
}

export async function pathBasename(path: string): Promise<string> {
  return window.FileApi.pathBasename(path);
}

export async function pathJoin(...paths: string[]): Promise<string> {
  return window.FileApi.pathJoin(...paths);
}

// Sample data structure
// File system operations
export async function loadDirectoryContents(dirPath: string): Promise<FileItem[]> {
  const items: FileItem[] = [];
  const files = await window.FileApi.readDir(dirPath);
  for (const file of files) {
    const fullPath = await pathJoin(dirPath, file);
    const stats = await window.FileApi.stat(fullPath);
    
    const item: FileItem = {
      id: fullPath,
      label: file,
      path: fullPath,
      size: stats.size,
      modifiedAt: stats.mtime,
      createdAt: stats.ctime,
      fileType: await determineFileType(file, stats.isDirectory)
    };
    
    if (stats.isDirectory) {
      item.children = await loadDirectoryContents(fullPath);
    }
    
    items.push(item);
  }
  
  return items;
}

export async function createDirectory(path: string): Promise<FileItem> {
  await window.FileApi.mkdir(path);
  const stats = await window.FileApi.stat(path);
  const name = await pathBasename(path);
  
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
  await window.FileApi.writeFile(path, content);
  const stats = await window.FileApi.stat(path);
  const name = await pathBasename(path);
  
  return {
    id: path,
    label: name,
    path,
    fileType: await determineFileType(name, false),
    size: stats.size,
    createdAt: stats.ctime,
    modifiedAt: stats.mtime
  };
}

export async function deleteItem(path: string): Promise<void> {
  await window.FileApi.delete(path);
}

export async function moveItem(oldPath: string, newPath: string): Promise<FileItem> {
  await window.FileApi.rename(oldPath, newPath);
  const stats = await window.FileApi.stat(newPath);
  const name = await pathBasename(newPath);
  
  return {
    id: newPath,
    label: name,
    path: newPath,
    fileType: await determineFileType(name, stats.isDirectory),
    size: stats.size,
    createdAt: stats.ctime,
    modifiedAt: stats.mtime
  };
}

export async function copyItem(src: string, dest: string): Promise<FileItem> {
  await window.FileApi.copy(src, dest);
  const stats = await window.FileApi.stat(dest);
  const name = await pathBasename(dest);
  
  return {
    id: dest,
    label: name,
    path: dest,
    fileType: await determineFileType(name, stats.isDirectory),
    size: stats.size,
    createdAt: stats.ctime,
    modifiedAt: stats.mtime
  };
}

async function determineFileType(filename: string, isDirectory: boolean): Promise<FileType> {
  if (isDirectory) return 'folder';
  
  const name = await pathBasename(filename);
  const ext = name.split('.').pop()?.toLowerCase();
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
export async function isValidPath(path: string): Promise<boolean> {
  // Basic path validation
  if (!path || path.trim() === '') return false;
  
  // Check for invalid characters
  /*eslint no-control-regex: "off"*/
  const invalidChars = /[<>:"|?*-]/g;
  if (invalidChars.test(path)) return false;
  
  // Check for reserved names (Windows)
  const reservedNames = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
  if (reservedNames.test(await pathBasename(path))) return false;
  
  return true;
}

export async function isValidFileName(name: string): Promise<boolean> {
  return (await isValidPath(name)) && !(await pathBasename(name)).includes('/');
}

export async function sanitizePath(path: string): Promise<string> {
  // Use electron's path normalize to handle all path sanitization
  const normalized = await window.FileApi.pathNormalize(path);
  return normalized;
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
    if (!(await isValidPath(path))) {
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
    if (!(await isValidPath(path))) {
      throw new Error('Invalid path');
    }
    
    const exists = await itemExists(path);
    if (exists && !options.overwrite) {
      throw new FileExistsError(path);
    }
    
    if (options.recursive) {
      const dirPath = await parhDirname(path);
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
    if (!(await isValidPath(src)) || !(await isValidPath(dest))) {
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
      const dirPath = await parhDirname(dest);
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

