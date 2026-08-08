/**
 * A `Tone` is the design-system vocabulary for "what does this state mean".
 * Features map their own domain status (job status, workload level, …) onto a
 * tone, then read the token trio below — so every status indicator in the app
 * resolves to the same colors and stays correct in dark mode.
 */
export type Tone =
  | "neutral"
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "danger";

export interface ToneTokens {
  /** Solid fill — badges, dots, progress bars. Pair with `text.onIntent`. */
  solid: string;
  /** Tinted background for a card or row in this state. */
  subtle: string;
  /** Border for a card or row in this state. */
  border: string;
  /** Text or icon in this state, placed on a normal surface. */
  fg: string;
}

export const toneTokens: Record<Tone, ToneTokens> = {
  neutral: {
    solid: "intent.neutral",
    subtle: "intent.neutralSubtle",
    border: "border.default",
    fg: "text.muted",
  },
  primary: {
    solid: "intent.primary",
    subtle: "intent.primarySubtle",
    border: "intent.primary",
    fg: "intent.primaryText",
  },
  info: {
    solid: "intent.info",
    subtle: "intent.infoSubtle",
    border: "intent.info",
    fg: "intent.info",
  },
  success: {
    solid: "intent.success",
    subtle: "intent.successSubtle",
    border: "intent.success",
    fg: "text.success",
  },
  warning: {
    solid: "intent.warning",
    subtle: "intent.warningSubtle",
    border: "intent.warning",
    fg: "text.warning",
  },
  danger: {
    solid: "intent.danger",
    subtle: "intent.dangerSubtle",
    border: "intent.danger",
    fg: "text.danger",
  },
};

/** Chakra `colorPalette` value for a tone, for Badge/Button `colorPalette`. */
export const toneColorPalette: Record<Tone, string> = {
  neutral: "gray",
  primary: "brand",
  info: "blue",
  success: "green",
  warning: "yellow",
  danger: "red",
};
