import { Box, Flex, Heading, HStack, IconButton, Menu } from "@chakra-ui/react";
import { queryClient } from "api/query-client";
import { RoutePath } from "app/router/constants";
import { observer } from "mobx-react-lite";
import { FaSignOutAlt, FaUser } from "react-icons/fa";
import { RiChatAiLine } from "react-icons/ri";
import { useNavigate } from "react-router";
import { clearToken } from "shared/local-storage";
import { chatStore } from "features/agent-chat";
import atlasLogo from "../../assets/logo-vector.svg";
import { ColorModeButton } from "../color-mode";
import { NotificationDropdown } from "./notification-dropdown";
import { useEffect } from "react";
import { useCreateChatSession, useLLMs } from "api/chat";
import { QueryKeys } from "api/query-keys";

export const Navbar = observer(() => {
  // Hooks.
  const navigate = useNavigate();
  const createSession = useCreateChatSession();
  const { data: llmData } = useLLMs();
  const llms = llmData?.data ?? [];

  // Effects.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifier = event.ctrlKey || event.metaKey; // metakey for MacOS
      if (isModifier && event.key === ".") {
        event.preventDefault();
        chatStore.togglePanel();
      }

      if (event.ctrlKey && event.key === "n" && chatStore.isPanelOpen) {
        const firstLlm = llms[0]?.id ?? null;

        createSession.mutate(
          { name: `Chat from shortcut`, llm: firstLlm },
          {
            onSuccess: (response) => {
              queryClient.invalidateQueries({
                queryKey: QueryKeys.chatSessions,
              });
              const newSession = response.data?.data;
              if (newSession?.id) {
                chatStore.setActiveSession(newSession.id);
              }
            },
          }
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Handlers.
  const handleLogout = () => {
    clearToken();
    queryClient.clear();
    navigate(RoutePath.Login);
  };

  return (
    <Box
      as="nav"
      h={"6vh"}
      w="full"
      borderBottomWidth="1px"
      px={4}
      py={4}
      bg={"surface.container"}
    >
      <Flex justify="space-between" align="center">
        <HStack
          gap={3}
          cursor="pointer"
          onClick={() => navigate("/")}
          _hover={{ opacity: 0.8 }}
          transition="opacity 0.2s"
          ml={"1rem"}
        >
          <img
            src={atlasLogo}
            alt="Atlas"
            style={{ height: "36px", width: "auto" }}
          />
          <Heading
            size="md"
            fontWeight="bold"
            letterSpacing="widest"
            textTransform="uppercase"
          >
            Atlas
          </Heading>
        </HStack>

        <HStack gap={4}>
          <ColorModeButton />
          <NotificationDropdown />
          <IconButton
            variant="ghost"
            aria-label="Toggle AI Chat"
            onClick={() => chatStore.togglePanel()}
            color={chatStore.isPanelOpen ? "intent.primary" : "text.primary"}
            _hover={{ bgColor: "surface.subtle" }}
          >
            <RiChatAiLine />
          </IconButton>

          <Menu.Root>
            <Menu.Trigger asChild>
              <IconButton
                aria-label="User profile"
                variant="ghost"
                color={"text.primary"}
                _hover={{ bgColor: "surface.subtle" }}
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
});
