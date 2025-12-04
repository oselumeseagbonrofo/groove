'use client';

/**
 * ColorPicker - Vinyl color selection component
 * Displays color palette options with real-time preview update
 * Requirements: 4.3
 * 
 * @param {Object} props
 * @param {string} props.selectedColor - Currently selected color (hex)
 * @param {string[]} props.colors - Array of available color options (hex)
 * @param {Function} props.onColorSelect - Callback when color is selected
 */
export default function ColorPicker({
  selectedColor = '#4A2C6D',
  colors = [],
  onColorSelect = () => {}
}) {
  // Default color palette if none provided
  const colorOptions = colors.length > 0 ? colors : [
    '#4A2C6D', // Purple (Groove brand)
    '#E8C5D0', // Pink
    '#00BCD4', // Teal (primary action color)
    '#1DB954', // Green (Spotify green)
    '#FF6B6B', // Red
    '#FFD93D', // Yellow
    '#2D1B4E', // Dark Purple
    '#B8A4D4', // Lavender
    '#1a1a1a', // Black (classic vinyl)
    '#8B4513', // Brown (wood tone)
  ];

  /**
   * Property 9: Color Picker Real-time Update
   * For any color selection from the color picker, the vinyl preview
   * component SHALL immediately reflect that color in its rendered state.
   */
  const handleColorClick = (color) => {
    onColorSelect(color);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
        Label Color
      </label>
      <div 
        className="flex gap-2 sm:gap-3 flex-wrap"
        role="radiogroup"
        aria-label="Select vinyl label color"
      >
        {colorOptions.map((color) => (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={selectedColor === color}
            onClick={() => handleColorClick(color)}
            className={`w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full transition-all duration-150 border-2 touch-target ${
              selectedColor === color 
                ? 'ring-2 ring-offset-2 ring-teal-primary scale-110 border-white shadow-lg' 
                : 'border-transparent hover:scale-105 active:scale-95 hover:shadow-md'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  );
}
