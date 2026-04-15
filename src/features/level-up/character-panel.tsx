import {
  Badge,
  Box,
  Button,
  Editable,
  Flex,
  Icon,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { AvatarUpload } from "./avatar-upload";
import { StatRow } from "./stat-row";
import type { Character } from "./types";

type CharacterPanelProps = {
  character: Character;
  onStatUpdate: (statName: string, value: number) => void;
  onAvatarUpdate: (dataUrl: string) => void;
  onNameUpdate: (name: string) => void;
  onClassUpdate: (className: string) => void;
  onLevelUpdate: (level: number) => void;
  onStatAdd: (name: string) => void;
};

export const CharacterPanel: React.FC<CharacterPanelProps> = ({
  character,
  onStatUpdate,
  onAvatarUpdate,
  onNameUpdate,
  onClassUpdate,
  onLevelUpdate,
  onStatAdd,
}) => {
  const [newStatName, setNewStatName] = useState("");

  const totalScore = character.stats.reduce((sum, s) => sum + s.value, 0);
  const maxScore = character.stats.reduce((sum, s) => sum + s.max, 0);

  const handleAddStat = () => {
    const trimmed = newStatName.trim();
    const isDuplicate = character.stats.some(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (!trimmed || isDuplicate) return;
    onStatAdd(trimmed);
    setNewStatName("");
  };

  const handleLevelChange = (raw: string) => {
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 999) {
      onLevelUpdate(parsed);
    }
  };

  return (
    <Flex flex={1} direction="column" h="full" overflowY="auto" minW={0}>
      {/* Character header */}
      <Flex
        align="center"
        gap={6}
        p={8}
        borderBottomWidth="1px"
        borderColor="border.default"
      >
        <AvatarUpload avatar={character.avatar} onUpload={onAvatarUpdate} />

        <VStack align="start" gap={1} flex={1}>
          {/* Editable name — key resets when switching characters. */}
          <Editable.Root
            data-testid="character-name"
            key={`name-${character.id}`}
            defaultValue={character.name}
            onValueCommit={(e) => onNameUpdate(e.value)}
            fontSize="3xl"
            fontWeight="bold"
            color="text.primary"
          >
            <Editable.Preview
              _hover={{ color: "intent.primary", cursor: "text" }}
            />
            <Editable.Input
              maxLength={40}
              _focus={{ outlineColor: "intent.primary" }}
            />
          </Editable.Root>

          {/* Editable occupation/class. */}
          <Editable.Root
            data-testid="character-class"
            key={`class-${character.id}`}
            defaultValue={character.class}
            onValueCommit={(e) => onClassUpdate(e.value)}
            fontSize="sm"
            fontWeight="semibold"
            color="intent.primary"
            letterSpacing="wide"
          >
            <Editable.Preview _hover={{ opacity: 0.75, cursor: "text" }} />
            <Editable.Input
              maxLength={40}
              _focus={{ outlineColor: "intent.primary" }}
            />
          </Editable.Root>

          <Flex align="center" gap={3} mt={1}>
            {/* Editable level badge. */}
            <Editable.Root
              data-testid="character-level"
              key={`level-${character.id}`}
              defaultValue={String(character.level)}
              onValueCommit={(e) => handleLevelChange(e.value)}
              display="inline-flex"
            >
              <Editable.Preview asChild>
                <Badge
                  colorPalette="orange"
                  variant="solid"
                  px={2}
                  py={0.5}
                  borderRadius="md"
                  cursor="text"
                  fontSize="xs"
                  letterSpacing="wider"
                >
                  LVL {character.level}
                </Badge>
              </Editable.Preview>
              <Editable.Input
                w="60px"
                type="number"
                min={1}
                max={999}
                textAlign="center"
                fontSize="xs"
                fontWeight="bold"
                _focus={{ outlineColor: "intent.primary" }}
              />
            </Editable.Root>

            <Text fontSize="xs" color="text.muted">
              Overall score:{" "}
              <Text as="span" color="text.secondary" fontWeight="semibold">
                {totalScore} / {maxScore}
              </Text>
            </Text>
          </Flex>
        </VStack>
      </Flex>

      {/* Stats table */}
      <Box flex={1}>
        {character.stats.map((stat) => (
          <StatRow
            key={stat.name}
            stat={stat}
            onUpdate={(value) => onStatUpdate(stat.name, value)}
          />
        ))}

        {/* Add stat row */}
        <Flex
          align="center"
          py={3}
          px={6}
          gap={3}
          borderTopWidth="1px"
          borderColor="border.muted"
          borderStyle="dashed"
        >
          <Input
            placeholder="New stat name…"
            value={newStatName}
            size="sm"
            w="180px"
            borderRadius="md"
            borderColor="border.muted"
            color="text.primary"
            _placeholder={{ color: "text.muted" }}
            _focus={{
              borderColor: "intent.primary",
              outlineColor: "intent.primary",
            }}
            onChange={(e) => setNewStatName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddStat()}
          />
          <Button
            size="sm"
            variant="ghost"
            color="text.muted"
            borderRadius="md"
            borderWidth="1px"
            borderColor="border.muted"
            _hover={{ color: "intent.primary", borderColor: "intent.primary" }}
            onClick={handleAddStat}
            disabled={!newStatName.trim()}
          >
            <Icon as={FaPlus} boxSize={3} mr={1} />
            Add stat
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};
