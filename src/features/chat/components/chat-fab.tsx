import { IconButton, Box } from "@chakra-ui/react";
import { FiMessageCircle, FiX } from "react-icons/fi";
import { observer } from "mobx-react-lite";
import { chatStore } from "../store/chat-store";

export const ChatFab = observer(() => {
  const { isPanelOpen } = chatStore;

  return (
    <Box
      position="fixed"
      bottom="24px"
      right="24px"
      zIndex={1001}
      css={{
        "@keyframes pulseRing": {
          "0%": { boxShadow: "0 0 0 0 rgba(249, 115, 22, 0.4)" },
          "70%": { boxShadow: "0 0 0 12px rgba(249, 115, 22, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(249, 115, 22, 0)" },
        },
      }}
    >
      <IconButton
        aria-label={isPanelOpen ? "Close chat" : "Open chat"}
        onClick={() => chatStore.togglePanel()}
        w={14}
        h={14}
        borderRadius="full"
        bg="intent.primary"
        color="text.onIntent"
        _hover={{
          bg: "intent.primaryHover",
          transform: "scale(1.05)",
        }}
        _active={{
          bg: "intent.primaryActive",
          transform: "scale(0.95)",
        }}
        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        boxShadow="0 8px 24px -4px rgba(249, 115, 22, 0.35), 0 4px 8px -2px rgba(0,0,0,0.2)"
        css={{
          animation: !isPanelOpen ? "pulseRing 2.5s infinite" : "none",
          "& svg": {
            transition: "transform 0.25s ease",
            transform: isPanelOpen ? "rotate(90deg)" : "rotate(0deg)",
          },
        }}
      >
        {isPanelOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
      </IconButton>
    </Box>
  );
});
