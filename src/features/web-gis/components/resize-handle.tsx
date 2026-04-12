import { Box } from "@chakra-ui/react";

export const ResizeHandle = () => {
  return (
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
  );
};
