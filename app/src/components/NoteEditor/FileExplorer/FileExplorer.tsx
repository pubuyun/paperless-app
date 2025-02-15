import * as React from 'react';
import clsx from 'clsx';
import { animated, useSpring } from '@react-spring/web';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { useTreeItem2 } from '@mui/x-tree-view/useTreeItem2';
import {
  TreeItem2Checkbox,
  TreeItem2Content,
  TreeItem2IconContainer,
  TreeItem2Label,
  TreeItem2Root,
  TreeItem2Props,
} from '@mui/x-tree-view/TreeItem2';
import { TreeItem2Icon } from '@mui/x-tree-view/TreeItem2Icon';
import { TreeItem2Provider } from '@mui/x-tree-view/TreeItem2Provider';
import { TreeItem2DragAndDropOverlay } from '@mui/x-tree-view/TreeItem2DragAndDropOverlay';
import { SvgIconComponent } from '@mui/icons-material';

// icons ---------------- 
import ArticleIcon from '@mui/icons-material/Article';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderRounded from '@mui/icons-material/FolderRounded';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
// -----------------------

import { FileType, FileItem, loadDirectoryContents, createFile, createDirectory, deleteItem } from './loadFiles';
import { constants } from 'node:buffer';

interface CustomLabelProps {
  icon?: SvgIconComponent;
  expandable?: boolean;
  children?: React.ReactNode;
}

interface CustomTreeItemProps extends Omit<TreeItem2Props, 'label'> {
  id?: string;
  itemId: string;
  label?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

interface TransitionProps {
  in?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

interface MultiSelectFileExplorerProps {
  defaultExpandedItems?: string[];
  onSelectionChange?: (selectedItems: string[]) => void;
  onItemsChange?: (items: FileItem[]) => void;
}

// ------------- components ----------------
const AnimatedCollapse = animated(Collapse);
function DotIcon() {
  return (
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: '70%',
        bgcolor: 'warning.main',
        display: 'inline-block',
        verticalAlign: 'middle',
        zIndex: 1,
        mx: 1,
      }}
    />
  );
}

const StyledTreeItemRoot = styled(TreeItem2Root)(({ theme }) => ({
  color: theme.palette.grey[400],
  position: 'relative',
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: theme.spacing(3.5),
  },
  ...theme.applyStyles('light', {
    color: theme.palette.grey[800],
  }),
}));

const CustomTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
  flexDirection: 'row-reverse',
  borderRadius: theme.spacing(0.7),
  marginBottom: theme.spacing(0.5),
  marginTop: theme.spacing(0.5),
  padding: theme.spacing(0.5),
  paddingRight: theme.spacing(1),
  fontWeight: 500,
  [`&.Mui-expanded `]: {
    '&:not(.Mui-focused, .Mui-selected, .Mui-selected.Mui-focused) .labelIcon': {
      color: theme.palette.primary.dark,
      ...theme.applyStyles('light', {
        color: theme.palette.primary.main,
      }),
    },
    '&::before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      left: '16px',
      top: '44px',
      height: 'calc(100% - 48px)',
      width: '1.5px',
      backgroundColor: theme.palette.grey[700],
      ...theme.applyStyles('light', {
        backgroundColor: theme.palette.grey[300],
      }),
    },
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: 'white',
    ...theme.applyStyles('light', {
      color: theme.palette.primary.main,
    }),
  },
  [`&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused`]: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
    ...theme.applyStyles('light', {
      backgroundColor: theme.palette.primary.main,
    }),
  },
}));



