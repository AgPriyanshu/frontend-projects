import { Map } from './map';
import type { GeospatialContext } from '@/features/ai-chat/types';

interface MapCardProps {
  onGeospatialContextChange?: (context: GeospatialContext) => void;
}

export function MapCard({ onGeospatialContextChange }: MapCardProps) {
  return (
    <div className="w-full h-[600px] border border-border rounded-lg overflow-hidden shadow-lg bg-card">
      <Map 
        center={[78.9629, 20.5937]} 
        zoom={4}
        onGeospatialContextChange={onGeospatialContextChange}
      />
    </div>
  );
}
