import { VStack } from "@chakra-ui/react";
import { Outlet } from "react-router";
import { Navbar } from "src/design-system/navbar";

export const App = () => {
  return (
    <VStack h={"100vh"}>
      <Navbar />
      <Outlet />
    </VStack>
  );
};
