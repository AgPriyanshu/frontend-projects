import { Box, VStack, Heading, Button } from "@chakra-ui/react";
import { AppCategory } from "./enums";

interface FilterSidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = ["All", ...Object.values(AppCategory)];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <Box
      w="200px"
      p={4}
      borderRightWidth="1px"
      borderColor="border.default"
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
            bg={
              selectedCategory === category
                ? "intent.primaryActive"
                : "transparent"
            }
            color={
              selectedCategory === category ? "text.onIntent" : "text.primary"
            }
            _hover={{
              bg:
                selectedCategory === category
                  ? "intent.primaryHover"
                  : "surface.subtle",
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
