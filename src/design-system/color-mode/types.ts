import type { IconButtonProps } from "@chakra-ui/react";
import type { ThemeProviderProps } from "next-themes";

export interface ColorModeProviderProps extends ThemeProviderProps {}

export interface UseColorModeReturn {
  colorMode: ColorMode;
  setColorMode: (colorMode: ColorMode) => void;
  toggleColorMode: () => void;
}

export type ColorMode = "light" | "dark";

export interface ColorModeButtonProps extends Omit<
  IconButtonProps,
  "aria-label"
> {}
