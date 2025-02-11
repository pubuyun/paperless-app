import { useState, useRef, useEffect } from 'react';
import Block from '@uiw/react-color-block';
import './MenuItemColorPicker.scss';
import MenuItem from './MenuItem';
import type { Editor } from '@tiptap/react';

interface MenuItemColorPickerProps {
  icon: string;
  title: string;
  editor: Editor;
}

function MenuItemColorPicker({ icon, title, editor }: MenuItemColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleButtonClick = () => {
    if (showPicker) {
      // If picker is already shown, clicking the button again will reset the color
      // editor.chain().focus().unsetColor().run();
      setCurrentColor('');
    } else {
      setShowPicker(true);
    }
  };

  const handleColorChange = (color: { hex: string }) => {
    // editor.chain().focus().setColor(color.hex).run();
    setCurrentColor(color.hex);
  };

  return (
    <div className="menu-item-color-picker" ref={pickerRef}>
      <MenuItem
        icon={icon}
        title={title}
        action={handleButtonClick}
      />
      {showPicker && (
        <div className="color-picker-popup">
          <Block
            color={currentColor || '#222222'}
            onChange={handleColorChange}
          />
        </div>
      )}
    </div>
  );
}

export default MenuItemColorPicker;