export const RoutePath = {
  Login: "/login",
} as const;

export type RoutePath = (typeof RoutePath)[keyof typeof RoutePath];
