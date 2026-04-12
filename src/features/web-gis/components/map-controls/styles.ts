export const controlButtonStyles = {
  size: "sm" as const,
  variant: "ghost" as const,
  color: "text.secondary",
  _hover: { bg: "bg.subtle", color: "text.primary" },
} as const;

export const panelStyles = {
  direction: "column" as const,
  p: "0.25rem",
  bg: "bg.panel",
  borderRadius: "xl",
  boxShadow: "md",
  borderWidth: "1px",
  borderColor: "border.subtle",
  backdropFilter: "blur(16px)",
} as const;
