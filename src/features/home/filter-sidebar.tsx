import { Box, VStack, Heading, Button } from "@chakra-ui/react";

interface FilterSidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = ["All", "Productivity", "Navigation"];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <Box
      w="200px"
      p={4}
      borderRightWidth="1px"
      borderColor="border"
      height="full"
    >
      <VStack align="stretch" gap={4}>
        <Heading size="sm" mb={2}>
          Categories
        </Heading>
        {categories.map((category) => (
          <Button
            key={category}
            variant="ghost"
            bg={selectedCategory === category ? "primaryActive" : "transparent"}
            color={selectedCategory === category ? "onPrimary" : "fg"}
            _hover={{
              bg: selectedCategory === category ? "primaryHover" : "bgMuted",
            }}
            onClick={() => onCategoryChange(category)}
            justifyContent="flex-start"
            size="sm"
          >
            {category}
          </Button>
        ))}
      </VStack>
    </Box>
  );
};
