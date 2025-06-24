import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { Map } from "@/features/map/map";
import { ChatProvider, ChatInterface, ChatButton } from "@/features/ai-chat";
import type {
  GeospatialContext,
  AnalysisResult,
} from "@/features/ai-chat/types";

export const Route = createFileRoute("/map")({
  component: MapPage,
});

function MapPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleMapUpdate = useCallback((_analysis: AnalysisResult) => {
    // Analysis results are handled by the chat context
  }, []);

  const handleGeospatialContextChange = useCallback(
    (_context: GeospatialContext) => {
      // Geospatial context is handled by the chat system
    },
    []
  );

  const handleToggleChat = useCallback((isOpen: boolean) => {
    setIsChatOpen(isOpen);
  }, []);

  const handleCloseChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  return (
    <ChatProvider onMapUpdate={handleMapUpdate}>
      <div className="h-full flex flex-col">
        <h1 className="text-2xl font-bold mb-4">Interactive AI-Powered Map</h1>
        <div className="flex-1 relative">
          <Map onGeospatialContextChange={handleGeospatialContextChange} />

          {/* AI Chat Integration */}
          <ChatButton onToggle={handleToggleChat} />
          <ChatInterface isOpen={isChatOpen} onClose={handleCloseChat} />
        </div>
      </div>
    </ChatProvider>
  );
}
