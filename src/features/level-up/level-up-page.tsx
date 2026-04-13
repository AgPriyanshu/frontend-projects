import { Flex } from "@chakra-ui/react";
import { useState } from "react";
import { CharacterPanel } from "./character-panel";
import { CharacterSidebar } from "./character-sidebar";
import { DEFAULT_STATS, INITIAL_CHARACTERS, STAT_MAX } from "./constants";
import type { Character } from "./types";

export const LevelUpPage = () => {
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [selectedId, setSelectedId] = useState<string>(
    INITIAL_CHARACTERS[0].id
  );

  const selectedCharacter = characters.find((c) => c.id === selectedId)!;

  const updateSelected = (patch: Partial<Character>) =>
    setCharacters((prev) =>
      prev.map((char) =>
        char.id === selectedId ? { ...char, ...patch } : char
      )
    );

  const handleStatUpdate = (statName: string, value: number) => {
    updateSelected({
      stats: selectedCharacter.stats.map((s) =>
        s.name === statName ? { ...s, value } : s
      ),
    });
  };

  const handleStatAdd = (name: string) => {
    updateSelected({
      stats: [...selectedCharacter.stats, { name, value: 0, max: STAT_MAX }],
    });
  };

  const handleNameUpdate = (name: string) => {
    updateSelected({ name: name.trim() || selectedCharacter.name });
  };

  const handleClassUpdate = (className: string) => {
    updateSelected({ class: className.trim() || selectedCharacter.class });
  };

  const handleLevelUpdate = (level: number) => {
    updateSelected({ level });
  };

  const handleAvatarUpdate = (dataUrl: string) => {
    updateSelected({ avatar: dataUrl });
  };

  const handleAddCharacter = () => {
    const newChar: Character = {
      id: crypto.randomUUID(),
      name: `Character ${characters.length + 1}`,
      avatar: "🧙",
      class: "Wanderer",
      level: 1,
      stats: DEFAULT_STATS.map((s) => ({ ...s })),
    };
    setCharacters((prev) => [...prev, newChar]);
    setSelectedId(newChar.id);
  };

  return (
    <Flex
      w="full"
      maxW="960px"
      h="600px"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="border.default"
      overflow="hidden"
      shadow="lg"
      mx="auto"
    >
      <CharacterSidebar
        characters={characters}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onAdd={handleAddCharacter}
      />
      <CharacterPanel
        character={selectedCharacter}
        onStatUpdate={handleStatUpdate}
        onStatAdd={handleStatAdd}
        onAvatarUpdate={handleAvatarUpdate}
        onNameUpdate={handleNameUpdate}
        onClassUpdate={handleClassUpdate}
        onLevelUpdate={handleLevelUpdate}
      />
    </Flex>
  );
};
