import { Center, Flex, Spinner } from "@chakra-ui/react";
import { useState } from "react";
import {
  useAddStat,
  useCharacters,
  useCreateCharacter,
  useDeleteCharacter,
  useUpdateCharacter,
  useUpdateStat,
} from "api/level-up/level-up-api";
import { CharacterPanel } from "./character-panel";
import { CharacterSidebar } from "./character-sidebar";
import { DEFAULT_STATS, STAT_MAX } from "./constants";

export const LevelUpPage = () => {
  const { data: characters = [], isLoading } = useCharacters();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const createCharacter = useCreateCharacter();
  const updateCharacter = useUpdateCharacter();
  const deleteCharacter = useDeleteCharacter();
  const addStat = useAddStat();
  const updateStat = useUpdateStat();

  const effectiveId = selectedId ?? characters[0]?.id ?? null;
  const selectedCharacter = characters.find((c) => c.id === effectiveId);

  const handleAddCharacter = () => {
    createCharacter.mutate(
      {
        name: `Character ${characters.length + 1}`,
        avatar: "🧙",
        className: "Wanderer",
        level: 1,
        stats: DEFAULT_STATS.map((s) => ({ ...s })),
      },
      {
        onSuccess: (response) => {
          setSelectedId(response.data.data.id);
        },
      }
    );
  };

  const handleStatUpdate = (statId: string, value: number) => {
    updateStat.mutate({ id: statId, value });
  };

  const handleStatAdd = (name: string) => {
    if (!selectedId) return;
    addStat.mutate({ characterId: selectedId, name, value: 0, max: STAT_MAX });
  };

  const handleNameUpdate = (name: string) => {
    if (!selectedId || !selectedCharacter) return;
    updateCharacter.mutate({
      id: selectedId,
      name: name.trim() || selectedCharacter.name,
    });
  };

  const handleClassUpdate = (className: string) => {
    if (!selectedId || !selectedCharacter) return;
    updateCharacter.mutate({
      id: selectedId,
      className: className.trim() || selectedCharacter.className,
    });
  };

  const handleLevelUpdate = (level: number) => {
    if (!selectedId) return;
    updateCharacter.mutate({ id: selectedId, level });
  };

  const handleAvatarUpdate = (dataUrl: string) => {
    if (!selectedId) return;
    updateCharacter.mutate({ id: selectedId, avatar: dataUrl });
  };

  const handleDeleteCharacter = (id: string) => {
    deleteCharacter.mutate(id, {
      onSuccess: () => {
        const remaining = characters.filter((c) => c.id !== id);
        setSelectedId(remaining.length > 0 ? remaining[0].id : "");
      },
    });
  };

  if (isLoading) {
    return (
      <Center className="level-up-page" w="full" h="600px">
        <Spinner size="lg" color="intent.primary" />
      </Center>
    );
  }

  return (
    <Flex
      className="level-up-page"
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
        selectedId={effectiveId ?? ""}
        onSelect={setSelectedId}
        onAdd={handleAddCharacter}
        onDelete={handleDeleteCharacter}
      />
      {selectedCharacter && (
        <CharacterPanel
          character={selectedCharacter}
          onStatUpdate={handleStatUpdate}
          onStatAdd={handleStatAdd}
          onAvatarUpdate={handleAvatarUpdate}
          onNameUpdate={handleNameUpdate}
          onClassUpdate={handleClassUpdate}
          onLevelUpdate={handleLevelUpdate}
        />
      )}
    </Flex>
  );
};
