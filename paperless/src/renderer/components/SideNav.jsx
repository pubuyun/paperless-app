import { Box, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import SearchIcon from '@mui/icons-material/Search';
import GitHubIcon from '@mui/icons-material/GitHub';
import ExtensionIcon from '@mui/icons-material/Extension';

const NavContainer = styled(Box)({
  width: '48px',
  height: '100%',
  backgroundColor: '#333333',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '8px 0',
});

const StyledIconButton = styled(IconButton)(({ active }) => ({
  color: active ? '#ffffff' : '#858585',
  borderLeft: active ? '2px solid #ffffff' : 'none',
  borderRadius: 0,
  width: '100%',
  height: '48px',
  '&:hover': {
    color: '#ffffff',
  },
}));

const SideNav = ({ activeView, onViewChange }) => {
  const navItems = [
    { id: 'explorer', icon: <FolderOutlinedIcon />, label: 'Explorer' },
    { id: 'search', icon: <SearchIcon />, label: 'Search' },
    { id: 'git', icon: <GitHubIcon />, label: 'Source Control' },
    { id: 'extensions', icon: <ExtensionIcon />, label: 'Extensions' },
  ];

  return (
    <NavContainer>
      {navItems.map((item) => (
        <StyledIconButton
          key={item.id}
          active={activeView === item.id}
          onClick={() => onViewChange(item.id)}
          aria-label={item.label}
        >
          {item.icon}
        </StyledIconButton>
      ))}
    </NavContainer>
  );
};

export default SideNav;