/**
 * Raw color scales. These are the only place literal hex values may appear.
 * Never reference them from components — go through the semantic tokens in
 * `semantic-tokens.ts` so light/dark mode stays correct.
 */

const brand = {
  50: { value: "#FFF7ED" },
  100: { value: "#FFEDD5" },
  200: { value: "#FED7AA" },
  300: { value: "#FDBA74" },
  400: { value: "#FB923C" },
  500: { value: "#F97316" }, // Primary accent.
  600: { value: "#EA580C" },
  700: { value: "#C2410C" },
  800: { value: "#9A3412" },
  900: { value: "#7C2D12" },
  950: { value: "#431407" },
};

const neutral = {
  0: { value: "#FFFFFF" },
  50: { value: "#FAFAFA" },
  100: { value: "#F5F5F5" },
  200: { value: "#E5E5E5" },
  300: { value: "#D4D4D4" },
  400: { value: "#A3A3A3" },
  500: { value: "#737373" },
  600: { value: "#525252" },
  700: { value: "#404040" },
  800: { value: "#262626" },
  850: { value: "#1F1F1F" },
  900: { value: "#171717" },
  950: { value: "#0A0A0A" },
};

const yellow = {
  50: { value: "#FEFCE8" },
  100: { value: "#FEF9C3" },
  200: { value: "#FEF08A" },
  300: { value: "#FDE047" },
  400: { value: "#FACC15" },
  500: { value: "#EAB308" },
  600: { value: "#CA8A04" },
  700: { value: "#A16207" },
  800: { value: "#854D0E" },
  900: { value: "#713F12" },
  950: { value: "#422006" },
};

const green = {
  50: { value: "#F0FDF4" },
  100: { value: "#DCFCE7" },
  200: { value: "#BBF7D0" },
  300: { value: "#86EFAC" },
  400: { value: "#4ADE80" },
  500: { value: "#22C55E" },
  600: { value: "#16A34A" },
  700: { value: "#15803D" },
  800: { value: "#166534" },
  900: { value: "#14532D" },
  950: { value: "#052E16" },
};

const blue = {
  50: { value: "#EFF6FF" },
  100: { value: "#DBEAFE" },
  200: { value: "#BFDBFE" },
  300: { value: "#93C5FD" },
  400: { value: "#60A5FA" },
  500: { value: "#3B82F6" },
  600: { value: "#2563EB" },
  700: { value: "#1D4ED8" },
  800: { value: "#1E40AF" },
  900: { value: "#1E3A8A" },
  950: { value: "#172554" },
};

const red = {
  50: { value: "#FEF2F2" },
  100: { value: "#FEE2E2" },
  200: { value: "#FECACA" },
  300: { value: "#FCA5A5" },
  400: { value: "#F87171" },
  500: { value: "#EF4444" },
  600: { value: "#DC2626" },
  700: { value: "#B91C1C" },
  800: { value: "#991B1B" },
  900: { value: "#7F1D1D" },
  950: { value: "#450A0A" },
};

const purple = {
  50: { value: "#FAF5FF" },
  100: { value: "#F3E8FF" },
  200: { value: "#E9D5FF" },
  300: { value: "#D8B4FE" },
  400: { value: "#C084FC" },
  500: { value: "#A855F7" },
  600: { value: "#9333EA" },
  700: { value: "#7E22CE" },
  800: { value: "#6B21A8" },
  900: { value: "#581C87" },
  950: { value: "#3B0764" },
};

export const colors = {
  // Top-level alias so Chakra's `colorPalette="brand"` resolves.
  brand,

  palette: {
    brand,
    neutral,
    yellow,
    green,
    blue,
    red,
    purple,
  },
} as const;
