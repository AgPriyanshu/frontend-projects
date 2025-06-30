import { useEffect, useRef, useCallback, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MaplibreTerradrawControl } from "@watergis/maplibre-gl-terradraw";
import "@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css";
import "./map.css";
import type { GeospatialContext } from "@/features/ai-chat/types";
import { shapefileApi, ApiError } from "@/api";
import type { ShapefileLayer } from "@/api";
import { Upload, AlertCircle, CheckCircle, XCircle, FileUp, Layers, Eye, EyeOff, Palette, Info, Table, X, ChevronDown, ChevronRight } from "lucide-react";

interface MapProps {
  center?: [number, number];
  zoom?: number;
  onGeospatialContextChange?: (context: GeospatialContext) => void;
}

interface DragDropState {
  isDragOver: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  success: string | null;
  dragCounter: number; // To handle drag enter/leave properly
}

interface LoadedLayer {
  id: number;
  layer: ShapefileLayer;
  visible: boolean;
  color: string;
}

// Generate consistent colors for layers
const generateLayerColor = (index: number): string => {
  const colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // emerald
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#6366f1', // indigo
  ];
  return colors[index % colors.length];
};

export const Map = ({
  center = [78.9629, 20.5937], // Default center (India)
  zoom = 4, // Zoom level to show most of India
  onGeospatialContextChange,
}: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const draw = useRef<MaplibreTerradrawControl | null>(null);
  const contextCallbackRef = useRef(onGeospatialContextChange);
  const uploadedLayers = useRef<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const layersLoadedRef = useRef<boolean>(false);

  // Loaded layers state
  const [loadedLayers, setLoadedLayers] = useState<LoadedLayer[]>([]);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [isLoadingLayers, setIsLoadingLayers] = useState(true);

  // Drag and drop state
  const [dragDropState, setDragDropState] = useState<DragDropState>({
    isDragOver: false,
    isUploading: false,
    uploadProgress: 0,
    error: null,
    success: null,
    dragCounter: 0,
  });

  // Update the callback ref when prop changes
  useEffect(() => {
    contextCallbackRef.current = onGeospatialContextChange;
  }, [onGeospatialContextChange]);

  // Clear status messages after delay
  useEffect(() => {
    if (dragDropState.error || dragDropState.success) {
      const timer = setTimeout(() => {
        setDragDropState(prev => ({ ...prev, error: null, success: null }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [dragDropState.error, dragDropState.success]);

  // Validate shapefile
  const validateShapefile = useCallback((file: File): string | null => {
    if (!file.name.endsWith(".zip")) {
      return "Please upload a ZIP file containing shapefile components (.shp, .shx, .dbf)";
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return "File size must be less than 50MB";
    }

    return null;
  }, []);

  // Add shapefile layer to map
  const addShapefileLayer = useCallback(async (layer: ShapefileLayer, color?: string) => {
    if (!map.current || uploadedLayers.current.has(layer.id.toString())) return;

    try {
      // Get GeoJSON data for the layer
      const geoJsonResponse = await shapefileApi.getLayerGeoJSON(layer.id);
      
      // Extract GeoJSON from wrapped response if needed
      const geoJsonData = geoJsonResponse.data || geoJsonResponse;
      
      // Validate that we have a proper GeoJSON object
      if (!geoJsonData || !geoJsonData.type || geoJsonData.type !== 'FeatureCollection') {
        console.error('Invalid GeoJSON data for layer:', layer.name, geoJsonData);
        return;
      }
      
      const sourceId = `shapefile-${layer.id}`;
      const layerId = `shapefile-layer-${layer.id}`;
      
      // Use provided color or default blue
      const layerColor = color || '#3b82f6';
      const layerColorDark = color ? `${color}CC` : '#1d4ed8'; // Add opacity or use darker shade
      
      // Add source
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: geoJsonData
      });

      // Determine layer style based on geometry type
      let layerConfig: any = {
        id: layerId,
        source: sourceId,
      };

      const geometryType = layer.geometry_type.toLowerCase();
      
      if (geometryType.includes('point')) {
        layerConfig = {
          ...layerConfig,
          type: 'circle',
          paint: {
            'circle-radius': 6,
            'circle-color': layerColor,
            'circle-stroke-color': layerColorDark,
            'circle-stroke-width': 2,
          }
        };
      } else if (geometryType.includes('linestring')) {
        layerConfig = {
          ...layerConfig,
          type: 'line',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': layerColor,
            'line-width': 3,
          }
        };
      } else if (geometryType.includes('polygon')) {
        // Add fill layer
        map.current.addLayer({
          ...layerConfig,
          id: `${layerId}-fill`,
          type: 'fill',
          paint: {
            'fill-color': layerColor,
            'fill-opacity': 0.3,
          }
        });
        // Add outline layer
        layerConfig = {
          ...layerConfig,
          id: `${layerId}-outline`,
          type: 'line',
          paint: {
            'line-color': layerColorDark,
            'line-width': 2,
          }
        };
      } else {
        // Default to circle for unknown geometry types
        console.warn('Unknown geometry type:', geometryType, 'defaulting to circle');
        layerConfig = {
          ...layerConfig,
          type: 'circle',
          paint: {
            'circle-radius': 6,
            'circle-color': layerColor,
            'circle-stroke-color': layerColorDark,
            'circle-stroke-width': 2,
          }
        };
      }

      // Add the layer
      map.current.addLayer(layerConfig);
      
      // Track uploaded layer
      uploadedLayers.current.add(layer.id.toString());

      // Fit map to layer bounds if GeoJSON has features
      if (geoJsonData.features && geoJsonData.features.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        geoJsonData.features.forEach((feature: any) => {
          if (feature.geometry.type === 'Point') {
            bounds.extend(feature.geometry.coordinates);
          } else if (feature.geometry.coordinates) {
            // Handle other geometry types
            const coords = feature.geometry.coordinates.flat(2);
            for (let i = 0; i < coords.length; i += 2) {
              if (typeof coords[i] === 'number' && typeof coords[i + 1] === 'number') {
                bounds.extend([coords[i], coords[i + 1]]);
              }
            }
          }
        });
        
        if (!bounds.isEmpty()) {
          map.current.fitBounds(bounds, { padding: 50 });
        }
      }

      // Add click handler for feature info
      map.current.on('click', layerId.includes('fill') ? `${layerId}-fill` : layerId, (e) => {
        if (e.features && e.features[0]) {
          const feature = e.features[0];
          const properties = feature.properties || {};
          
          const popupContent = Object.entries(properties)
            .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
            .join('<br>');
          
          new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<div style="max-width: 200px;">${popupContent}</div>`)
            .addTo(map.current!);
        }
      });

      // Change cursor on hover
      map.current.on('mouseenter', layerId.includes('fill') ? `${layerId}-fill` : layerId, () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });
      
      map.current.on('mouseleave', layerId.includes('fill') ? `${layerId}-fill` : layerId, () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });

    } catch (error) {
      console.error('Failed to add shapefile layer to map:', error);
      setDragDropState(prev => ({ 
        ...prev, 
        error: 'Failed to display shapefile on map' 
      }));
    }
  }, []);

  // Load all existing layers from the database
  const loadExistingLayers = useCallback(async () => {
    if (!map.current || layersLoadedRef.current) return;
    
    layersLoadedRef.current = true;
    
    try {
      setIsLoadingLayers(true);
      const layers = await shapefileApi.getLayers();
      
      const loadedLayersData: LoadedLayer[] = layers.map((layer, index) => ({
        id: layer.id,
        layer,
        visible: true,
        color: generateLayerColor(index)
      }));
      
      setLoadedLayers(loadedLayersData);
      
      // Add all layers to the map
      for (const loadedLayer of loadedLayersData) {
        try {
          // Inline addShapefileLayer logic to avoid circular dependency
          if (uploadedLayers.current.has(loadedLayer.layer.id.toString())) continue;

          const geoJsonResponse = await shapefileApi.getLayerGeoJSON(loadedLayer.layer.id);
          
          // Extract GeoJSON from wrapped response if needed
          const geoJsonData = geoJsonResponse.data || geoJsonResponse;
          
          // Validate that we have a proper GeoJSON object
          if (!geoJsonData || !geoJsonData.type || geoJsonData.type !== 'FeatureCollection') {
            console.error('Invalid GeoJSON data for layer:', loadedLayer.layer.name, geoJsonData);
            continue;
          }
          
          const sourceId = `shapefile-${loadedLayer.layer.id}`;
          const layerId = `shapefile-layer-${loadedLayer.layer.id}`;
          
          const layerColor = loadedLayer.color;
          const layerColorDark = `${layerColor}CC`;
          
          map.current!.addSource(sourceId, {
            type: 'geojson',
            data: geoJsonData
          });

          let layerConfig: any = {
            id: layerId,
            source: sourceId,
          };

          const geometryType = loadedLayer.layer.geometry_type.toLowerCase();
          
          if (geometryType.includes('point')) {
            layerConfig = {
              ...layerConfig,
              type: 'circle',
              paint: {
                'circle-radius': 6,
                'circle-color': layerColor,
                'circle-stroke-color': layerColorDark,
                'circle-stroke-width': 2,
              }
            };
          } else if (geometryType.includes('linestring')) {
            layerConfig = {
              ...layerConfig,
              type: 'line',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': layerColor,
                'line-width': 3,
              }
            };
          } else if (geometryType.includes('polygon')) {
            // Add fill layer for polygons
            map.current!.addLayer({
              ...layerConfig,
              id: `${layerId}-fill`,
              type: 'fill',
              paint: {
                'fill-color': layerColor,
                'fill-opacity': 0.3,
              }
            });
            // Configure outline layer
            layerConfig = {
              ...layerConfig,
              id: `${layerId}-outline`,
              type: 'line',
              paint: {
                'line-color': layerColorDark,
                'line-width': 2,
              }
            };
          } else {
            // Default to circle for unknown geometry types
            console.warn('Unknown geometry type:', geometryType, 'defaulting to circle');
            layerConfig = {
              ...layerConfig,
              type: 'circle',
              paint: {
                'circle-radius': 6,
                'circle-color': layerColor,
                'circle-stroke-color': layerColorDark,
                'circle-stroke-width': 2,
              }
            };
          }

          map.current!.addLayer(layerConfig);
          uploadedLayers.current.add(loadedLayer.layer.id.toString());
          
        } catch (error) {
          console.error('Failed to add layer:', loadedLayer.layer.name, error);
        }
      }
      
    } catch (error) {
      console.error('Failed to load existing layers:', error);
      setDragDropState(prev => ({ 
        ...prev, 
        error: 'Failed to load existing layers' 
      }));
    } finally {
      setIsLoadingLayers(false);
    }
  }, []); // No dependencies to avoid circular dependency

  // Toggle layer visibility
  const toggleLayerVisibility = useCallback((layerId: number) => {
    if (!map.current) return;

    setLoadedLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        const newVisibility = !layer.visible;
        
        // Toggle visibility in MapLibre
        const mapLayerId = `shapefile-layer-${layerId}`;
        const fillLayerId = `${mapLayerId}-fill`;
        const outlineLayerId = `${mapLayerId}-outline`;
        
        const visibility = newVisibility ? 'visible' : 'none';
        
        // Check if layers exist before toggling
        if (map.current!.getLayer(mapLayerId)) {
          map.current!.setLayoutProperty(mapLayerId, 'visibility', visibility);
        }
        if (map.current!.getLayer(fillLayerId)) {
          map.current!.setLayoutProperty(fillLayerId, 'visibility', visibility);
        }
        if (map.current!.getLayer(outlineLayerId)) {
          map.current!.setLayoutProperty(outlineLayerId, 'visibility', visibility);
        }
        
        return { ...layer, visible: newVisibility };
      }
      return layer;
    }));
  }, []);

  // Remove layer from map and state
  const removeLayer = useCallback((layerId: number) => {
    if (!map.current) return;

    // Remove from MapLibre
    const sourceId = `shapefile-${layerId}`;
    const mapLayerId = `shapefile-layer-${layerId}`;
    const fillLayerId = `${mapLayerId}-fill`;
    const outlineLayerId = `${mapLayerId}-outline`;
    
    // Remove layers if they exist
    if (map.current.getLayer(fillLayerId)) {
      map.current.removeLayer(fillLayerId);
    }
    if (map.current.getLayer(outlineLayerId)) {
      map.current.removeLayer(outlineLayerId);
    }
    if (map.current.getLayer(mapLayerId)) {
      map.current.removeLayer(mapLayerId);
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId);
    }
    
    // Remove from state
    setLoadedLayers(prev => prev.filter(layer => layer.id !== layerId));
    uploadedLayers.current.delete(layerId.toString());
  }, []);

  // Handle shapefile upload
  const handleShapefileUpload = useCallback(async (file: File) => {
    const error = validateShapefile(file);
    if (error) {
      setDragDropState(prev => ({ ...prev, error, isUploading: false }));
      return;
    }

    setDragDropState(prev => ({ 
      ...prev, 
      isUploading: true, 
      uploadProgress: 0, 
      error: null,
      success: null 
    }));

    try {
      // Generate layer name from filename
      const layerName = file.name.replace(/\.zip$/i, "").replace(/[_-]/g, " ");
      
      const response = await shapefileApi.uploadShapefile(
        file,
        layerName,
        `Uploaded via map interface on ${new Date().toLocaleString()}`,
        (progress) => {
          setDragDropState(prev => ({ ...prev, uploadProgress: progress }));
        }
      );

      if (response.success && response.layer) {
        // Generate color for new layer using current state
        setLoadedLayers(prev => {
          const newColor = generateLayerColor(prev.length);
          
          // Add to loaded layers state
          const newLoadedLayer: LoadedLayer = {
            id: response.layer!.id,
            layer: response.layer!,
            visible: true,
            color: newColor
          };
          
          // Add layer to map
          addShapefileLayer(response.layer!, newColor);
          
          return [...prev, newLoadedLayer];
        });
        
        // Show success message, with warning if there were partial errors
        const message = response.warning 
          ? `${response.layer!.name}: ${response.warning}`
          : `Successfully uploaded "${response.layer!.name}" with ${response.layer!.feature_count.toLocaleString()} features`;
          
        setDragDropState(prev => ({ 
          ...prev, 
          isUploading: false, 
          success: message,
          uploadProgress: 100 
        }));
        
      } else if (!response.success) {
        // Handle the new detailed error response
        const errorMsg = response.details || response.error || "Upload failed";
        const errorDetails = response.errors ? ` Details: ${response.errors.slice(0, 2).join("; ")}` : "";
        
        setDragDropState(prev => ({ 
          ...prev, 
          isUploading: false, 
          error: errorMsg + errorDetails 
        }));
      } else {
        const errorMsg = response.errors?.join(", ") || "Upload failed";
        setDragDropState(prev => ({ ...prev, isUploading: false, error: errorMsg }));
      }
    } catch (error) {
      const errorMsg = error instanceof ApiError ? error.message : "Upload failed";
      setDragDropState(prev => ({ ...prev, isUploading: false, error: errorMsg }));
    }
  }, [validateShapefile, addShapefileLayer]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleShapefileUpload(files[0]);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [handleShapefileUpload]);

  // Trigger file input click
  const handleUploadButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Check if the element is within the map container
  const isOverMapContainer = useCallback((element: Element | null): boolean => {
    if (!mapContainer.current || !element) return false;
    return mapContainer.current.contains(element) || mapContainer.current === element;
  }, []);

  // Enhanced drag and drop handlers that work with MapLibre
  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if dragging over the map container
    if (isOverMapContainer(e.target as Element)) {
      setDragDropState(prev => {
        if (prev.isUploading) return prev;
        return { 
          ...prev, 
          dragCounter: prev.dragCounter + 1,
          isDragOver: true 
        };
      });
    }
  }, [isOverMapContainer]);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Ensure drag over state is maintained
    if (isOverMapContainer(e.target as Element)) {
      setDragDropState(prev => {
        if (prev.isUploading) return prev;
        return { ...prev, isDragOver: true };
      });
    }
  }, [isOverMapContainer]);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragDropState(prev => {
      const newCounter = prev.dragCounter - 1;
      return {
        ...prev,
        dragCounter: newCounter,
        isDragOver: newCounter > 0
      };
    });
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragDropState(prev => ({ 
      ...prev, 
      isDragOver: false, 
      dragCounter: 0 
    }));
    
    // Only process drops over the map container
    if (!isOverMapContainer(e.target as Element)) return;

    const files = Array.from(e.dataTransfer?.files || []);
    const zipFiles = files.filter(file => file.name.endsWith('.zip'));
    
    if (zipFiles.length === 0) {
      setDragDropState(prev => ({ 
        ...prev, 
        error: 'Please drop a ZIP file containing shapefile components' 
      }));
      return;
    }

    if (zipFiles.length > 1) {
      setDragDropState(prev => ({ 
        ...prev, 
        error: 'Please drop only one shapefile at a time' 
      }));
      return;
    }

    handleShapefileUpload(zipFiles[0]);
  }, [isOverMapContainer, handleShapefileUpload]);

  // Set up global drag and drop event listeners
  useEffect(() => {
    const container = mapContainer.current;
    if (!container) return;

    // Add event listeners to document to capture all drag events
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, [handleDragEnter, handleDragOver, handleDragLeave, handleDrop]);

  // Update geospatial context for AI chat
  const updateGeospatialContext = useCallback(() => {
    if (!map.current || !contextCallbackRef.current) return;

    const mapInstance = map.current;
    const bounds = mapInstance.getBounds();
    const mapCenter = mapInstance.getCenter();
    const zoomLevel = Math.round(mapInstance.getZoom());

    // Get drawn features from Terra Draw
    let features: GeoJSON.Feature[] = [];
    if (draw.current) {
      try {
        // Get all features from Terra Draw - using the correct API
        const terraDrawInstance = (
          draw.current as unknown as {
            _terraDraw?: { getSnapshot?: () => GeoJSON.Feature[] };
          }
        )._terraDraw;
        if (terraDrawInstance && terraDrawInstance.getSnapshot) {
          const drawnFeatures = terraDrawInstance.getSnapshot();
          features = drawnFeatures || [];
        }
      } catch (error) {
        console.warn("Could not get drawn features:", error);
      }
    }

    const context: GeospatialContext = {
      features,
      bounds: [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ],
      mapCenter: [mapCenter.lng, mapCenter.lat],
      zoomLevel,
      visibleLayers: Array.from(uploadedLayers.current),
      selectedFeatures: [],
    };

    contextCallbackRef.current(context);
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

                // Initialize map with simplified configuration (use props values directly)
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [78.9629, 20.5937], // Use default values to prevent re-initialization
      zoom: 4,
      maxZoom: 18,
      minZoom: 0,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // Add globe control for toggling between flat and globe projections
    map.current.addControl(new maplibregl.GlobeControl(), "top-right");

    // Initialize Terra Draw
    map.current.on("load", () => {
      if (map.current) {
        // Enable globe projection
        map.current.setProjection({
          type: "globe",
        });

        draw.current = new MaplibreTerradrawControl({
          modes: [
            "point",
            "linestring",
            "polygon",
            "rectangle",
            "circle",
            "freehand",
            "select",
            "delete-selection",
            "delete",
          ],
          open: true,
        });

        map.current.addControl(draw.current, "top-left");

        // Load existing layers
        loadExistingLayers();

        // Update context after initial load
        setTimeout(updateGeospatialContext, 1000);
      }
    });

    // Listen for map changes to update geospatial context
    const handleMapChange = () => {
      updateGeospatialContext();
    };

    map.current.on("moveend", handleMapChange);
    map.current.on("zoomend", handleMapChange);

    // Listen for Terra Draw changes
    map.current.on("terra-draw.change", handleMapChange);
    map.current.on("terra-draw.finish", handleMapChange);
    map.current.on("terra-draw.delete", handleMapChange);

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.off("moveend", handleMapChange);
        map.current.off("zoomend", handleMapChange);
        map.current.off("terra-draw.change", handleMapChange);
        map.current.off("terra-draw.finish", handleMapChange);
        map.current.off("terra-draw.delete", handleMapChange);
        map.current.remove();
      }
    };
  }, []); // Remove center and zoom dependencies to prevent unnecessary re-initialization

  return (
    <div className="w-full h-full min-h-[600px] relative">
      <div 
        ref={mapContainer} 
        className="map absolute inset-0 h-full w-full" 
        style={{
          // Ensure the container can receive drag events
          pointerEvents: 'auto',
        }}
      />
      
      {/* Upload Button */}
      <div className="absolute top-4 left-4 z-40">
        <button
          onClick={handleUploadButtonClick}
          disabled={dragDropState.isUploading}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all
            border border-border font-medium text-sm
            ${dragDropState.isUploading
              ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-xl'
            }
          `}
          title="Upload Shapefile"
        >
          <FileUp className="h-4 w-4" />
          <span>
            {dragDropState.isUploading ? 'Uploading...' : 'Upload Shapefile'}
          </span>
        </button>
      </div>

      {/* Layers Control Panel */}
      <div className="absolute top-4 right-4 z-40">
        <div className="flex flex-col gap-2">
          {/* Layers Toggle Button */}
          <button
            onClick={() => setShowLayersPanel(!showLayersPanel)}
            className="flex items-center gap-2 px-3 py-2 bg-card text-card-foreground rounded-lg shadow-lg hover:shadow-xl transition-all border border-border font-medium text-sm"
            title="Toggle Layers Panel"
          >
            <Layers className="h-4 w-4" />
            <span>
              Layers ({loadedLayers.length})
            </span>
          </button>

          {/* Layers Panel */}
          {showLayersPanel && (
            <div className="bg-card text-card-foreground rounded-lg shadow-lg border border-border p-4 min-w-[300px] max-h-[400px] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Map Layers</h3>
                {isLoadingLayers && (
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                )}
              </div>
              
              {loadedLayers.length === 0 ? (
                <p className="text-muted-foreground text-sm">No layers available</p>
              ) : (
                <div className="space-y-2">
                  {loadedLayers.map((loadedLayer) => (
                    <div key={loadedLayer.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        {/* Color indicator */}
                        <div 
                          className="w-4 h-4 rounded border border-border"
                          style={{ backgroundColor: loadedLayer.color }}
                        ></div>
                        
                        {/* Layer info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {loadedLayer.layer.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {loadedLayer.layer.geometry_type} • {loadedLayer.layer.feature_count.toLocaleString()} features
                          </p>
                        </div>
                      </div>
                      
                      {/* Controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleLayerVisibility(loadedLayer.id)}
                          className={`p-1 rounded hover:bg-accent hover:text-accent-foreground transition-colors ${
                            loadedLayer.visible ? 'text-primary' : 'text-muted-foreground'
                          }`}
                          title={loadedLayer.visible ? 'Hide layer' : 'Show layer'}
                        >
                          {loadedLayer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => removeLayer(loadedLayer.id)}
                          className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                          title="Remove layer"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      {/* Drag overlay */}
      {dragDropState.isDragOver && !dragDropState.isUploading && (
        <div 
          className="absolute inset-0 bg-primary/20 border-4 border-dashed border-primary flex items-center justify-center z-50"
          style={{
            // Prevent the overlay from interfering with drag events
            pointerEvents: 'none',
          }}
        >
          <div className="bg-card text-card-foreground rounded-lg p-8 shadow-lg text-center border border-border">
            <Upload className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Drop Shapefile Here</h3>
            <p className="text-muted-foreground">Upload a ZIP file containing .shp, .shx, and .dbf files</p>
          </div>
        </div>
      )}

      {/* Upload progress overlay */}
      {dragDropState.isUploading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card text-card-foreground rounded-lg p-8 shadow-lg text-center min-w-[300px] border border-border">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Uploading Shapefile</h3>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${dragDropState.uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground">{dragDropState.uploadProgress}% complete</p>
          </div>
        </div>
      )}

      {/* Status messages */}
      {dragDropState.error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 shadow-lg max-w-md">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-destructive">Upload Failed</h4>
                <p className="text-sm text-destructive/80 mt-1">{dragDropState.error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {dragDropState.success && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 shadow-lg max-w-md dark:bg-emerald-950/50 dark:border-emerald-800">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0 dark:text-emerald-400" />
              <div>
                <h4 className="font-medium text-emerald-800 dark:text-emerald-200">Upload Successful</h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">{dragDropState.success}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white p-2 rounded text-xs">
          <div>Drag Over: {dragDropState.isDragOver ? 'Yes' : 'No'}</div>
          <div>Drag Counter: {dragDropState.dragCounter}</div>
          <div>Uploading: {dragDropState.isUploading ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};
