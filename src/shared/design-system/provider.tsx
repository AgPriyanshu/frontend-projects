"use client";

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";

const config = defineConfig({
  ...defaultConfig,
  theme: {
    tokens: {
      colors: {},
    },
  },
  globalCss: {
    "*": {
      boxSizing: "content-box",
    },
    body: {
      margin: 0,
      padding: 0,
    },
  },
});

const system = createSystem(config);

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
