import { Box, Center, Flex, Heading, Spacer, VStack } from "@chakra-ui/react";
import { TbWorldBolt } from "react-icons/tb";
import { Outlet } from "react-router";

export const App = () => {
  return (
    <VStack h={"100vh"}>
      <Box h="10rem" w="full">
        <Center h="full" alignItems={"center"}>
          <Flex>
            <Heading size={"3xl"}>World of Apps</Heading>
            <Spacer w="2" />
            <TbWorldBolt size={32} />
          </Flex>
        </Center>
      </Box>
      <Outlet />
    </VStack>
    // </Container>
  );
};
