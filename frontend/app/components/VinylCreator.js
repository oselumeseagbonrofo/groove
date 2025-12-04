'use client';

import { useState, useCallback } from 'react';
import ColorPicker from './ColorPicker';
import ImageGallery from './ImageGallery';
import ImageUpload from './ImageUpload';
import VinylPreview from './VinylPreview';

/**
 * VinylCreator - Main vinyl creation interface
 * Integrates ColorPicker, ImageGallery, and VinylPreview
 * Requirements: 4.1, 4.6, 9.6
 * 
 * @param {Object} props
 * @param {Function} props.onCreatePlaylist - Callback when playlist is created
 * @param {boolean} props.isCreating - Whether playlist creation is in progress
 * @param {string|null} props.error - Error message to display
 */
export default function VinylCreator({
  onCreatePlaylist = () => {},
  isCreating = false,
  error = null
}) {
  // State for vinyl customization
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#4A2C6D');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Handle color selection - Property 9: Color Picker Real-time Update
  const handleColorSelect = useCallback((color) => {
    setSelectedColor(color);
    // Clear image selection when color is selected (unless it's a custom upload)
    if (selectedImage && !selectedImage.previewUrl) {
      setSelectedImage(null);
    }
  }, [selectedImage]);

  // Handle image selection from gallery - Property 10: Image Selection Application
  const handleImageSelect = useCallback((image) => {
    setSelectedImage(image);
  }, []);

  // Handle upload button click
  const handleUploadClick = useCallback(() => {
    setShowUploadModal(true);
    setUploadError(null);
  }, []);

  // Handle upload error
  const handleUploadError = useCallback((errorMessage) => {
    setUploadError(errorMessage);
  }, []);

  // Handle successful image upload
  const handleImageUpload = useCallback(async (imageData) => {
    setIsUploading(true);
    try {
      // For now, use the local preview URL
      // In production, this would upload to Supabase Storage
      setSelectedImage({
        id: `custom-${Date.now()}`,
        url: imageData.previewUrl,
        previewUrl: imageData.previewUrl,
        name: imageData.name,
        isCustom: true,
        file: imageData.file
      });
      setShowUploadModal(false);
      setUploadError(null);
    } catch (err) {
      setUploadError('Failed to process image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Handle playlist creation
  const handleCreatePlaylist = useCallback(() => {
    if (!playlistName.trim()) return;

    const vinylConfig = {
      name: playlistName.trim(),
      description: playlistDescription.trim(),
      color: selectedColor,
      labelImage: selectedImage
    };

    onCreatePlaylist(vinylConfig);
  }, [playlistName, playlistDescription, selectedColor, selectedImage, onCreatePlaylist]);

  // Check if form is valid
  const isFormValid = playlistName.trim().length > 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Vinyl Preview Section - Responsive sizing */}
      <div className="flex justify-center py-3 sm:py-4">
        <VinylPreview
          color={selectedColor}
          image={selectedImage}
          playlistName={playlistName}
          size="lg"
        />
      </div>

      {/* Playlist Name Input - Touch-friendly sizing */}
      <div>
        <label 
          htmlFor="playlist-name"
          className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
        >
          Playlist Name <span className="text-red-500">*</span>
        </label>
        <input
          id="playlist-name"
          type="text"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          placeholder="Enter playlist name"
          maxLength={100}
          className="w-full px-3 sm:px-4 py-3 sm:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-primary focus:border-transparent outline-none transition-shadow text-base"
        />
      </div>

      {/* Playlist Description Input (Optional) */}
      <div>
        <label 
          htmlFor="playlist-description"
          className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
        >
          Description <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="playlist-description"
          value={playlistDescription}
          onChange={(e) => setPlaylistDescription(e.target.value)}
          placeholder="Add a description for your playlist"
          maxLength={300}
          rows={3}
          className="w-full px-3 sm:px-4 py-3 sm:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-primary focus:border-transparent outline-none transition-shadow resize-none text-base"
        />
      </div>

      {/* Color Picker */}
      <ColorPicker
        selectedColor={selectedColor}
        onColorSelect={handleColorSelect}
      />

      {/* Image Gallery */}
      <ImageGallery
        selectedImage={selectedImage}
        onImageSelect={handleImageSelect}
        onUploadClick={handleUploadClick}
      />

      {/* Upload Error Display */}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Create Playlist Button - Requirements: 9.6 (teal styling), touch-friendly */}
      <button
        type="button"
        onClick={handleCreatePlaylist}
        disabled={!isFormValid || isCreating}
        className="w-full py-3.5 sm:py-4 bg-teal-primary text-white font-semibold rounded-full shadow-lg hover:bg-teal-primary/90 active:bg-teal-primary/80 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-target"
      >
        {isCreating ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
                fill="none"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Creating...
          </span>
        ) : (
          'Create Playlist'
        )}
      </button>

      {/* Image Upload Modal */}
      {showUploadModal && (
        <ImageUpload
          onImageUpload={handleImageUpload}
          onError={handleUploadError}
          onClose={() => setShowUploadModal(false)}
          isUploading={isUploading}
        />
      )}
    </div>
  );
}
