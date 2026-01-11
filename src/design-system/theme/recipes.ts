import { defineRecipe } from "@chakra-ui/react";

export const buttonRecipe = defineRecipe({
  base: {
    colorPalette: "brand" as any,
    borderRadius: "lg",
  },
});

export const inputRecipe = defineRecipe({
  base: {
    borderRadius: "lg",
    borderColor: "border",
    _focus: {
      borderColor: "brand.solid",
      boxShadow: "0 0 0 1px var(--chakra-colors-brand-solid)",
    },
  },
});

export const cardRecipe = defineRecipe({
  base: {
    borderRadius: "xl",
    bg: "bg",
    borderWidth: "1px",
    borderColor: "border",
  },
});

export const badgeRecipe = defineRecipe({
  base: {
    borderRadius: "md",
  },
  defaultVariants: {
    colorPalette: "brand" as any,
  },
});

/**
 * Checkbox Recipe
 *
 * Customizes checkbox components with brand colors
 *
 * Usage: <Checkbox>Accept terms</Checkbox>
 */
export const checkboxRecipe = defineRecipe({
  base: {
    borderRadius: "md",
  },
  defaultVariants: {
    colorPalette: "brand" as any,
  },
});

/**
 * Switch Recipe
 *
 * Customizes switch/toggle components with brand colors
 *
 * Usage: <Switch>Enable notifications</Switch>
 */
export const switchRecipe = defineRecipe({
  base: {
    borderRadius: "full",
  },
  defaultVariants: {
    colorPalette: "brand" as any,
  },
});

/**
 * Radio Recipe
 *
 * Customizes radio button components with brand colors
 *
 * Usage: <Radio>Option 1</Radio>
 */
export const radioRecipe = defineRecipe({
  defaultVariants: {
    colorPalette: "brand" as any,
  },
});

// ============================================================================
// INTERACTIVE RECIPES
// ============================================================================

/**
 * Slider Recipe
 *
 * Customizes slider components with brand colors
 *
 * Usage: <Slider defaultValue={50} />
 */
export const sliderRecipe = defineRecipe({
  defaultVariants: {
    colorPalette: "brand" as any,
  },
});

/**
 * Progress Recipe
 *
 * Customizes progress bar components with brand colors
 *
 * Usage: <Progress value={75} />
 */
export const progressRecipe = defineRecipe({
  base: {
    borderRadius: "full",
  },
  defaultVariants: {
    colorPalette: "brand" as any,
  },
});

/**
 * Tabs Recipe
 *
 * Customizes tabs components with brand colors
 *
 * Usage: <Tabs.Root>...</Tabs.Root>
 */
export const tabsRecipe = defineRecipe({
  defaultVariants: {
    colorPalette: "brand" as any,
  },
});

// ============================================================================
// FEEDBACK RECIPES
// ============================================================================

/**
 * Alert Recipe
 *
 * Customizes alert components with consistent border radius
 *
 * Usage: <Alert.Root>...</Alert.Root>
 */
export const alertRecipe = defineRecipe({
  base: {
    borderRadius: "lg",
  },
});
