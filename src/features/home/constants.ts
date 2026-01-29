import { RoutePath } from "app/router/constants";
import {
  FaLightbulb,
  FaMapMarkedAlt,
  FaRegListAlt,
  FaStoreAlt,
} from "react-icons/fa";
import { MdDevicesOther } from "react-icons/md";
import { AppCategory } from "./enums";
import type { AppCard } from "./types";

export const apps: AppCard[] = [
  {
    title: "Todo App",
    description: "Manage your tasks and stay organized",
    icon: FaRegListAlt,
    route: RoutePath.Todo,
    category: AppCategory.Productivity,
  },
  {
    title: "Web GIS",
    description: "Explore world and do geospatial analysis",
    icon: FaMapMarkedAlt,
    route: RoutePath.Map,
    category: AppCategory.GIS,
  },
  {
    title: "Device Classifier",
    description: "Classify your gadget image",
    icon: MdDevicesOther,
    route: RoutePath.DeviceClassifier,
    category: AppCategory.MachineLearningAndAI,
  },
  {
    title: "Store",
    description: "Browse and purchase products from our online store",
    icon: FaStoreAlt,
    route: RoutePath.Store,
    category: AppCategory.Ecommerce,
  },
  {
    title: "Live board",
    description: "Live Collaboration white board",
    icon: FaLightbulb,
    route: RoutePath.WhiteBoard,
    category: AppCategory.Productivity,
  },
];
