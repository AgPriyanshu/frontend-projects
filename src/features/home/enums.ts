export const AppCategory = {
  Productivity: "Productivity",
  GIS: "GIS",
  MachineLearningAndAI: "ML / AI",
  Ecommerce: "Ecommerce",
} as const;

export type AppCategory = (typeof AppCategory)[keyof typeof AppCategory];
