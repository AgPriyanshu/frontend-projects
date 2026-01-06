export const RoutePath = {
  Home: "/",
  Todo: "/todo",
  Map: "/map",
  Login: "/login",
} as const;

export type RoutePath = (typeof RoutePath)[keyof typeof RoutePath];
