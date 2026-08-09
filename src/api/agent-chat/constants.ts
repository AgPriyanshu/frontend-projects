export const UIActionType = { Navigate: "navigate" } as const;
export type UIActionType = (typeof UIActionType)[keyof typeof UIActionType];
