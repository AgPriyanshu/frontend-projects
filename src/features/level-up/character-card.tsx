import { Flex, Text } from "@chakra-ui/react";
import { AvatarDisplay } from "./avatar-display";
import type { Character } from "./types";

type CharacterCardProps = {
  character: Character;
  isSelected: boolean;
  onClick: () => void;
};

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  isSelected,
  onClick,
}) => {
  return (
    <Flex
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
    </Flex>
  );
};
