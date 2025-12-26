# SAM-Geo Map Integration

This feature integrates the Segment Anything Model for Geospatial data (SAM-Geo) with MapLibre GL JS to provide object detection capabilities on geospatial imagery.

## Components

### `SamGeoMap`
The main component that provides a complete SAM-Geo integration experience:
- Interactive map with drawing tools
- Image upload with drag-and-drop support
- Real-time object detection visualization
- Detection results management

### `Map`
Enhanced MapLibre GL JS component with:
- Terra Draw integration for drawing tools
- GeoJSON detection layer support
- Click handlers for detected objects
- Configurable styling and interaction

### `ImageUpload`
Component for uploading geospatial images:
- Drag-and-drop file upload
- Image metadata configuration
- SAM-Geo detection settings
- Real-time processing status

## Usage

### Basic Usage

```tsx
import { SamGeoMap } from '@/features/map';

export const MyMapPage = () => {
  return (
    <SamGeoMap
      initialCenter={[longitude, latitude]}
      initialZoom={10}
      mapStyle="https://your-map-style-url"
    />
  );
};
```

### Advanced Usage with Custom Handlers

```tsx
import { SamGeoMap, ObjectDetection } from '@/features/map';

export const AdvancedMapPage = () => {
  const handleDetectionComplete = (detection: ObjectDetection) => {
    console.log('Detection completed:', detection);
    // Handle the detection results
  };

  const handleDetectionClick = (detection: ObjectDetection, feature: GeoJSON.Feature) => {
    console.log('Clicked detection:', { detection, feature });
    // Handle detection click
  };

  return (
    <div className="w-full h-screen relative">
      <Map
        center={[longitude, latitude]}
        zoom={10}
        detections={detections}
        onDetectionClick={handleDetectionClick}
        showDetectionLayers={true}
      />
      
      {/* Custom upload component */}
      <div className="absolute top-4 left-4">
        <ImageUpload
          onDetectionComplete={handleDetectionComplete}
          onError={(error) => console.error(error)}
        />
      </div>
    </div>
  );
};
```

## Backend Requirements

The frontend requires a Django backend with the following endpoints:
- `POST /api/map/images/upload_and_detect/` - Upload image and run detection
- `POST /api/map/images/{id}/detect_objects/` - Run detection on existing image
- `GET /api/map/images/` - List user's images
- `GET /api/map/detections/` - List detection results

## Environment Variables

Add to your `.env` file:
```
VITE_API_BASE_URL=http://localhost:8000
```

## Features

- **Object Detection**: Uses SAM-Geo for automatic object segmentation
- **Interactive Visualization**: Click on detected objects to see details
- **Export Capabilities**: Download detection results as GeoJSON
- **Multiple Model Support**: Choose between ViT-H, ViT-L, and ViT-B models
- **Confidence Filtering**: Adjust confidence thresholds for detection
- **Real-time Processing**: Live updates during detection processing
- **Responsive Design**: Works on desktop and mobile devices

## Detection Workflow

1. **Upload Image**: Drag and drop or select a geospatial image
2. **Configure Settings**: Set detection parameters (confidence, model type)
3. **Process**: Backend processes image with SAM-Geo
4. **Visualize**: Detection results displayed as colored overlays
5. **Interact**: Click on detected objects for detailed information
6. **Export**: Download results as GeoJSON for further analysis
