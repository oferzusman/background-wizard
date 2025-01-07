interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  return (
    <div className="flex items-center gap-4">
      <input
        type="color"
        value={value.startsWith('#') ? value : '#ffffff'}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded cursor-pointer"
      />
    </div>
  );
};