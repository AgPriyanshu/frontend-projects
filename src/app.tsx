import { Center, Flex, VStack } from "@chakra-ui/react";
import "react-resizable/css/styles.css";
import { Outlet } from "react-router";
import { Navbar } from "src/design-system/navbar";
import { ChatFab, ChatPanel } from "src/features/chat";

export const App = () => {
  return (
    <VStack h={"100vh"} w="100vw" gap={0}>
      <Navbar />
      <Flex flex={1} w="full" overflow="hidden">
        {/* Main content — shrinks when chat panel opens */}
        <Center
          className="outlet-container"
          flex={1}
          h="full"
          w="full"
          transition="all 0.3s ease"
        >
          <Outlet />
        </Center>

        {/* Chat panel — inline, pushes content left */}
        <ChatPanel />
      </Flex>
      <ChatFab />
    </VStack>
  );
};
