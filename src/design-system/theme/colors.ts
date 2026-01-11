export const colors = {
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
} as const;
