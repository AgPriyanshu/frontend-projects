import { Box, Grid, Flex } from "@chakra-ui/react";
import { useState } from "react";
import { AppItem } from "./app-item";
import { apps } from "./constants";
import { FilterSidebar } from "./filter-sidebar";

export const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Filter apps based on selected category
  const filteredApps =
    selectedCategory === "All"
      ? apps
      : apps.filter((app) => app.category === selectedCategory);

  return (
    <Flex w="full" h="full">
      <FilterSidebar
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <Box flex="1" p={8}>
        <Grid templateColumns="repeat(auto-fit, minmax(150px, 0fr))" gap={6}>
          {filteredApps.map((app) => (
            <AppItem key={app.title} app={app} />
          ))}
        </Grid>
      </Box>
    </Flex>
  );
};
