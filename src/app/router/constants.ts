export const RoutePath = {
  Home: "/",
  Todo: "/todo",
  Login: "/login",
} as const;

export type RoutePath = (typeof RoutePath)[keyof typeof RoutePath];
