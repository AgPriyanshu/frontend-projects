import { Box } from "@chakra-ui/react";
import React from "react";

export const ResizeHandle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  return (
    <Box
      ref={ref}
      {...props}
      position="absolute"
      right="-10px"
      top="0"
      bgColor={"border.default"}
      w={"5px"}
      h={"full"}
      cursor="col-resize"
      opacity={"0"}
      zIndex={1}
      _hover={{ opacity: "1" }}
    />
  );
});
