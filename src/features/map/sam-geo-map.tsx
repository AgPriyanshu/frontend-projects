import React, { useState, useCallback } from 'react';
import { Map } from './map';
import { ImageUpload } from './image-upload';
import type { ObjectDetection, GeospatialImageDetail } from '../../api/map-api';
import { Eye, EyeOff, Layers, Info, Download, Trash2 } from 'lucide-react';

interface SamGeoMapProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  mapStyle?: string;
  className?: string;
}

interface DetectionInfo {
  detection: ObjectDetection;
  feature: GeoJSON.Feature;
  visible: boolean;
}

export const SamGeoMap: React.FC<SamGeoMapProps> = ({
  initialCenter,
  initialZoom,
  mapStyle,
  className = "w-full h-screen",
}) => {
  const [detections, setDetections] = useState<ObjectDetection[]>([]);
  const [selectedDetection, setSelectedDetection] = useState<DetectionInfo | null>(null);
  const [showDetectionLayers, setShowDetectionLayers] = useState(true);
  const [showUploadPanel, setShowUploadPanel] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDetectionComplete = useCallback((detection: ObjectDetection) => {
    setDetections(prev => [...prev, detection]);
    setError(null);
    setShowUploadPanel(false); // Close upload panel after successful detection
    
    // Focus map on the detection if bounds are available
    // This would require implementing map bounds fitting logic
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    // Auto-clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  }, []);

  const handleDetectionClick = useCallback((detection: ObjectDetection, feature: GeoJSON.Feature) => {
    setSelectedDetection({
      detection,
      feature,
      visible: true
    });
  }, []);

  const handleClearDetections = () => {
    setDetections([]);
    setSelectedDetection(null);
  };

  const handleToggleDetectionVisibility = () => {
    setShowDetectionLayers(!showDetectionLayers);
  };

  const handleToggleUploadPanel = () => {
    setShowUploadPanel(!showUploadPanel);
  };

  const exportDetectionData = (detection: ObjectDetection) => {
    const dataStr = JSON.stringify(detection.detection_data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `detection-${detection.id}.geojson`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const removeDetection = (detectionId: string) => {
    setDetections(prev => prev.filter(d => d.id !== detectionId));
    if (selectedDetection?.detection.id === detectionId) {
      setSelectedDetection(null);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Map */}
      <Map
        center={initialCenter}
        zoom={initialZoom}
        style={mapStyle}
        detections={detections}
        onDetectionClick={handleDetectionClick}
        showDetectionLayers={showDetectionLayers}
      />

      {/* Upload Panel */}
      {showUploadPanel && (
        <div className="absolute top-4 left-4 z-10">
          <ImageUpload
            onDetectionComplete={handleDetectionComplete}
            onError={handleError}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Control Panel */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        {/* Toggle Upload Panel */}
        <button
          onClick={handleToggleUploadPanel}
          className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Toggle Upload Panel"
        >
          <Layers className="w-5 h-5 text-gray-700" />
        </button>

        {/* Toggle Detection Layers */}
        <button
          onClick={handleToggleDetectionVisibility}
          className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          title={showDetectionLayers ? "Hide Detections" : "Show Detections"}
        >
          {showDetectionLayers ? (
            <Eye className="w-5 h-5 text-gray-700" />
          ) : (
            <EyeOff className="w-5 h-5 text-gray-700" />
          )}
        </button>

        {/* Clear All Detections */}
        {detections.length > 0 && (
          <button
            onClick={handleClearDetections}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Clear All Detections"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
        )}
      </div>

      {/* Detection List Panel */}
      {detections.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-sm max-h-80 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Detections ({detections.length})
          </h3>
          <div className="space-y-2">
            {detections.map((detection, index) => (
              <div
                key={detection.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    Detection #{index + 1}
                  </span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => exportDetectionData(detection)}
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Export GeoJSON"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeDetection(detection.id)}
                      className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                      title="Remove Detection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>
                    <strong>Objects:</strong> {detection.detection_data.features?.length || 0}
                  </div>
                  <div>
                    <strong>Confidence:</strong> {Math.round(detection.confidence_threshold * 100)}%+
                  </div>
                  <div>
                    <strong>Model:</strong> {detection.model_version}
                  </div>
                  {detection.processing_time && (
                    <div>
                      <strong>Time:</strong> {detection.processing_time.toFixed(1)}s
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Detection Info Panel */}
      {selectedDetection && (
        <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Object Info
            </h3>
            <button
              onClick={() => setSelectedDetection(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Confidence:</strong>{' '}
              {((selectedDetection.feature.properties?.confidence || 0) * 100).toFixed(1)}%
            </div>
            {selectedDetection.feature.properties?.area && (
              <div>
                <strong>Area:</strong>{' '}
                {selectedDetection.feature.properties.area.toLocaleString()} m²
              </div>
            )}
            {selectedDetection.feature.properties?.object_type && (
              <div>
                <strong>Type:</strong> {selectedDetection.feature.properties.object_type}
              </div>
            )}
            <div>
              <strong>Geometry:</strong> {selectedDetection.feature.geometry.type}
            </div>
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={() => exportDetectionData(selectedDetection.detection)}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
