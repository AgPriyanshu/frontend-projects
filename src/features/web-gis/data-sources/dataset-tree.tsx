import { Box, Flex, Text, useToken } from "@chakra-ui/react";
import { useDatasetNodes } from "api/web-gis";
import React from "react";
import { Tree } from "react-arborist";
import type { NodeRendererProps } from "react-arborist";
import { FaFolder, FaFolderOpen, FaFile } from "react-icons/fa";
import { DatasetNodeType, type DatasetNode } from "../types";

// Custom Node Component
const Node = ({ node, style, dragHandle }: NodeRendererProps<DatasetNode>) => {
  const isFolder = node.data.type === DatasetNodeType.FOLDER;

  return (
    <Flex
      ref={dragHandle}
      align="center"
      style={style}
      py={"0.25rem"}
      cursor="pointer"
      borderRadius="md"
      bg={node.isSelected ? "bgMuted" : "transparent"}
      _hover={{ bg: "primaryHover" }}
      transition="background 0.2s"
    >
      <Box
        as="span"
        mr={2}
        color={"fg"}
        fontSize="sm"
        onClick={(e) => {
          e.stopPropagation();
          node.toggle();
        }}
      >
        {!isFolder ? <FaFile /> : node.isOpen ? <FaFolderOpen /> : <FaFolder />}
      </Box>
      <Text fontSize="sm" color={"fg"} userSelect="none">
        {isFolder ? node.data.name : node.data.dataset?.fileName}
      </Text>
    </Flex>
  );
};

export const DatasetTree = () => {
  const [borderColor] = useToken("colors", ["border"]);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // APIs.
  const { data, isLoading } = useDatasetNodes();

  if (isLoading || !data) {
    return (
      <Box ref={containerRef} h="full" w="full" borderColor={borderColor}>
        <Text fontSize="sm" color="fg" p={2}>
          Loading datasets...
        </Text>
      </Box>
    );
  }

  return (
    <Box ref={containerRef} h="full" w="full" borderColor={borderColor}>
      <Tree
        initialData={data.data}
        openByDefault={false}
        indent={20}
        rowHeight={32}
        overscanCount={5}
      >
        {Node}
      </Tree>
    </Box>
  );
};
