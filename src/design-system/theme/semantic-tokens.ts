export const semanticTokens = {
  colors: {
    // Brand color palette (Chakra UI standard)
    brand: {
      solid: {
        value: {
          _light: "{colors.brand.600}",
          _dark: "{colors.brand.500}",
        },
      },
      contrast: {
        value: {
          _light: "{colors.neutral.0}",
          _dark: "{colors.neutral.0}",
        },
      },
      fg: {
        value: {
          _light: "{colors.brand.700}",
          _dark: "{colors.brand.300}",
        },
      },
      muted: {
        value: {
          _light: "{colors.brand.100}",
          _dark: "{colors.brand.900}",
        },
      },
      subtle: {
        value: {
          _light: "{colors.brand.200}",
          _dark: "{colors.brand.800}",
        },
      },
      emphasized: {
        value: {
          _light: "{colors.brand.300}",
          _dark: "{colors.brand.700}",
        },
      },
      focusRing: {
        value: {
          _light: "{colors.brand.500}",
          _dark: "{colors.brand.400}",
        },
      },
    },

    // Primary brand colors (legacy - keeping for backward compatibility)
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

    // Status colors - Success
    success: {
      value: {
        _light: "#16a34a", // green.600
        _dark: "#22c55e", // green.500
      },
    },
    successHover: {
      value: {
        _light: "#15803d", // green.700
        _dark: "#16a34a", // green.600
      },
    },
    successActive: {
      value: {
        _light: "#166534", // green.800
        _dark: "#15803d", // green.700
      },
    },

    // Status colors - Error
    error: {
      value: {
        _light: "#dc2626", // red.600
        _dark: "#ef4444", // red.500
      },
    },
    errorHover: {
      value: {
        _light: "#b91c1c", // red.700
        _dark: "#dc2626", // red.600
      },
    },
    errorActive: {
      value: {
        _light: "#991b1b", // red.800
        _dark: "#b91c1c", // red.700
      },
    },

    // Status colors - Warning
    warning: {
      value: {
        _light: "#d97706", // amber.600
        _dark: "#f59e0b", // amber.500
      },
    },
    warningHover: {
      value: {
        _light: "#b45309", // amber.700
        _dark: "#d97706", // amber.600
      },
    },
    warningActive: {
      value: {
        _light: "#92400e", // amber.800
        _dark: "#b45309", // amber.700
      },
    },

    // Status colors - Info
    info: {
      value: {
        _light: "#2563eb", // blue.600
        _dark: "#3b82f6", // blue.500
      },
    },
    infoHover: {
      value: {
        _light: "#1d4ed8", // blue.700
        _dark: "#2563eb", // blue.600
      },
    },
    infoActive: {
      value: {
        _light: "#1e40af", // blue.800
        _dark: "#1d4ed8", // blue.700
      },
    },

    // Icon colors
    icon: {
      value: {
        _light: "{colors.neutral.700}",
        _dark: "{colors.neutral.200}",
      },
    },
    iconMuted: {
      value: {
        _light: "{colors.neutral.500}",
        _dark: "{colors.neutral.400}",
      },
    },
    iconOnPrimary: {
      value: {
        _light: "{colors.neutral.0}",
        _dark: "{colors.neutral.0}",
      },
    },

    // Inverse background (opposite of main background)
    bgInverse: {
      value: {
        _light: "{colors.neutral.950}",
        _dark: "{colors.neutral.0}",
      },
    },
  },
};
