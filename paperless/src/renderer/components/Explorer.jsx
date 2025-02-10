import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const ExplorerContainer = styled(Box)(({ width }) => ({
  width: `${width}px`,
  height: '100%',
  backgroundColor: '#252526',
  borderRight: '1px solid #1e1e1e',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
}));

const ResizeHandle = styled(Box)({
  position: 'absolute',
  right: '-5px',
  top: 0,
  width: '10px',
  height: '100%',
  cursor: 'ew-resize',
  zIndex: 10,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

const Explorer = ({ width, onResize, isVisible }) => {
  const handleMouseDown = () => {
    const handleMouseMove = (e) => {
      onResize(e);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (!isVisible) return null;

  return (
    <ExplorerContainer width={width}>
      <Typography
        variant="subtitle2"
        sx={{
          color: '#CCCCCC',
          padding: '10px',
          textTransform: 'uppercase',
          fontSize: '11px',
        }}
      >
        Explorer
      </Typography>
      <ResizeHandle onMouseDown={handleMouseDown} />
    </ExplorerContainer>
  );
};

export default Explorer;