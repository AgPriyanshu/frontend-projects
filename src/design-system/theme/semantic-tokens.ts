/**
 * Semantic tokens — the only color surface components should consume.
 *
 * Groups:
 *  - surface.*  Backgrounds.
 *  - text.*     Foreground text.
 *  - border.*   Borders and dividers.
 *  - intent.*   Meaningful fills (primary / success / warning / danger / info).
 *               Each intent has `X`, `XHover` and `XSubtle` (tinted background).
 *  - icon.*     Icon foregrounds.
 *  - object.*   Domain object types (file, folder, raster, vector).
 */
export const semanticTokens = {
  colors: {
    /* =======================
       SURFACES (backgrounds)
       ======================= */
    surface: {
      // The canvas. Recedes behind containers in both modes.
      page: {
        value: {
          _light: "{colors.palette.neutral.100}",
          _dark: "{colors.palette.neutral.950}",
        },
      },
      // Cards, panels and sheets — always reads as elevated above `page`.
      container: {
        value: {
          _light: "{colors.palette.neutral.0}",
          _dark: "{colors.palette.neutral.900}",
        },
      },
      // Inset areas inside a container (toolbars, table headers, wells).
      subtle: {
        value: {
          _light: "{colors.palette.neutral.50}",
          _dark: "{colors.palette.neutral.850}",
        },
      },
      hover: {
        value: {
          _light: "{colors.palette.neutral.100}",
          _dark: "{colors.palette.neutral.800}",
        },
      },
      disabled: {
        value: {
          _light: "{colors.palette.neutral.200}",
          _dark: "{colors.palette.neutral.850}",
        },
      },
      inverse: {
        value: {
          _light: "{colors.palette.neutral.900}",
          _dark: "{colors.palette.neutral.50}",
        },
      },
      // Scrim behind modals and dialogs. Identical in both modes by design.
      overlay: {
        value: "rgba(0, 0, 0, 0.48)",
      },
    },

    /* =======================
       TEXT
       ======================= */
    text: {
      primary: {
        value: {
          _light: "{colors.palette.neutral.900}",
          _dark: "{colors.palette.neutral.0}",
        },
      },
      secondary: {
        value: {
          _light: "{colors.palette.neutral.700}",
          _dark: "{colors.palette.neutral.200}",
        },
      },
      muted: {
        value: {
          _light: "{colors.palette.neutral.500}",
          _dark: "{colors.palette.neutral.400}",
        },
      },
      disabled: {
        value: {
          _light: "{colors.palette.neutral.400}",
          _dark: "{colors.palette.neutral.600}",
        },
      },
      inverse: {
        value: {
          _light: "{colors.palette.neutral.0}",
          _dark: "{colors.palette.neutral.900}",
        },
      },
      success: {
        value: {
          _light: "{colors.palette.green.700}",
          _dark: "{colors.palette.green.400}",
        },
      },
      warning: {
        value: {
          _light: "{colors.palette.yellow.700}",
          _dark: "{colors.palette.yellow.400}",
        },
      },
      danger: {
        value: {
          _light: "{colors.palette.red.700}",
          _dark: "{colors.palette.red.400}",
        },
      },
      // Text placed on top of any `intent.*` fill.
      onIntent: {
        value: "{colors.palette.neutral.0}",
      },
    },

    /* =======================
       BORDERS
       ======================= */
    border: {
      default: {
        value: {
          _light: "{colors.palette.neutral.300}",
          _dark: "{colors.palette.neutral.800}",
        },
      },
      subtle: {
        value: {
          _light: "{colors.palette.neutral.200}",
          _dark: "{colors.palette.neutral.850}",
        },
      },
      muted: {
        value: {
          _light: "{colors.palette.neutral.200}",
          _dark: "{colors.palette.neutral.850}",
        },
      },
      hover: {
        value: {
          _light: "{colors.palette.neutral.400}",
          _dark: "{colors.palette.neutral.700}",
        },
      },
      disabled: {
        value: {
          _light: "{colors.palette.neutral.300}",
          _dark: "{colors.palette.neutral.800}",
        },
      },
      focus: {
        value: "{colors.intent.primary}",
      },
      // Outline for a selected node, card or row.
      selected: {
        value: "{colors.intent.primary}",
      },
    },

    /* =======================
       INTENT (meaning)
       ======================= */
    intent: {
      // Un-emphasised fill (idle / pending states). Carries `text.onIntent`.
      neutral: {
        value: {
          _light: "{colors.palette.neutral.500}",
          _dark: "{colors.palette.neutral.600}",
        },
      },
      neutralHover: {
        value: {
          _light: "{colors.palette.neutral.600}",
          _dark: "{colors.palette.neutral.500}",
        },
      },
      neutralSubtle: {
        value: {
          _light: "{colors.palette.neutral.100}",
          _dark: "{colors.palette.neutral.850}",
        },
      },

      // The accent fill. Brand 500/600 is the actual accent — the darker 700+
      // steps read as muddy brown and belong to hover/active only.
      primary: {
        value: {
          _light: "{colors.palette.brand.600}",
          _dark: "{colors.palette.brand.500}",
        },
      },
      primaryHover: {
        value: {
          _light: "{colors.palette.brand.700}",
          _dark: "{colors.palette.brand.400}",
        },
      },
      primaryActive: {
        value: {
          _light: "{colors.palette.brand.800}",
          _dark: "{colors.palette.brand.300}",
        },
      },
      // Accent applied to text or icons sitting on a surface. Darker than
      // `primary` in light mode so small text keeps enough contrast.
      primaryText: {
        value: {
          _light: "{colors.palette.brand.700}",
          _dark: "{colors.palette.brand.400}",
        },
      },
      primarySubtle: {
        value: {
          _light: "{colors.palette.brand.50}",
          _dark: "{colors.palette.brand.950}",
        },
      },

      success: {
        value: {
          _light: "{colors.palette.green.600}",
          _dark: "{colors.palette.green.500}",
        },
      },
      successHover: {
        value: {
          _light: "{colors.palette.green.700}",
          _dark: "{colors.palette.green.600}",
        },
      },
      successSubtle: {
        value: {
          _light: "{colors.palette.green.50}",
          _dark: "{colors.palette.green.950}",
        },
      },

      warning: {
        value: {
          _light: "{colors.palette.yellow.600}",
          _dark: "{colors.palette.yellow.500}",
        },
      },
      warningHover: {
        value: {
          _light: "{colors.palette.yellow.700}",
          _dark: "{colors.palette.yellow.600}",
        },
      },
      warningSubtle: {
        value: {
          _light: "{colors.palette.yellow.50}",
          _dark: "{colors.palette.yellow.950}",
        },
      },

      danger: {
        value: {
          _light: "{colors.palette.red.600}",
          _dark: "{colors.palette.red.500}",
        },
      },
      dangerHover: {
        value: {
          _light: "{colors.palette.red.700}",
          _dark: "{colors.palette.red.600}",
        },
      },
      dangerSubtle: {
        value: {
          _light: "{colors.palette.red.50}",
          _dark: "{colors.palette.red.950}",
        },
      },

      info: {
        value: {
          _light: "{colors.palette.blue.600}",
          _dark: "{colors.palette.blue.500}",
        },
      },
      infoHover: {
        value: {
          _light: "{colors.palette.blue.700}",
          _dark: "{colors.palette.blue.600}",
        },
      },
      infoSubtle: {
        value: {
          _light: "{colors.palette.blue.50}",
          _dark: "{colors.palette.blue.950}",
        },
      },
    },

    /* =======================
       ICONS
       ======================= */
    icon: {
      primary: {
        value: {
          _light: "{colors.palette.neutral.700}",
          _dark: "{colors.palette.neutral.200}",
        },
      },
      muted: {
        value: {
          _light: "{colors.palette.neutral.500}",
          _dark: "{colors.palette.neutral.400}",
        },
      },
      onIntent: {
        value: "{colors.palette.neutral.0}",
      },
      success: {
        value: "{colors.intent.success}",
      },
      successHover: {
        value: "{colors.intent.successHover}",
      },
      warning: {
        value: "{colors.intent.warning}",
      },
      danger: {
        value: "{colors.intent.danger}",
      },
      dangerHover: {
        value: "{colors.intent.dangerHover}",
      },
    },

    /* =======================
       DOMAIN OBJECTS
       ======================= */
    object: {
      file: {
        value: "{colors.palette.blue.500}",
      },
      folder: {
        value: "{colors.palette.yellow.500}",
      },
      raster: {
        value: "{colors.palette.green.500}",
      },
      vector: {
        value: "{colors.palette.blue.500}",
      },
      operation: {
        value: "{colors.palette.purple.500}",
      },
    },
  },
};
