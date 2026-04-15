export const RoutePath = {
  DeviceClassifier: "/device-classifier",
  Home: "/",
  LevelUp: "/level-up",
  Inventory: "/inventory",
  Login: "/login",
  Map: "/map",
  Store: "/store",
  Todo: "/todo",
  URLShortner: "/url-shortner",
  WhiteBoard: "/whiteboard",
} as const;

export type RoutePath = (typeof RoutePath)[keyof typeof RoutePath];
