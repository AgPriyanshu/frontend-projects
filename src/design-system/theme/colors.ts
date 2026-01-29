export const colors = {
  palette: {
    brand: {
      50: { value: "#FFF7ED" },
      100: { value: "#FFEDD5" },
      200: { value: "#FED7AA" },
      300: { value: "#FDBA74" }, // soft amber
      400: { value: "#FB923C" },
      500: { value: "#F97316" }, // primary accent
      600: { value: "#EA580C" }, // hover / active
      700: { value: "#C2410C" },
      800: { value: "#9A3412" },
      900: { value: "#7C2D12" },
    },

    neutral: {
      0: { value: "#FFFFFF" }, // primary text on dark
      50: { value: "#F9FAFB" },
      100: { value: "#F3F4F6" },
      200: { value: "#E5E7EB" },
      300: { value: "#D1D5DB" },
      400: { value: "#9CA3AF" }, // secondary / muted text
      500: { value: "#6B7280" },
      600: { value: "#4B5563" },
      700: { value: "#374151" },
      800: { value: "#1F2937" },
      850: { value: "#171717" }, // elevated surfaces - true neutral
      900: { value: "#0F0F0F" }, // cards / surfaces - true neutral
      950: { value: "#050505" }, // app background - near black
    },

    yellow: {
      50: { value: "#FEFCE8" },
      100: { value: "#FEF9C3" },
      200: { value: "#FEF08A" },
      300: { value: "#FDE047" },
      400: { value: "#FACC15" },
      500: { value: "#EAB308" }, // primary yellow
      600: { value: "#CA8A04" },
      700: { value: "#A16207" },
      800: { value: "#854D0E" },
      900: { value: "#713F12" },
      950: { value: "#422006" },
    },

    blue: {
      50: { value: "#EFF6FF" },
      100: { value: "#DBEAFE" },
      200: { value: "#BFDBFE" },
      300: { value: "#93C5FD" },
      400: { value: "#60A5FA" },
      500: { value: "#3B82F6" }, // primary blue
      600: { value: "#2563EB" },
      700: { value: "#1D4ED8" },
      800: { value: "#1E40AF" },
      900: { value: "#1E3A8A" },
      950: { value: "#172554" },
    },

    red: {
      50: { value: "#FEF2F2" },
      100: { value: "#FEE2E2" },
      200: { value: "#FECACA" },
      300: { value: "#FCA5A5" },
      400: { value: "#F87171" },
      500: { value: "#EF4444" }, // primary red
      600: { value: "#DC2626" },
      700: { value: "#B91C1C" },
      800: { value: "#991B1B" },
      900: { value: "#7F1D1D" },
      950: { value: "#450A0A" },
    },
  },
} as const;
