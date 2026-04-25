import { Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { FaChevronRight, FaRegStar, FaStar } from "react-icons/fa";
import type { Stat } from "./types";

type StatRowProps = {
  stat: Stat;
  isSelected: boolean;
  onUpdate: (value: number) => void;
  onSelect: () => void;
};

export const StatRow: React.FC<StatRowProps> = ({
  stat,
  isSelected,
  onUpdate,
  onSelect,
}) => {
  const handleStarClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    // Clicking the same filled star clears it.
    const newValue = index + 1 === stat.value ? 0 : index + 1;
    onUpdate(newValue);
  };

  return (
    <Flex
      className="stat-row"
      data-testid={`stat-row-${stat.name.toLowerCase()}`}
      align="center"
      py={4}
      px={6}
      borderBottomWidth="1px"
      borderColor="border.muted"
      borderLeftWidth="3px"
      borderLeftColor={isSelected ? "intent.primary" : "transparent"}
      bg={isSelected ? "surface.subtle" : "transparent"}
      gap={8}
      cursor="pointer"
      role="button"
      transition="background 0.15s, border-color 0.15s"
      _hover={{ bg: "surface.hover" }}
      _last={{ borderBottomWidth: 0 }}
      onClick={onSelect}
    >
      <Flex align="center" gap={2} w="120px" flexShrink={0}>
        <Text
          fontSize="xs"
          fontWeight="semibold"
          color={isSelected ? "text.primary" : "text.secondary"}
          textTransform="uppercase"
          letterSpacing="widest"
          flex={1}
        >
          {stat.name}
        </Text>
        <Icon
          as={FaChevronRight}
          boxSize={2.5}
          color={isSelected ? "intent.primary" : "text.muted"}
          opacity={isSelected ? 1 : 0}
          transition="opacity 0.15s"
          _groupHover={{ opacity: 1 }}
        />
      </Flex>
      <HStack gap={2}>
        {Array.from({ length: stat.max }).map((_, i) => (
          <Icon
            key={i}
            as={i < stat.value ? FaStar : FaRegStar}
            color={i < stat.value ? "yellow.400" : "border.default"}
            cursor="pointer"
            boxSize={5}
            onClick={(e) => handleStarClick(e, i)}
            transition="transform 0.1s, color 0.1s"
            _hover={{ transform: "scale(1.25)", color: "yellow.400" }}
          />
        ))}
      </HStack>
    </Flex>
  );
};
