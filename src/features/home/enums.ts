export const AppCategory = {
  Ecommerce: "Ecommerce",
  GIS: "GIS",
  MachineLearningAndAI: "ML / AI",
  Productivity: "Productivity",
  Business: "Business",
} as const;

export type AppCategory = (typeof AppCategory)[keyof typeof AppCategory];
