import type { Character } from "./types";

export const STAT_MAX = 5;

export const DEFAULT_STATS = [
  { name: "Health", value: 0, max: STAT_MAX },
  { name: "Career", value: 0, max: STAT_MAX },
  { name: "Fitness", value: 0, max: STAT_MAX },
  { name: "Finance", value: 0, max: STAT_MAX },
  { name: "Social", value: 0, max: STAT_MAX },
  { name: "Learning", value: 0, max: STAT_MAX },
];

export const INITIAL_CHARACTERS: Character[] = [
  {
    id: "1",
    name: "Priyanshu",
    avatar: "🥷",
    class: "Ninja",
    level: 5,
    stats: [
      { name: "Health", value: 2, max: STAT_MAX },
      { name: "Career", value: 3, max: STAT_MAX },
      { name: "Fitness", value: 1, max: STAT_MAX },
      { name: "Finance", value: 2, max: STAT_MAX },
      { name: "Social", value: 4, max: STAT_MAX },
      { name: "Learning", value: 3, max: STAT_MAX },
    ],
  },
  {
    id: "2",
    name: "Priyanshu 2",
    avatar: "🦇",
    class: "Dark Knight",
    level: 12,
    stats: [
      { name: "Health", value: 4, max: STAT_MAX },
      { name: "Career", value: 2, max: STAT_MAX },
      { name: "Fitness", value: 5, max: STAT_MAX },
      { name: "Finance", value: 3, max: STAT_MAX },
      { name: "Social", value: 1, max: STAT_MAX },
      { name: "Learning", value: 2, max: STAT_MAX },
    ],
  },
];
