import { Box, VStack } from "@chakra-ui/react";
import { Outlet } from "react-router";
import { Navbar } from "src/design-system/navbar";

export const App = () => {
  return (
    <VStack h={"100vh"} w="100vw" gap={0}>
      <Navbar />
      <Box className="outlet-container" flex={1} w={"full"}>
        <Outlet />
      </Box>
    </VStack>
  );
};
