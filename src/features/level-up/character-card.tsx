import { Flex, Icon, IconButton, Text } from "@chakra-ui/react";
import { FaTrash } from "react-icons/fa";
import { AvatarDisplay } from "./avatar-display";
import type { Character } from "./types";

type CharacterCardProps = {
  character: Character;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
};

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  isSelected,
  onClick,
  onDelete,
}) => {
  return (
    <Flex
      className="character-card"
      data-testid="character-card"
      direction="column"
      align="center"
      py={5}
      px={3}
      gap={3}
      cursor="pointer"
      borderBottomWidth="1px"
      borderColor="border.muted"
      borderLeftWidth="3px"
      borderLeftColor={isSelected ? "intent.primary" : "transparent"}
      bg={isSelected ? "surface.subtle" : "transparent"}
      onClick={onClick}
      transition="all 0.15s"
      position="relative"
      role="group"
      _hover={{ bg: "surface.hover" }}
    >
      <AvatarDisplay
        avatar={character.avatar}
        size="sm"
        borderColor={isSelected ? "intent.primaryHover" : "border.muted"}
      />
      <Text
        fontSize="xs"
        fontWeight="medium"
        color={isSelected ? "text.primary" : "text.secondary"}
        textAlign="center"
        lineHeight="tight"
      >
        {character.name}
      </Text>
      <IconButton
        aria-label="Delete character"
        size="2xs"
        variant="ghost"
        color="text.muted"
        position="absolute"
        top={1}
        right={1}
        opacity={0}
        _groupHover={{ opacity: 1 }}
        _hover={{ color: "red.500" }}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Icon as={FaTrash} boxSize={2.5} />
      </IconButton>
    </Flex>
  );
};
