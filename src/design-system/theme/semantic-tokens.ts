export const semanticTokens = {
  colors: {
    /* =======================
       SURFACES (backgrounds)
       ======================= */
    surface: {
      page: {
        value: {
          _light: "{colors.neutral.0}",
          _dark: "{colors.neutral.950}",
        },
      },
      container: {
        value: {
          _light: "{colors.neutral.50}",
          _dark: "{colors.neutral.900}",
        },
      },
      subtle: {
        value: {
          _light: "{colors.neutral.100}",
          _dark: "{colors.neutral.850}",
        },
      },
      hover: {
        value: {
          _light: "{colors.neutral.100}",
          _dark: "{colors.neutral.800}",
        },
      },
      disabled: {
        value: {
          _light: "{colors.neutral.100}",
          _dark: "{colors.neutral.850}",
        },
      },
      inverse: {
        value: {
          _light: "{colors.neutral.950}",
          _dark: "{colors.neutral.0}",
        },
      },
    },

    /* =======================
       TEXT
       ======================= */
    text: {
      primary: {
        value: {
          _light: "{colors.neutral.900}",
          _dark: "{colors.neutral.0}",
        },
      },
      secondary: {
        value: {
          _light: "{colors.neutral.700}",
          _dark: "{colors.neutral.200}",
        },
      },
      muted: {
        value: {
          _light: "{colors.neutral.500}",
          _dark: "{colors.neutral.400}",
        },
      },
      disabled: {
        value: {
          _light: "{colors.neutral.400}",
          _dark: "{colors.neutral.600}",
        },
      },
      inverse: {
        value: {
          _light: "{colors.neutral.0}",
          _dark: "{colors.neutral.900}",
        },
      },
      onIntent: {
        value: "{colors.neutral.0}",
      },
    },

    /* =======================
       BORDERS
       ======================= */
    border: {
      default: {
        value: {
          _light: "{colors.neutral.200}",
          _dark: "{colors.neutral.800}",
        },
      },
      muted: {
        value: {
          _light: "{colors.neutral.100}",
          _dark: "{colors.neutral.850}",
        },
      },
      hover: {
        value: {
          _light: "{colors.neutral.300}",
          _dark: "{colors.neutral.700}",
        },
      },
      disabled: {
        value: {
          _light: "{colors.neutral.200}",
          _dark: "{colors.neutral.800}",
        },
      },
      focus: {
        value: "{colors.brand.500}",
      },
    },

    /* =======================
       INTENT (meaning)
       ======================= */
    intent: {
      primary: {
        value: {
          _light: "{colors.brand.600}",
          _dark: "{colors.brand.500}",
        },
      },
      primaryHover: {
        value: {
          _light: "{colors.brand.700}",
          _dark: "{colors.brand.600}",
        },
      },
      primaryActive: {
        value: {
          _light: "{colors.brand.800}",
          _dark: "{colors.brand.700}",
        },
      },

      success: {
        value: {
          _light: "#16a34a",
          _dark: "#22c55e",
        },
      },
      successHover: {
        value: {
          _light: "#15803d",
          _dark: "#16a34a",
        },
      },

      error: {
        value: {
          _light: "#dc2626",
          _dark: "#ef4444",
        },
      },
      errorHover: {
        value: {
          _light: "#b91c1c",
          _dark: "#dc2626",
        },
      },

      warning: {
        value: {
          _light: "#d97706",
          _dark: "#f59e0b",
        },
      },

      info: {
        value: {
          _light: "#2563eb",
          _dark: "#3b82f6",
        },
      },
    },

    /* =======================
       ICONS
       ======================= */
    icon: {
      primary: {
        value: {
          _light: "{colors.neutral.700}",
          _dark: "{colors.neutral.200}",
        },
      },
      muted: {
        value: {
          _light: "{colors.neutral.500}",
          _dark: "{colors.neutral.400}",
        },
      },
      onIntent: {
        value: "{colors.neutral.0}",
      },
    },
  },
};
