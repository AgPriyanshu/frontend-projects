import { Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { FaRegStar, FaStar } from "react-icons/fa";
import type { Stat } from "./types";

type StatRowProps = {
  stat: Stat;
  onUpdate: (value: number) => void;
};

export const StatRow: React.FC<StatRowProps> = ({ stat, onUpdate }) => {
  const handleClick = (index: number) => {
    // Clicking the same filled star clears it.
    const newValue = index + 1 === stat.value ? 0 : index + 1;
    onUpdate(newValue);
  };

  return (
    <Flex
      data-testid={`stat-row-${stat.name.toLowerCase()}`}
      align="center"
      py={4}
      px={6}
      borderBottomWidth="1px"
      borderColor="border.muted"
      gap={8}
      _last={{ borderBottomWidth: 0 }}
    >
      <Text
        w="100px"
        fontSize="xs"
        fontWeight="semibold"
        color="text.secondary"
        textTransform="uppercase"
        letterSpacing="widest"
        flexShrink={0}
      >
        {stat.name}
      </Text>
      <HStack gap={2}>
        {Array.from({ length: stat.max }).map((_, i) => (
          <Icon
            key={i}
            as={i < stat.value ? FaStar : FaRegStar}
            color={i < stat.value ? "yellow.400" : "border.default"}
            cursor="pointer"
            boxSize={5}
            onClick={() => handleClick(i)}
            transition="transform 0.1s, color 0.1s"
            _hover={{ transform: "scale(1.25)", color: "yellow.400" }}
          />
        ))}
      </HStack>
    </Flex>
  );
};
