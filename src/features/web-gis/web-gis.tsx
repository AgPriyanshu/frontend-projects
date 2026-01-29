import { Box, Flex, VStack } from "@chakra-ui/react";
import { useLayoutEffect, useRef, useState } from "react";
import { ResizableBox } from "react-resizable";

import { DatasetTree } from "./data-sources";
import { Map } from "./map";

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
          <Box
            w={"full"}
            flex={0.5}
            borderColor={"border.default"}
            borderWidth={"1px"}
            borderRadius={"lg"}
            p={"1rem"}
            overflow={"hidden"}
          >
            <DatasetTree />
          </Box>
          <Box
            w={"full"}
            flex={1}
            borderColor={"border.default"}
            borderWidth={"1px"}
            borderRadius={"lg"}
            p={"1rem"}
          >
            Layers
          </Box>
        </VStack>
      </ResizableBox>

      <Box
        flex={1}
        h={"full"}
        borderColor={"border.default"}
        borderWidth={"1px"}
        borderRadius={"lg"}
        overflow={"hidden"}
      >
        <Map />
      </Box>
    </Flex>
  );
};
