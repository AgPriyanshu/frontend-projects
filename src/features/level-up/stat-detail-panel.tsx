import {
  Box,
  Flex,
  Icon,
  IconButton,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { useUpdateStat } from "api/level-up/level-up-api";
import type { Stat } from "./types";

type StatDetailPanelProps = {
  stat: Stat;
  onClose: () => void;
};

export const StatDetailPanel: React.FC<StatDetailPanelProps> = ({
  stat,
  onClose,
}) => {
  const [notes, setNotes] = useState(stat.notes);
  const updateStat = useUpdateStat();

  const handleNotesBlur = () => {
    if (notes === stat.notes) return;
    updateStat.mutate({ id: stat.id, notes });
  };

  return (
    <Flex
      className="stat-detail-panel"
      direction="column"
      w="280px"
      flexShrink={0}
      borderLeftWidth="1px"
      borderColor="border.default"
      h="full"
      overflow="hidden"
    >
      {/* Header */}
      <Flex
        align="center"
        justify="space-between"
        px={5}
        py={4}
        borderBottomWidth="1px"
        borderColor="border.muted"
        flexShrink={0}
      >
        <VStack align="start" gap={1}>
          <Text
            fontSize="xs"
            fontWeight="semibold"
            color="text.muted"
            textTransform="uppercase"
            letterSpacing="widest"
          >
            Stat Detail
          </Text>
          <Text fontSize="md" fontWeight="bold" color="text.primary">
            {stat.name}
          </Text>
        </VStack>
        <IconButton
          aria-label="Close detail panel"
          size="sm"
          variant="ghost"
          color="text.muted"
          borderRadius="md"
          _hover={{ color: "text.primary", bg: "surface.subtle" }}
          onClick={onClose}
        >
          ✕
        </IconButton>
      </Flex>

      {/* Rating display */}
      <Flex
        align="center"
        gap={1.5}
        px={5}
        py={4}
        borderBottomWidth="1px"
        borderColor="border.muted"
        flexShrink={0}
      >
        {Array.from({ length: stat.max }).map((_, i) => (
          <Icon
            key={i}
            as={i < stat.value ? FaStar : FaRegStar}
            color={i < stat.value ? "yellow.400" : "border.default"}
            boxSize={5}
          />
        ))}
        <Text fontSize="xs" color="text.muted" ml={2}>
          {stat.value} / {stat.max}
        </Text>
      </Flex>

      {/* Notes */}
      <Flex direction="column" flex={1} overflow="hidden" px={5} py={4} gap={3}>
        <Text
          fontSize="xs"
          fontWeight="semibold"
          color="text.muted"
          textTransform="uppercase"
          letterSpacing="widest"
        >
          Notes
        </Text>
        <Box flex={1} overflow="hidden">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add notes, goals, or reflections…"
            resize="none"
            h="full"
            fontSize="sm"
            color="text.primary"
            borderColor="border.muted"
            bg="surface.container"
            borderRadius="md"
            _placeholder={{ color: "text.muted" }}
            _focus={{
              borderColor: "intent.primary",
              outlineColor: "intent.primary",
            }}
          />
        </Box>
      </Flex>
    </Flex>
  );
};
