import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MaplibreTerradrawControl } from "@watergis/maplibre-gl-terradraw";
import "@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css";
import "./map.css";
import type { ObjectDetection } from "../../api/map-api";

interface MapProps {
  center?: [number, number];
  zoom?: number;
  style?: string;
  detections?: ObjectDetection[];
  onDetectionClick?: (detection: ObjectDetection, feature: GeoJSON.Feature) => void;
  showDetectionLayers?: boolean;
}

export const Map = ({
  center = [78.9629, 20.5937], // Default center (India)
  zoom = 4, // Zoom level to show most of India
  style = "https://demotiles.maplibre.org/style.json", // Default style
  detections = [],
  onDetectionClick,
  showDetectionLayers = true,
}: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const draw = useRef<MaplibreTerradrawControl | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: style,
      center: center,
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // Wait for map to load before adding controls and layers
    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Initialize Terra Draw
    if (map.current) {
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
    }

    // Cleanup on unmount
    return () => {
      map.current?.remove();
    };
  }, [center, zoom, style]);

  // Effect to handle detection layers
  useEffect(() => {
    if (!map.current || !mapLoaded || !showDetectionLayers) return;

    // Remove existing detection layers
    const existingLayers = map.current.getStyle().layers.filter(layer => 
      layer.id.startsWith('detection-')
    );
    
    existingLayers.forEach(layer => {
      if (map.current!.getLayer(layer.id)) {
        map.current!.removeLayer(layer.id);
      }
    });

    // Remove existing detection sources
    const existingSources = Object.keys(map.current.getStyle().sources).filter(source => 
      source.startsWith('detection-')
    );
    
    existingSources.forEach(source => {
      if (map.current!.getSource(source)) {
        map.current!.removeSource(source);
      }
    });

    // Add new detection layers
    detections.forEach((detection, index) => {
      const sourceId = `detection-source-${index}`;
      const layerId = `detection-layer-${index}`;
      
      // Add source
      map.current!.addSource(sourceId, {
        type: 'geojson',
        data: detection.detection_data
      });

      // Add fill layer for polygons
      map.current!.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'confidence', ['get', 'properties']],
            0.0, '#ff0000',
            0.5, '#ffff00',
            1.0, '#00ff00'
          ],
          'fill-opacity': 0.6
        },
        filter: ['==', ['geometry-type'], 'Polygon']
      });

      // Add stroke layer for polygons
      map.current!.addLayer({
        id: `${layerId}-stroke`,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#ffffff',
          'line-width': 2,
          'line-opacity': 0.8
        },
        filter: ['==', ['geometry-type'], 'Polygon']
      });

      // Add click handler for detections
      map.current!.on('click', layerId, (e) => {
        if (e.features && e.features.length > 0 && onDetectionClick) {
          onDetectionClick(detection, e.features[0] as GeoJSON.Feature);
        }
      });

      // Change cursor on hover
      map.current!.on('mouseenter', layerId, () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current!.on('mouseleave', layerId, () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });
    });

  }, [detections, mapLoaded, showDetectionLayers, onDetectionClick]);

  return (
    <div className="w-full h-full min-h-[600px] relative">
      <div ref={mapContainer} className="map absolute inset-0 h-full w-full" />
    </div>
  );
};
