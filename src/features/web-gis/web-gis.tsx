import { Box, Button, Flex, Text, VStack } from "@chakra-ui/react";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ResizableBox } from "react-resizable";

import { LayerPanel, MapCanvas, MapControls, Toolbar } from "./components";
import { DataSourcesPanel } from "./components/data-sources";
import { ProcessingBar } from "./components/processing";
import { DEFAULT_WORKSPACE_ID } from "shared/map/domain";
import { workspaceManager } from "shared/map/stores";
import { ResizeHandle } from "./components/resize-handle";
import { WorkflowBuilder } from "./workflow-builder";

const WebGISView = {
  MAP: "map",
  WORKFLOWS: "workflows",
} as const;

type WebGISView = (typeof WebGISView)[keyof typeof WebGISView];

export const WebGIS = () => {
  // States.
  const [layerPanelWidth, setLayerPanelWidth] = useState(300);
  const [containerHeight, setContainerHeight] = useState(600);
  const [view, setView] = useState<WebGISView>(WebGISView.MAP);
  // The workflow canvas is mounted on first open and kept mounted afterwards so
  // unsaved graph edits survive switching back to the map.
  const [hasOpenedWorkflows, setHasOpenedWorkflows] = useState(false);

  // useRefs.
  const containerRef = useRef<HTMLDivElement>(null);

  // useEffects.
  useEffect(() => {
    workspaceManager.getOrCreateWorkspace(DEFAULT_WORKSPACE_ID);
    workspaceManager.setActiveWorkspace(DEFAULT_WORKSPACE_ID);
  }, []);

  useLayoutEffect(() => {
    if (containerRef.current) {
      const { height } = containerRef.current.getBoundingClientRect();
      setContainerHeight(height - 32);
    }
  }, []);

  const handleSelectView = (nextView: WebGISView) => {
    setView(nextView);

    if (nextView === WebGISView.WORKFLOWS) {
      setHasOpenedWorkflows(true);
    }
  };

  return (
    <Flex
      className="web-gis"
      direction="column"
      h={"100%"}
      w={"100%"}
      bg={"surface.page"}
    >
      <Flex
        className="web-gis-view-switch"
        gap="0.5rem"
        px="1rem"
        pt="1rem"
        align="center"
      >
        <Button
          size="sm"
          variant={view === WebGISView.MAP ? "solid" : "ghost"}
          bg={view === WebGISView.MAP ? "intent.primary" : undefined}
          color={view === WebGISView.MAP ? "white" : undefined}
          onClick={() => handleSelectView(WebGISView.MAP)}
        >
          Map
        </Button>
        <Button
          size="sm"
          variant={view === WebGISView.WORKFLOWS ? "solid" : "ghost"}
          bg={view === WebGISView.WORKFLOWS ? "intent.primary" : undefined}
          color={view === WebGISView.WORKFLOWS ? "white" : undefined}
          onClick={() => handleSelectView(WebGISView.WORKFLOWS)}
        >
          Workflows
        </Button>
      </Flex>

      {hasOpenedWorkflows && (
        <Box
          className="web-gis-workflows-view"
          flex={1}
          minH={0}
          display={view === WebGISView.WORKFLOWS ? "block" : "none"}
        >
          <WorkflowBuilder />
        </Box>
      )}

      <Flex
        className="web-gis-container"
        ref={containerRef}
        flex={1}
        minH={0}
        w={"100%"}
        bg={"surface.page"}
        p="1rem"
        gap={"1rem"}
        justifyContent={"center"}
        alignItems={"center"}
        display={view === WebGISView.MAP ? "flex" : "none"}
      >
        <ResizableBox
          className="web-gis-resizable"
          width={layerPanelWidth}
          height={containerHeight}
          handleSize={[8, 8]}
          lockAspectRatio={false}
          transformScale={1}
          handle={(_, ref) => (
            <ResizeHandle ref={ref as React.RefObject<HTMLDivElement>} />
          )}
          resizeHandles={["e"]}
          onResize={(_, { size: newSize }) => {
            setLayerPanelWidth(newSize.width);
          }}
          minConstraints={[200, containerHeight]}
          maxConstraints={[600, containerHeight]}
          axis="x"
        >
          <VStack h="full">
            <Box w="full" flex={1} minH={0} overflow="hidden">
              <DataSourcesPanel />
            </Box>
            <Box
              className="layers-panel-container"
              w={"full"}
              flex={1}
              bg={"surface.page"}
              borderColor={"border.default"}
              borderWidth={"1px"}
              borderRadius={"lg"}
              overflow={"hidden"}
            >
              <Flex
                h="40px"
                px={3}
                alignItems="center"
                borderBottomWidth="1px"
                borderColor="border.default"
              >
                <Text fontSize="xs" fontWeight="semibold" color="text.muted">
                  Layers
                </Text>
              </Flex>
              <Box overflow="auto" h="calc(100% - 40px)">
                <LayerPanel />
              </Box>
            </Box>
          </VStack>
        </ResizableBox>

        {/* Right side: processing bar + map area. */}
        <VStack flex={1} h={"full"} gap={0} overflow="hidden">
          <ProcessingBar />

          <Box
            className="web-gis-map-area"
            flex={1}
            w={"full"}
            bg={"surface.page"}
            borderColor={"border.default"}
            borderWidth={"1px"}
            borderRadius={"lg"}
            overflow={"hidden"}
            position="relative"
          >
            <MapCanvas workspaceId={DEFAULT_WORKSPACE_ID} />
            <MapControls workspaceId={DEFAULT_WORKSPACE_ID} />
            <Toolbar workspaceId={DEFAULT_WORKSPACE_ID} />
          </Box>
        </VStack>
      </Flex>
    </Flex>
  );
};
