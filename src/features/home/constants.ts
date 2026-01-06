import { RoutePath } from "app/router/constants";
import { FaMapMarkedAlt, FaRegListAlt } from "react-icons/fa";
import type { AppCard } from "./types";
export const apps: AppCard[] = [
  {
    title: "Todo App",
    description: "Manage your tasks and stay organized",
    icon: FaRegListAlt,
    route: RoutePath.Todo,
    category: "Productivity",
  },
  {
    title: "Map App",
    description: "Explore locations and navigate",
    icon: FaMapMarkedAlt,
    route: RoutePath.Map,
    category: "Navigation",
  },
];
