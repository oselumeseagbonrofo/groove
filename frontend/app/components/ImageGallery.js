'use client';

import Image from "next/image";

/**
 * ImageGallery - Preset image selection for vinyl label
 * Displays preset image options and handles image selection
 * Requirements: 4.4
 * 
 * @param {Object} props
 * @param {Array} props.images - Array of preset image objects { id, url, name }
 * @param {string|null} props.selectedImage - Currently selected image URL
 * @param {Function} props.onImageSelect - Callback when image is selected
 * @param {Function} props.onUploadClick - Callback when upload button is clicked
 */
export default function ImageGallery({
  images = [],
  selectedImage = null,
  onImageSelect = () => { },
  onUploadClick = () => { }
}) {
  // Default preset images if none provided
  const presetImages = images.length > 0 ? images : [
    { id: 'preset-1', url: '/preset-checkerboard.jpg', name: 'Checkerboard' },
    { id: 'preset-2', url: '/preset-sunburst.jpg', name: 'Retro Sunburst' },
    { id: 'preset-3', url: '/preset-portrait.jpg', name: 'Vintage Portrait' },
    { id: 'preset-4', url: '/preset-star.jpg', name: 'Star' },
    { id: 'preset-5', url: '/preset-woman.jpg', name: 'Woman' },
  ];

  /**
   * Property 10: Image Selection Application
   * For any image selected from the gallery, the vinyl label preview
   * SHALL display that image as the center label.
   */
  const handleImageClick = (image) => {
    onImageSelect(image);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Label Image
      </label>

      {/* Image Grid */}
      <div
        className="grid grid-cols-3 sm:grid-cols-4 gap-3"
        role="radiogroup"
        aria-label="Select vinyl label image"
      >
        {presetImages.map((image) => (
          <button
            key={image.id}
            type="button"
            role="radio"
            aria-checked={selectedImage?.id === image.id}
            onClick={() => handleImageClick(image)}
            className={`aspect-square rounded-lg overflow-hidden transition-all duration-150 ${
              selectedImage?.id === image.id
                ? 'ring-2 ring-offset-2 scale-105 shadow-lg'
                : 'hover:scale-102 hover:shadow-md'
            }`}
            style={selectedImage?.id === image.id ? { '--tw-ring-color': '#b149c2' } : {}}
            aria-label={`Select ${image.name}`}
          >
            {image.url ? (
              <Image
                width={250}
                height={250}
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover"
              />
            ) : (
              /* Gradient placeholder for preset abstract images */
              <div
                className={`w-full h-full bg-gradient-to-br ${image.gradient || 'from-gray-300 to-gray-400'} flex items-center justify-center`}
              >
                <span className="text-white text-xs font-medium opacity-80">
                  {image.name}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Upload Custom Image Button */}
      <button
        type="button"
        onClick={onUploadClick}
        className="mt-4 flex items-center gap-2 text-sm transition-colors"
        style={{ color: '#2d1b4e' }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#3d2b5e'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#2d1b4e'}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Upload custom image
      </button>
    </div>
  );
}
