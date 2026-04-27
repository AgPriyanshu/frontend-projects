export const RoutePath = {
  DeadStock: "/dead-stock",
  DeviceClassifier: "/device-classifier",
  Home: "/",
  Inventory: "/inventory",
  LevelUp: "/level-up",
  Login: "/login",
  Map: "/map",
  Store: "/store",
  Todo: "/todo",
  URLShortner: "/url-shortner",
  WhiteBoard: "/whiteboard",
} as const;

export type RoutePath = (typeof RoutePath)[keyof typeof RoutePath];
