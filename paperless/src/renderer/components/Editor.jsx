import { Box, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';

const EditorContainer = styled(Box)({
  flex: 1,
  backgroundColor: '#1e1e1e',
  display: 'flex',
  flexDirection: 'column',
});

const TabsContainer = styled(Box)({
  backgroundColor: '#2d2d2d',
});

const StyledTab = styled(Tab)({
  color: '#969696',
  minHeight: '35px',
  textTransform: 'none',
  fontSize: '13px',
  padding: '0 16px',
  '&.Mui-selected': {
    color: '#ffffff',
  },
});

const Editor = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <EditorContainer>
      <TabsContainer>
        <Tabs
          value={value}
          onChange={handleChange}
          TabIndicatorProps={{
            style: {
              display: 'none',
            },
          }}
        >
          <StyledTab label="index.html" />
          <StyledTab label="App.jsx" />
          <StyledTab label="styles.css" />
        </Tabs>
      </TabsContainer>
      <Box sx={{ flex: 1, padding: 2, color: '#d4d4d4' }}>
        {/* 这里可以放置编辑器内容 */"editor content here"}
      </Box>
    </EditorContainer>
  );
};

export default Editor;