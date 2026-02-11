import {
  Badge,
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Menu,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  AppName,
  useNotifications,
  useNotificationStream,
  useUpdateNotifications,
  type Notification,
} from "api/events";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import {
  FcAbout,
  FcGlobe,
  FcMoneyTransfer,
  FcTemplate,
  FcTodoList,
} from "react-icons/fc";
import { TbWorldBolt } from "react-icons/tb";
import { getRelativeTime } from "shared/utils";

const getAppIcon = (appName: AppName) => {
  switch (appName) {
    case AppName.Todo:
      return FcTodoList;
    case AppName.ExpenseTracker:
      return FcMoneyTransfer;
    case AppName.NoteMarkdown:
      return FcAbout;
    case AppName.WebGis:
      return FcGlobe;
    case AppName.Blogs:
      return FcTemplate;
    default:
      return TbWorldBolt;
  }
};

export const NotificationDropdown = () => {
  // States.
  const [totalVisibleNotifications, setTotalVisibleNotifications] = useState(5);

  // APIs.
  const { data: notifications } = useNotifications();
  const { isConnected } = useNotificationStream();
  const { mutate: updateNotifications } = useUpdateNotifications();

  // Handlers.
  const handleOpenChange = () => {
    if (!isEmpty(unreadNotifications)) {
      updateNotifications({
        ids: unreadNotifications.map((notification) => notification.id),
        seen: true,
      });
    }
  };

  // Helpers.
  const getVisibleNotifications = (): Notification[] => {
    return !isEmpty(notifications)
      ? notifications.data.slice(0, totalVisibleNotifications)
      : [];
  };

  const onClickSeeMore = () => setTotalVisibleNotifications((prev) => prev + 5);

  // Variables.
  const unreadNotifications = !isEmpty(notifications)
    ? notifications.data.filter((notification) => !notification.seen)
    : [];

  useEffect(() => {
    console.log({ not: notifications?.data });
  }, [notifications]);

  console.info(`sse: ${isConnected}`);

  return (
    <Menu.Root onOpenChange={handleOpenChange}>
      <Menu.Trigger asChild>
        <Box position="relative">
          <IconButton
            aria-label="Notifications"
            variant="ghost"
            color={"text.primary"}
            _hover={{ bgColor: "surface.subtle" }}
          >
            <FaBell />
          </IconButton>

          {unreadNotifications && !isEmpty(unreadNotifications) && (
            <Badge
              position="absolute"
              top="-2px"
              right="-2px"
              colorPalette="red"
              variant="solid"
              size="xs"
              borderRadius="full"
              zIndex={1}
            >
              {unreadNotifications.length}
            </Badge>
          )}
        </Box>
      </Menu.Trigger>

      <Menu.Positioner>
        <Menu.Content maxH="400px" overflowY="auto" maxW="300px">
          {isEmpty(notifications) ? (
            <Box p={4} textAlign="center">
              <Text color="text.secondary">No new notifications</Text>
            </Box>
          ) : (
            <>
              {getVisibleNotifications().map((notification) => (
                <Menu.Item key={notification.id} value={notification.id}>
                  <HStack align="start" gap={3} w="full">
                    <Icon
                      as={getAppIcon(notification.appName)}
                      boxSize={5}
                      mt={1}
                    />
                    <VStack align="start" gap={0} flex={1}>
                      <Text fontSize="sm" color="text.secondary">
                        {notification.content}
                      </Text>
                      <Text fontSize="xs" color="text.muted" mt={1}>
                        {getRelativeTime(new Date(notification.createdAt))}
                      </Text>
                    </VStack>

                    {!notification.seen && (
                      <Box
                        w="8px"
                        h="8px"
                        borderRadius="full"
                        bg="blue.500"
                        mt={2}
                      />
                    )}
                  </HStack>
                </Menu.Item>
              ))}

              {notifications.data.length > 5 && (
                <Box p={2} textAlign="center">
                  <Button
                    variant="plain"
                    size="sm"
                    w="full"
                    onClick={onClickSeeMore}
                  >
                    See more
                  </Button>
                </Box>
              )}
            </>
          )}
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
};
