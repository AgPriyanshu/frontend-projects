import React, { useState, useCallback } from 'react';
import { Upload, FileImage, Loader2, Settings } from 'lucide-react';
import { MapApiService, type ObjectDetection } from '../../api/map-api';

interface ImageUploadProps {
  onDetectionComplete: (detection: ObjectDetection) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onDetectionComplete,
  onError,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Detection settings
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [modelType, setModelType] = useState<'vit_h' | 'vit_l' | 'vit_b'>('vit_h');
  const [showSettings, setShowSettings] = useState(false);
  
  // Image metadata
  const [imageName, setImageName] = useState('');
  const [centerLat, setCenterLat] = useState<number | undefined>();
  const [centerLng, setCenterLng] = useState<number | undefined>();
  const [zoomLevel, setZoomLevel] = useState(10);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    
    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Set default name if empty
    if (!imageName) {
      setImageName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadAndDetect = async () => {
    if (!selectedFile || !imageName.trim()) {
      onError('Please select a file and provide a name');
      return;
    }

    setIsUploading(true);

    try {
      const metadata = {
        name: imageName.trim(),
        center_lat: centerLat,
        center_lng: centerLng,
        zoom_level: zoomLevel,
      };

      const detectionOptions = {
        confidence_threshold: confidenceThreshold,
        model_type: modelType,
      };

      const detection = await MapApiService.uploadAndDetect(
        selectedFile,
        metadata,
        detectionOptions
      );

      onDetectionComplete(detection);
      
      // Reset form
      setSelectedFile(null);
      setImagePreview(null);
      setImageName('');
      setCenterLat(undefined);
      setCenterLng(undefined);
      setZoomLevel(10);
    } catch (error) {
      console.error('Upload and detection failed:', error);
      onError('Failed to upload and process image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setImageName('');
    setCenterLat(undefined);
    setCenterLng(undefined);
    setZoomLevel(10);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upload Geospatial Image</h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : selectedFile
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {imagePreview ? (
          <div className="space-y-3">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-w-full h-32 object-cover rounded mx-auto"
            />
            <p className="text-sm text-gray-600">{selectedFile?.name}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <FileImage className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-gray-600">
                Drop your image here or{' '}
                <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                  browse
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={disabled}
                  />
                </label>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports: JPEG, PNG, TIFF, GeoTIFF
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Metadata */}
      {selectedFile && (
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Name *
            </label>
            <input
              type="text"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter image name"
              disabled={disabled}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Center Latitude
              </label>
              <input
                type="number"
                step="any"
                value={centerLat || ''}
                onChange={(e) => setCenterLat(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Latitude"
                disabled={disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Center Longitude
              </label>
              <input
                type="number"
                step="any"
                value={centerLng || ''}
                onChange={(e) => setCenterLng(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Longitude"
                disabled={disabled}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zoom Level
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseInt(e.target.value))}
              className="w-full"
              disabled={disabled}
            />
            <div className="text-xs text-gray-500 text-center">{zoomLevel}</div>
          </div>
        </div>
      )}

      {/* Detection Settings */}
      {showSettings && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Detection Settings</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confidence Threshold: {confidenceThreshold}
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-full"
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model Type
            </label>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value as 'vit_h' | 'vit_l' | 'vit_b')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={disabled}
            >
              <option value="vit_h">ViT-H (Highest Accuracy)</option>
              <option value="vit_l">ViT-L (Balanced)</option>
              <option value="vit_b">ViT-B (Fastest)</option>
            </select>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedFile && (
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleUploadAndDetect}
            disabled={disabled || isUploading || !imageName.trim()}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload & Detect</span>
              </>
            )}
          </button>
          <button
            onClick={handleClear}
            disabled={disabled || isUploading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};
