import { Box, Flex, HStack, IconButton, Heading, Menu } from "@chakra-ui/react";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { TbWorldBolt } from "react-icons/tb";
import { useNavigate } from "react-router";
import { clearToken } from "shared/local-storage/token";
import { RoutePath } from "app/router/constants";
import { queryClient } from "api/query-client";
import { ColorModeButton } from "./color-mode";

export const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    queryClient.clear();
    navigate(RoutePath.Login);
  };

  return (
    <Box as="nav" w="full" borderBottomWidth="1px" px={8} py={4}>
      <Flex justify="space-between" align="center">
        <HStack
          gap={3}
          cursor="pointer"
          onClick={() => navigate("/")}
          _hover={{ opacity: 0.8 }}
          transition="opacity 0.2s"
        >
          <TbWorldBolt size={32} />
          <Heading size="md">World of Apps</Heading>
        </HStack>

        <HStack gap={4}>
          <ColorModeButton />
          <Menu.Root>
            <Menu.Trigger asChild>
              <IconButton
                aria-label="User profile"
                variant="ghost"
                color={"white"}
                _hover={{ bgColor: "bgMuted" }}
              >
                <FaUser />
              </IconButton>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item value="logout" onClick={handleLogout}>
                  <FaSignOutAlt />
                  Logout
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        </HStack>
      </Flex>
    </Box>
  );
};
