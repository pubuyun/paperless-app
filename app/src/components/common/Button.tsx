import React from 'react';
import './Button.css';

interface ButtonProps {
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  label?: string;
}

const Button: React.FC<ButtonProps> = ({ icon, active = false, onClick, label }) => {
  return (
    <button
      className={`sidebar-button ${active ? 'active' : ''}`}
      onClick={onClick}
      title={label}
    >
      {icon}
    </button>
  );
};

export default Button;