"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "shared/design-system";

export const DesignSystemProvider = (props: ColorModeProviderProps) => {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
};
