import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { useLayoutEffect, useRef, useState } from "react";
import { ResizableBox } from "react-resizable";

import { DatasetTree } from "./data-sources";
import { LayerPanel, MapCanvas, Toolbar } from "./components";

// Default workspace ID for the main map view.
const DEFAULT_WORKSPACE_ID = "default";

/**
 * Main Web-GIS page component.
 * Uses WorkspaceManager for state management.
 */
export const WebGIS = () => {
  // States.
  const [layerPanelWidth, setLayerPanelWidth] = useState(300);
  const [containerHeight, setContainerHeight] = useState(600);

  // useRefs.
  const containerRef = useRef<HTMLDivElement>(null);

  // useEffects.
  useLayoutEffect(() => {
    if (containerRef.current) {
      const { height } = containerRef.current.getBoundingClientRect();
      setContainerHeight(height - 32);
    }
  }, []);

  return (
    <Flex
      ref={containerRef}
      className="web-gis-container"
      h={"100%"}
      w={"100%"}
      bg={"surface.page"}
      p="1rem"
      gap={"1rem"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <ResizableBox
        width={layerPanelWidth}
        height={containerHeight}
        handle={
          <Box
            position="absolute"
            right="-10px"
            top="0"
            bgColor={"border.default"}
            w={"5px"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"center"}
            cursor="col-resize"
            opacity={"0"}
            _hover={{ opacity: "1" }}
          />
        }
        resizeHandles={["e"]}
        onResize={(_, { size: newSize }) => {
          setLayerPanelWidth(newSize.width);
        }}
        minConstraints={[200, containerHeight]}
        maxConstraints={[600, containerHeight]}
        axis="x"
      >
        <VStack h="full">
          {/* Datasets panel. */}
          <Box
            w={"full"}
            flex={0.5}
            borderColor={"border.default"}
            borderWidth={"1px"}
            borderRadius={"lg"}
            py={"0.5rem"}
            overflow={"hidden"}
          >
            <DatasetTree />
          </Box>

          {/* Layers panel. */}
          <Box
            w={"full"}
            flex={1}
            borderColor={"border.default"}
            borderWidth={"1px"}
            borderRadius={"lg"}
            overflow={"hidden"}
          >
            <Box
              p="0.5rem 1rem"
              borderBottomWidth="1px"
              borderColor="border.default"
            >
              <Text fontWeight="semibold" fontSize="sm">
                Layers
              </Text>
            </Box>
            <Box overflow="auto" h="calc(100% - 40px)">
              <LayerPanel workspaceId={DEFAULT_WORKSPACE_ID} />
            </Box>
          </Box>
        </VStack>
      </ResizableBox>

      {/* Map area with toolbar. */}
      <Box
        flex={1}
        h={"full"}
        borderColor={"border.default"}
        borderWidth={"1px"}
        borderRadius={"lg"}
        overflow={"hidden"}
        position="relative"
      >
        <MapCanvas workspaceId={DEFAULT_WORKSPACE_ID} />

        {/* Toolbar positioned on the map. */}
        <Box position="absolute" top="30%" left="1rem" zIndex={100}>
          <Toolbar workspaceId={DEFAULT_WORKSPACE_ID} />
        </Box>
      </Box>
    </Flex>
  );
};
