import { defineRecipe } from "@chakra-ui/react";

export const buttonRecipe = defineRecipe({
  base: {
    borderRadius: "lg",
  },
  defaultVariants: {
    colorPalette: "brand",
  },
});
