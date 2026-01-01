export const semanticTokens = {
  colors: {
    // Primary brand colors
    primary: {
      value: {
        _light: "{colors.brand.500}",
        _dark: "{colors.brand.400}",
      },
    },
    primaryHover: {
      value: {
        _light: "{colors.brand.600}",
        _dark: "{colors.brand.500}",
      },
    },
    primaryActive: {
      value: {
        _light: "{colors.brand.700}",
        _dark: "{colors.brand.600}",
      },
    },
    onPrimary: {
      value: {
        _light: "{colors.neutral.0}",
        _dark: "{colors.neutral.0}",
      },
    },

    // Background colors
    bg: {
      value: {
        _light: "{colors.neutral.0}",
        _dark: "{colors.neutral.950}",
      },
    },
    bgSubtle: {
      value: {
        _light: "{colors.neutral.50}",
        _dark: "{colors.neutral.900}",
      },
    },
    bgMuted: {
      value: {
        _light: "{colors.neutral.100}",
        _dark: "{colors.neutral.850}",
      },
    },

    // Foreground/Text colors
    fg: {
      value: {
        _light: "{colors.neutral.900}",
        _dark: "{colors.neutral.0}",
      },
    },
    fgMuted: {
      value: {
        _light: "{colors.neutral.500}",
        _dark: "{colors.neutral.400}",
      },
    },
    fgSubtle: {
      value: {
        _light: "{colors.neutral.400}",
        _dark: "{colors.neutral.500}",
      },
    },

    // Border colors
    border: {
      value: {
        _light: "{colors.neutral.200}",
        _dark: "{colors.neutral.800}",
      },
    },
    borderMuted: {
      value: {
        _light: "{colors.neutral.100}",
        _dark: "{colors.neutral.850}",
      },
    },

    // Accent colors
    accent: {
      value: {
        _light: "{colors.brand.300}",
        _dark: "{colors.brand.300}",
      },
    },
    accentSubtle: {
      value: {
        _light: "{colors.brand.100}",
        _dark: "{colors.brand.900}",
      },
    },
  },
};
