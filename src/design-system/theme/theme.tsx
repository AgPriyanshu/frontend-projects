import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react";
import { ColorModeProvider, type ColorModeProviderProps } from "../color-mode";
import { colors } from "./colors";
import { semanticTokens } from "./semantic-tokens";
import {
  alertRecipe,
  badgeRecipe,
  buttonRecipe,
  cardRecipe,
  checkboxRecipe,
  inputRecipe,
  progressRecipe,
  radioRecipe,
  sliderRecipe,
  switchRecipe,
  tabsRecipe,
} from "./recipes";

const config = defineConfig({
  globalCss: {
    body: {
      margin: 0,
      padding: 0,
    },
  },

  theme: {
    tokens: {
      colors,
      radii: {
        default: { value: "{radii.xl}" },
      },
    },
    semanticTokens: semanticTokens,
    recipes: {
      button: buttonRecipe,
      input: inputRecipe,
      card: cardRecipe,
      badge: badgeRecipe,
      checkbox: checkboxRecipe,
      switch: switchRecipe,
      radio: radioRecipe,
      slider: sliderRecipe,
      progress: progressRecipe,
      alert: alertRecipe,
      tabs: tabsRecipe,
    },
  },
});

const system = createSystem(defaultConfig, config);

export const ThemeProvider = (props: ColorModeProviderProps) => {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
};

export default system;
