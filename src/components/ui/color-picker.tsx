
import React from 'react';
import { Input } from '@/components/ui/input';

interface ColorPickerProps {
  id?: string;
  color: string;
  onColorChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ id, color, onColorChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <Input
        id={id}
        type="color"
        value={color}
        onChange={(e) => onColorChange(e.target.value)}
        className="w-12 h-8 p-1 border rounded cursor-pointer"
      />
      <Input
        type="text"
        value={color}
        onChange={(e) => onColorChange(e.target.value)}
        className="flex-1 text-sm"
        placeholder="#000000"
      />
    </div>
  );
};
