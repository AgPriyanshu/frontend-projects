import { Box, Button, Flex, Icon, Text } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import { CharacterCard } from "./character-card";
import type { Character } from "./types";

type CharacterSidebarProps = {
  characters: Character[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
};

export const CharacterSidebar: React.FC<CharacterSidebarProps> = ({
  characters,
  selectedId,
  onSelect,
  onAdd,
}) => {
  return (
    <Flex
      direction="column"
      w="180px"
      flexShrink={0}
      borderRightWidth="1px"
      borderColor="border.default"
      h="full"
      overflowY="auto"
    >
      <Box flex={1}>
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            isSelected={character.id === selectedId}
            onClick={() => onSelect(character.id)}
          />
        ))}
      </Box>

      <Box p={3} borderTopWidth="1px" borderColor="border.muted">
        <Button
          data-testid="add-character-button"
          w="full"
          size="sm"
          variant="ghost"
          color="text.muted"
          borderWidth="1px"
          borderColor="border.muted"
          borderStyle="dashed"
          borderRadius="lg"
          onClick={onAdd}
          _hover={{
            bg: "surface.subtle",
            color: "intent.primary",
            borderColor: "intent.primary",
          }}
        >
          <Icon as={FaPlus} mr={1} boxSize={3} />
          <Text fontSize="xs">New Character</Text>
        </Button>
      </Box>
    </Flex>
  );
};
