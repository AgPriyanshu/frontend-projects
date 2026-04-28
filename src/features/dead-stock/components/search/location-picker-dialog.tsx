import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Portal,
  Text,
} from "@chakra-ui/react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import { applySatelliteStyle } from "../../services/satellite-style";

interface LocationPickerDialogProps {
  isOpen: boolean;
  currentLat?: number;
  currentLng?: number;
  onClose: () => void;
  onConfirm: (location: { lat: number; lng: number }) => void;
}

const PIN_COLOR = "#f97316";

const CrosshairPin = () => (
  <Box
    className="location-crosshair-pin"
    position="absolute"
    top="50%"
    left="50%"
    transform="translate(-50%, -100%)"
    pointerEvents="none"
    zIndex={1}
  >
    <svg
      width="32"
      height="44"
      viewBox="0 0 32 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 0C7.16 0 0 7.16 0 16C0 28 16 44 16 44C16 44 32 28 32 16C32 7.16 24.84 0 16 0Z"
        fill={PIN_COLOR}
      />
      <circle cx="16" cy="16" r="6" fill="white" />
    </svg>
  </Box>
);

export const LocationPickerDialog = ({
  isOpen,
  currentLat,
  currentLng,
  onClose,
  onConfirm,
}: LocationPickerDialogProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!isOpen) {
      mapRef.current?.remove();
      mapRef.current = null;
      return;
    }

    // Wait one tick for the Portal to mount the container in the DOM.
    const timer = window.setTimeout(() => {
      if (!containerRef.current || mapRef.current) return;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: "https://demotiles.maplibre.org/style.json",
        center: [currentLng ?? 77.209, currentLat ?? 28.6139],
        zoom: 13,
      });
      mapRef.current = map;

      map.on("load", () => {
        applySatelliteStyle(map);
        map.resize();
      });
    }, 50);

    return () => {
      window.clearTimeout(timer);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [isOpen, currentLat, currentLng]);

  const handleConfirm = () => {
    const map = mapRef.current;
    if (!map) return;
    const { lat, lng } = map.getCenter();
    onConfirm({ lat, lng });
    onClose();
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(event) => !event.open && onClose()}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="560px" w="full">
            <Dialog.Header>
              <Dialog.Title>Choose your location</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body p={0}>
              <Text px={4} pb={3} fontSize="sm" color="text.secondary">
                Drag the map so the pin is on your location, then confirm.
              </Text>
              <Box position="relative" h="380px">
                <Box ref={containerRef} w="full" h="full" />
                <CrosshairPin />
              </Box>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                bg="intent.primary"
                color="text.onIntent"
                onClick={handleConfirm}
              >
                Use this location
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
