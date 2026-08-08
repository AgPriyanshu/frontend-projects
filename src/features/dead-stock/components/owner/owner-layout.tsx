import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import { queryClient } from "api/query-client";
import { FiInbox, FiLogOut, FiShoppingBag } from "react-icons/fi";
import { MdOutlineInventory2 } from "react-icons/md";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { clearDeadStockOwnerToken, clearToken } from "shared/local-storage";
import { BrandHeading } from "../brand-heading";
const NAV_ITEMS = [
  {
    label: "Inventory",
    to: "/dead-stock/owner/inventory",
    icon: <MdOutlineInventory2 />,
  },
  { label: "Leads", to: "/dead-stock/owner/leads", icon: <FiInbox /> },
  { label: "My Shop", to: "/dead-stock/owner/shop", icon: <FiShoppingBag /> },
];

export const OwnerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearDeadStockOwnerToken();
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
      bg="surface.page"
    >
      {/* Header */}
      <Box
        borderBottomWidth="1px"
        borderColor="border.default"
        bg="surface.container"
        px={6}
        py={3}
        flexShrink={0}
      >
        <Flex align="center" justify="space-between" maxW="5xl" mx="auto">
          <HStack gap={6}>
            <Link to="/dead-stock">
              <BrandHeading size="md" />
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
                    color={isActive ? "text.primary" : "text.muted"}
                    fontWeight={isActive ? "semibold" : "normal"}
                    bg={isActive ? "surface.subtle" : "transparent"}
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
            color="text.muted"
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
