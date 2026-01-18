import { Center, VStack } from "@chakra-ui/react";
import "react-resizable/css/styles.css";
import { Outlet } from "react-router";
import { Navbar } from "src/design-system/navbar";

export const App = () => {
  return (
    <VStack h={"100vh"} w="100vw" gap={0}>
      <Navbar />
      <Center className="outlet-container" flex={1} h={"92vh"} w={"full"}>
        <Outlet />
      </Center>
    </VStack>
  );
};
