import { VStack } from "@chakra-ui/react";
import { Outlet } from "react-router";

export const App = () => {
  return (
    <VStack h={"100vh"}>
      <Outlet />
    </VStack>
  );
};
