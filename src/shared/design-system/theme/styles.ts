export const styles = {
  global: {
    body: {
      bg: "bg",
      color: "textPrimary",
      fontFamily: "Inter, system-ui, sans-serif",
      lineHeight: "base",
    },

    "*::selection": {
      bg: "brand.500",
      color: "white",
    },

    a: {
      color: "brand.500",
      _hover: {
        textDecoration: "underline",
      },
    },

    ":focus-visible": {
      outline: "2px solid",
      outlineColor: "brand.500",
      outlineOffset: "2px",
    },
  },
};
