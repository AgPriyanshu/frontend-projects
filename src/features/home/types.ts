import type { AppCategory } from "./enums";

export interface AppCard {
  title: string;
  description: string;
  icon: React.ComponentType;
  route: string;
  category: AppCategory;
}
