import { defineRecipe } from "@chakra-ui/react";

/**
 * Component Recipes
 *
 * This file contains all custom recipe configurations for Chakra UI components.
 * Recipes allow you to customize the default styling and behavior of components.
 *
 * @see https://chakra-ui.com/docs/theming/customization/recipes
 */

// ============================================================================
// BUTTON RECIPE
// ============================================================================

/**
 * Button Recipe
 *
 * Customizes the default button component with:
 * - Brand color palette (orange)
 * - XL border radius for modern look
 *
 * Usage: <Button>Click me</Button>
 * Override: <Button colorPalette="red">Red Button</Button>
 */
export const buttonRecipe = defineRecipe({
  base: {
    colorPalette: "brand",
    borderRadius: "lg",
  },
});

// ============================================================================
// INPUT RECIPE
// ============================================================================

/**
 * Input Recipe
 *
 * Customizes input fields with:
 * - LG border radius
 * - Brand color focus ring
 * - Consistent border styling
 *
 * Usage: <Input placeholder="Enter text" />
 */
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

// ============================================================================
// CARD RECIPE
// ============================================================================

/**
 * Card Recipe
 *
 * Customizes card components with:
 * - XL border radius
 * - Semantic background colors
 * - Consistent border styling
 *
 * Usage: <Card.Root>...</Card.Root>
 */
export const cardRecipe = defineRecipe({
  base: {
    borderRadius: "xl",
    bg: "bg",
    borderWidth: "1px",
    borderColor: "border",
  },
});

// ============================================================================
// FORM CONTROL RECIPES
// ============================================================================

/**
 * Badge Recipe
 *
 * Customizes badge components with brand colors
 *
 * Usage: <Badge>New</Badge>
 */
export const badgeRecipe = defineRecipe({
  base: {
    borderRadius: "md",
  },
  defaultVariants: {
    colorPalette: "brand",
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
    colorPalette: "brand",
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
    colorPalette: "brand",
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
    colorPalette: "brand",
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
    colorPalette: "brand",
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
    colorPalette: "brand",
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
    colorPalette: "brand",
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
