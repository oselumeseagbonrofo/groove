'use client';

import { useState, useRef, useCallback } from 'react';

/**
 * ImageUpload - File input with drag-and-drop support for custom vinyl images
 * Validates image format (JPEG, PNG) and size (max 4MB)
 * Requirements: 4.5
 * 
 * @param {Object} props
 * @param {Function} props.onImageUpload - Callback with uploaded image data
 * @param {Function} props.onError - Callback for validation errors
 * @param {Function} props.onClose - Callback to close the upload modal
 * @param {boolean} props.isUploading - Whether upload is in progress
 */

// Validation constants
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB in bytes
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

/**
 * Property 11: Image Upload Validation
 * For any uploaded file, the validation function SHALL accept only files
 * with MIME type image/jpeg or image/png AND file size <= 4MB, rejecting all others.
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file format. Please upload a JPEG or PNG image.' 
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: 'File too large. Maximum size is 4MB.' 
    };
  }

  return { valid: true, error: null };
}

export default function ImageUpload({
  onImageUpload = () => {},
  onError = () => {},
  onClose = () => {},
  isUploading = false
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFile = useCallback((file) => {
    const validation = validateImageFile(file);
    
    if (!validation.valid) {
      onError(validation.error);
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setSelectedFile(file);
  }, [onError]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleConfirmUpload = async () => {
    if (selectedFile && preview) {
      await onImageUpload({
        file: selectedFile,
        previewUrl: preview,
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size
      });
    }
  };

  const handleClearSelection = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Upload Custom Image
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close upload dialog"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drop Zone */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isDragging 
              ? 'border-teal-primary bg-teal-primary/5' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {preview ? (
            <div className="space-y-4">
              <div className="w-32 h-32 mx-auto rounded-lg overflow-hidden shadow-md">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-gray-600 truncate max-w-full">
                {selectedFile?.name}
              </p>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <svg 
                className="w-12 h-12 mx-auto text-gray-400 mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              <p className="text-gray-600 mb-2">
                Drag and drop an image here
              </p>
              <p className="text-sm text-gray-400 mb-4">
                or
              </p>
              <button
                type="button"
                onClick={handleBrowseClick}
                className="px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-teal-primary/90 transition-colors"
              >
                Browse Files
              </button>
            </>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Select image file"
        />

        {/* File Requirements */}
        <p className="text-xs text-gray-500 mt-3 text-center">
          Accepted formats: JPEG, PNG • Max size: 4MB
        </p>

        {/* Action Buttons */}
        {preview && (
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmUpload}
              disabled={isUploading}
              className="flex-1 py-3 bg-teal-primary text-white rounded-lg hover:bg-teal-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Use Image'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
