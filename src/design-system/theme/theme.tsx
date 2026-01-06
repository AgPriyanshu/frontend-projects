import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react";
import { ColorModeProvider, type ColorModeProviderProps } from "../color-mode";
import { colors } from "./colors";
import { semanticTokens } from "./semantic-tokens";

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
    },
    semanticTokens: semanticTokens,
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
