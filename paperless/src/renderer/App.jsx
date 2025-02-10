import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import SideNav from './components/SideNav';
import Explorer from './components/Explorer';
import Editor from './components/Editor';
import { useState } from 'react';

const Container = styled(Box)({
  display: 'flex',
  height: '100vh',
  overflow: 'hidden',
});

const App = () => {
  const [activeView, setActiveView] = useState('explorer');
  const [explorerWidth, setExplorerWidth] = useState(240);

  const handleViewChange = (view) => {
    setActiveView(view);
  };

  const handleResize = (e) => {
    const newWidth = e.clientX;
    if (newWidth > 160 && newWidth < 600) {
      setExplorerWidth(newWidth);
    }
  };

  return (
    <Container>
      <SideNav activeView={activeView} onViewChange={handleViewChange} />
      <Explorer width={explorerWidth} onResize={handleResize} isVisible={activeView === 'explorer'} />
      <Editor />
    </Container>
  );
};

export default App;