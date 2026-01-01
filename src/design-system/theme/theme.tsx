import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react";
import { ColorModeProvider, type ColorModeProviderProps } from "../color-mode";
import { colors } from "./colors";

const config = defineConfig({
  globalCss: {
    "*": {
      boxSizing: "content-box",
    },
    body: {
      margin: 0,
      padding: 0,
    },
  },

  theme: {
    tokens: {
      colors,
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
}

export default system;
