interface GradientPickerProps {
  onSelect: (gradient: string) => void;
}

const gradients = [
  "linear-gradient(to right, #ee9ca7, #ffdde1)",
  "linear-gradient(to right, #2193b0, #6dd5ed)",
  "linear-gradient(to right, #c6ffdd, #fbd786, #f7797d)",
  "linear-gradient(to right, #00b4db, #0083b0)",
  "linear-gradient(to right, #ad5389, #3c1053)",
  "linear-gradient(90deg, hsla(277, 75%, 84%, 1) 0%, hsla(297, 50%, 51%, 1) 100%)",
];

export const GradientPicker = ({ onSelect }: GradientPickerProps) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {gradients.map((gradient, index) => (
        <button
          key={index}
          onClick={() => onSelect(gradient)}
          className="h-12 rounded-lg cursor-pointer hover:ring-2 hover:ring-violet-400 transition-all"
          style={{ background: gradient }}
        />
      ))}
    </div>
  );
};