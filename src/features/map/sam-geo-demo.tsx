import React from 'react';
import { SamGeoMap } from './sam-geo-map';

/**
 * Demo component showing how to use the SAM-Geo integrated map
 */
export const SamGeoDemo: React.FC = () => {
  return (
    <div className="w-full h-screen">
      <SamGeoMap
        initialCenter={[78.9629, 20.5937]} // India
        initialZoom={5}
        mapStyle="https://demotiles.maplibre.org/style.json"
      />
    </div>
  );
};

export default SamGeoDemo;
