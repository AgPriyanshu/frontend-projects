import { Flex, Text } from "@chakra-ui/react";
import { type ChatSessionResponse, useDeleteChatSession } from "api/chat";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import { useState } from "react";
import { DeleteIconButton } from "shared/components";
import { chatStore } from "../store";

export const SessionItem = ({
  session,
  isActive,
  onSelect,
}: {
  session: ChatSessionResponse;
  isActive: boolean;
  onSelect: () => void;
}) => {
  // States.
  const [isHovered, setIsHovered] = useState(false);

  // APIs.
  const deleteSession = useDeleteChatSession(session.id);

  // Handlers.
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession.mutate(undefined, {
      onSuccess: () => {
        if (chatStore.activeSessionId === session.id) {
          chatStore.setActiveSession(null);
        }
        queryClient.invalidateQueries({ queryKey: QueryKeys.chatSessions });
      },
    });
  };

  // Render.
  return (
    <Flex
      className="session-item"
      w={"full"}
      h={"2rem"}
      px={3}
      py={2}
      cursor="pointer"
      gap={2.5}
      bg={isActive ? "surface.hover" : "transparent"}
      _hover={{ bg: "surface.hover" }}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition="all 0.15s ease"
      alignItems={"center"}
    >
      <Text
        fontSize="xs"
        flex={1}
        truncate
        color={isActive ? "text.primary" : "text.secondary"}
        fontWeight={isActive ? 500 : 400}
      >
        {session.name}
      </Text>
      {isHovered && <DeleteIconButton size={"2xs"} onClick={handleDelete} />}
    </Flex>
  );
};
