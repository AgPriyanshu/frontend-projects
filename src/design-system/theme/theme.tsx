import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react";
import { ColorModeProvider, type ColorModeProviderProps } from "../color-mode";
import { colors } from "./colors";
import { buttonRecipe } from "./recipes";
import { semanticTokens } from "./semantic-tokens";

const config = defineConfig({
  globalCss: {
    "*": {
      boxSizing: "border-box",
    },
    body: {
      margin: 0,
      padding: 0,
      bg: "surface.page",
      color: "text.primary",
    },

    ".outlet-container": {
      "& > div": {
        height: "100%",
        width: "100%",
      },
    },

    // React Flow renders its own controls, so they are themed here rather than
    // in a feature stylesheet — this is the one place third-party DOM is styled.
    ".react-flow__controls-button": {
      width: "40px",
      height: "40px",
      bg: "surface.container",
      color: "icon.primary",
      borderBottomWidth: "1px",
      borderColor: "border.default",
      _hover: {
        bg: "surface.hover",
      },
      "& svg": {
        fill: "currentColor",
      },
      "&:first-of-type": {
        borderTopRadius: "md",
      },
      "&:last-of-type": {
        borderBottomRadius: "md",
      },
    },
  },

  theme: {
    tokens: {
      colors,
    },
    semanticTokens: semanticTokens,
    recipes: {
      button: buttonRecipe,
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
