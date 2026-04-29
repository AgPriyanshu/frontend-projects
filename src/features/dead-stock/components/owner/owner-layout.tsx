import { Box, Button, Flex, HStack, Heading, Text } from "@chakra-ui/react";
import { FiPackage, FiInbox, FiLogOut } from "react-icons/fi";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { clearToken } from "shared/local-storage";
import { queryClient } from "api/query-client";

const NAV_ITEMS = [
  {
    label: "Inventory",
    to: "/dead-stock/owner/inventory",
    icon: <FiPackage />,
  },
  { label: "Leads", to: "/dead-stock/owner/leads", icon: <FiInbox /> },
];

export const OwnerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    queryClient.clear();
    navigate("/dead-stock/login", { replace: true });
  };

  return (
    <Flex
      className="owner-layout"
      direction="column"
      w="100vw"
      h="100dvh"
      bg="bg.canvas"
    >
      {/* Header */}
      <Box
        borderBottomWidth="1px"
        borderColor="border.default"
        bg="bg.panel"
        px={6}
        py={3}
        flexShrink={0}
      >
        <Flex align="center" justify="space-between" maxW="5xl" mx="auto">
          <HStack gap={6}>
            <Link to="/dead-stock">
              <Heading size="md" fontWeight="bold" letterSpacing="tight">
                Dead Stock
              </Heading>
            </Link>
            <HStack gap={1}>
              {NAV_ITEMS.map(({ label, to, icon }) => {
                const isActive = location.pathname === to;
                return (
                  <Button
                    key={to}
                    asChild
                    variant="ghost"
                    size="sm"
                    color={isActive ? "fg" : "fg.muted"}
                    fontWeight={isActive ? "semibold" : "normal"}
                    bg={isActive ? "bg.muted" : "transparent"}
                  >
                    <Link to={to}>
                      {icon}
                      <Text>{label}</Text>
                    </Link>
                  </Button>
                );
              })}
            </HStack>
          </HStack>
          <Button
            variant="ghost"
            size="sm"
            color="fg.muted"
            onClick={handleLogout}
          >
            <FiLogOut />
            Logout
          </Button>
        </Flex>
      </Box>

      {/* Page content */}
      <Box flex={1} overflowY="auto" px={6} py={6}>
        <Box maxW="5xl" mx="auto">
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};