function TransitionComponent(props: TransitionProps) {
  const style = useSpring({
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(0,${props.in ? 0 : 20}px,0)`,
    },
  });

  return <AnimatedCollapse style={style} {...props} />;
}

const StyledTreeItemLabelText = styled(Typography)({
  color: 'inherit',
  fontFamily: 'General Sans',
  fontWeight: 500,
});


function CustomLabel({ icon: Icon, expandable, children, ...other }: CustomLabelProps) {
  return (
    <TreeItem2Label
      {...other}
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {Icon && (
        <Box
          component={Icon}
          className="labelIcon"
          color="inherit"
          sx={{ mr: 1, fontSize: '1.2rem' }}
        />
      )}

      <StyledTreeItemLabelText variant="body2">{children}</StyledTreeItemLabelText>
      {expandable && <DotIcon />}
    </TreeItem2Label>
  );
}


const CustomTreeItem = React.forwardRef<HTMLLIElement, CustomTreeItemProps>(
  function CustomTreeItem(props: CustomTreeItemProps, ref) {
    const { id, itemId, label, disabled, children, ...other } = props;

    const {
      getRootProps,
      getContentProps,
      getIconContainerProps,
      getCheckboxProps,
      getLabelProps,
      getGroupTransitionProps,
      getDragAndDropOverlayProps,
      status,
      publicAPI,
    } = useTreeItem2({ 
      id, 
      itemId, 
      children, 
      label, 
      disabled, 
      rootRef: ref 
    });

    const item = publicAPI.getItem(itemId);
    const expandable = isExpandable(children);
    let icon;
    if (expandable) {
      icon = FolderRounded;
    } else if (item.fileType) {
      icon = getIconFromFileType(item.fileType as FileType);
    }

    return (
      <TreeItem2Provider itemId={itemId}>
        <StyledTreeItemRoot {...getRootProps(other as object)}>
          <CustomTreeItemContent
            {...getContentProps({
              className: clsx('content', {
                'Mui-expanded': status.expanded,
                'Mui-selected': status.selected,
                'Mui-focused': status.focused,
                'Mui-disabled': status.disabled,
              }),
            })}
          >
            <TreeItem2IconContainer {...getIconContainerProps()}>
              <TreeItem2Icon status={status} />
            </TreeItem2IconContainer>
            <TreeItem2Checkbox {...getCheckboxProps()} />
            <CustomLabel
              {...getLabelProps({ 
                icon, 
                expandable: expandable && status.expanded 
              })}
            />
            <TreeItem2DragAndDropOverlay {...getDragAndDropOverlayProps()} />
          </CustomTreeItemContent>
          {children && <TransitionComponent {...getGroupTransitionProps()} />}
        </StyledTreeItemRoot>
      </TreeItem2Provider>
    );
  }
);
// ------------- end components ----------------

// ------------- logic ----------------

const isExpandable = (reactChildren: React.ReactNode): boolean => {
  if (Array.isArray(reactChildren)) {
    return reactChildren.length > 0 && reactChildren.some(isExpandable);
  }
  return Boolean(reactChildren);
};

const getIconFromFileType = (fileType: FileType) => {
  switch (fileType) {
    case 'image':
      return ImageIcon;
    case 'pdf':
      return PictureAsPdfIcon;
    case 'doc':
      return ArticleIcon;
    case 'video':
      return VideoCameraBackIcon;
    case 'folder':
      return FolderRounded;
    case 'pinned':
      return FolderOpenIcon;
    case 'trash':
      return DeleteIcon;
    default:
      return ArticleIcon;
  }
};

export default function MultiSelectFileExplorer({
    defaultExpandedItems = ['1', '1.1'],
    onSelectionChange,
    onItemsChange,
  }: MultiSelectFileExplorerProps) {
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const [items, setItems] = React.useState<FileItem[]>([]);

  const handleContextMenu = async (event: React.MouseEvent) => {
    event.preventDefault();
    window.IpcApi.send('show-context-menu');
  };

  const getFileType = (fileName: string): FileType => {
    const ext = fileName.split('.').pop()?.toLowerCase();
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
  };
  const sortItems = (items: FileItem[]): FileItem[] => {
    return items.sort((a, b) => {
      // First sort by type (folders first)
      if ((a.fileType === 'folder') !== (b.fileType === 'folder')) {
        return a.fileType === 'folder' ? -1 : 1;
      }
      // Then sort alphabetically by label
      return a.label.localeCompare(b.label);
    }).map(item => {
      // Recursively sort children if they exist
      if (item.fileType === 'folder' && item.children) {
        return {
          ...item,
          children: sortItems(item.children)
        };
      }
      return item;
    });
  };

  const updateItemsRecursively = (items: FileItem[], parentPath: string, newFile: FileItem): FileItem[] => {
    return items.map(item => {
      if (item.fileType === 'folder' && item.id === parentPath) {
        return {
          ...item,
          children: [...(item.children || []), newFile]
        };
      } else if (item.children) {
        return {
          ...item,
          children: updateItemsRecursively(item.children, parentPath, newFile)
        };
      }
      return item;
    });
  };
  const handleOpenFolder = React.useCallback(async (dialogResult: { canceled: boolean; filePaths: string[] }) => {
    if (!dialogResult.canceled && dialogResult.filePaths.length > 0) {
      const folderPath = dialogResult.filePaths[0];
      const contents = await loadDirectoryContents(folderPath);
      
      const newFolder = {
        id: folderPath,
        label: folderPath,
        fileType: 'folder' as const,
        children: sortItems(contents)
      };

      setItems([newFolder]);
      onItemsChange?.([newFolder]);
    }
  }, [onItemsChange]);

  const handleNewFile = React.useCallback(async (dialogResult: { canceled: boolean; filePath?: string }) => {
    if (!dialogResult.canceled && dialogResult.filePath !== undefined) {
      await createFile(dialogResult.filePath, '');
      const fileName = await window.FileApi.pathBasename(dialogResult.filePath);
      const parentPath = await window.FileApi.pathDirname(dialogResult.filePath);
      const newFile:FileItem = {
        id: dialogResult.filePath,
        label: fileName,
        fileType: getFileType(fileName)
      };
      setItems(prevItems => {
        const newItems = updateItemsRecursively(prevItems, parentPath, newFile);
        onItemsChange?.(newItems);
        return sortItems(newItems);
      });
    }
  }, [onItemsChange]);

  const handleNewFolder = React.useCallback(async (dialogResult: { canceled: boolean; filePath?: string }) => {
    if (!dialogResult.canceled && dialogResult.filePath) {
      createDirectory(dialogResult.filePath);
      const folderName = await window.FileApi.pathBasename(dialogResult.filePath);
      const parentPath = await window.FileApi.pathDirname(dialogResult.filePath);
      const newFolder:FileItem = {
        id: dialogResult.filePath,
        label: folderName,
        fileType: 'folder' as const,
        children: []
      };

      setItems(prevItems => {
        const newItems = updateItemsRecursively(prevItems, parentPath, newFolder);
        onItemsChange?.(newItems);
        return sortItems(newItems);
      });
    }
  }, [onItemsChange]);

  const handleDeleteOperation = React.useCallback(async (result: { response: number }) => {
    console.log("Delete operation triggered with result:", result);
    console.log("Selected items:", selectedItems);
    if (result.response === 0 && selectedItems.length > 0) {
      await Promise.all(selectedItems.map(itemId => deleteItem(itemId)));
      setItems(prevItems => {
        const deleteItemsRecursively = (items: FileItem[], deletingIds: string[]): FileItem[] => {
          return items.reduce((acc, item) => {
            if (deletingIds.includes(item.id)) {
              return acc;
            }
            if (item.children) {
              return [
                ...acc,
                {
                  ...item,
                  children: deleteItemsRecursively(item.children, deletingIds)
                }
              ];
            }
            return [...acc, item];
          }, [] as FileItem[]);
        };
        const newItems = deleteItemsRecursively(prevItems, selectedItems);
        setItems(newItems);
        onItemsChange?.(newItems);
        console.log("Items deleted successfully", newItems);
        return newItems;
      });
      setSelectedItems([]);
    }
  }, [selectedItems, onItemsChange]);
  const subscription = React.useRef<{ channel: string; listener: any }[]>([]);
  React.useEffect(() => {
    if (subscription) {
      subscription.current.forEach(({ channel, listener }) => {
        window.IpcApi.off(channel, listener);
      });
      console.log("Unsubscribed from IPC events");
    }
    subscription.current = [];
    const handlers = {
      folderOpen: (...args: unknown[]) => {
        const dialogResult = args[0] as { canceled: boolean; filePaths: string[] };
        console.log("Folder open dialog completed", dialogResult);
        void handleOpenFolder(dialogResult);
      },
      newFile: (...args: unknown[]) => {
        const dialogResult = args[0] as { canceled: boolean; filePath?: string };
        console.log("New file dialog completed", dialogResult);
        void handleNewFile(dialogResult);
      },
      newFolder: (...args: unknown[]) => {
        const dialogResult = args[0] as { canceled: boolean; filePath?: string };
        console.log("New folder dialog completed", dialogResult);
        void handleNewFolder(dialogResult);
      },
      delete: (...args: unknown[]) => {
        const result = args[0] as { response: number };
        console.log("Delete confirmed", result);
        void handleDeleteOperation(result);
      }
    };
    subscription.current.push( { channel: 'open-folder-dialog-completed', listener: window.IpcApi.on('open-folder-dialog-completed', handlers.folderOpen) });
    subscription.current.push( { channel: 'new-file-dialog-completed', listener: window.IpcApi.on('new-file-dialog-completed', handlers.newFile) });
    subscription.current.push( { channel: 'new-folder-dialog-completed', listener: window.IpcApi.on('new-folder-dialog-completed', handlers.newFolder) });
    subscription.current.push( { channel: 'delete-confirmed', listener: window.IpcApi.on('delete-confirmed', handlers.delete) });
    console.log("Subscribed to IPC events", subscription.current);
    return () => {
      window.IpcApi.off('open-folder-dialog-completed', handlers.folderOpen);
      window.IpcApi.off('new-file-dialog-completed', handlers.newFile);
      window.IpcApi.off('new-folder-dialog-completed', handlers.newFolder);
      window.IpcApi.off('delete-confirmed', handlers.delete);
    };
  }, [handleDeleteOperation, handleNewFile, handleNewFolder, handleOpenFolder]);

  const handleSelectionChange = (event: React.SyntheticEvent, itemIds: string[]) => {
    console.log("selection changed, original", selectedItems, "new", itemIds);
    setSelectedItems(itemIds);
    onSelectionChange?.(itemIds);
  };
// ------------- end logic ----------------
  return (
    <Box onContextMenu={handleContextMenu}>
      <RichTreeView
        items={items}
        defaultExpandedItems={defaultExpandedItems}
        multiSelect
        isItemEditable={(item)=>item!=items[0]}
        experimentalFeatures={{ labelEditing: true }}
        selectedItems={selectedItems}
        onSelectedItemsChange={handleSelectionChange}
        sx={{ 
          height: 'fit-content', 
          flexGrow: 1, 
          maxWidth: 400, 
          overflowY: 'auto',
          '& .MuiTreeItem-content': {
            padding: '4px 8px',
          },
        }}
        slots={{ item: CustomTreeItem }}
      />
    </Box>
  );
}
