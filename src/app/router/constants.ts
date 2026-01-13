export const RoutePath = {
  Home: "/",
  Todo: "/todo",
  Map: "/map",
  Login: "/login",
  DeviceClassifier: "/device-classifier",
  Store: "/store",
} as const;

export type RoutePath = (typeof RoutePath)[keyof typeof RoutePath];
