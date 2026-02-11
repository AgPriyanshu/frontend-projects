export const AppName = {
  Auth: "authApp",
  Blogs: "blogsApp",
  Weather: "weatherApp",
  Todo: "todoApp",
  ExpenseTracker: "expenseTrackerApp",
  NoteMarkdown: "noteMarkdownApp",
  UrlShortner: "urlShortnerApp",
  DeviceClassifier: "deviceClassifier",
  Ecommerce: "ecommerceApp",
  WebGis: "webGisApp",
  Main: "backend_projects",
} as const;

export type AppName = (typeof AppName)[keyof typeof AppName];

export interface Notification {
  id: string;
  appName: AppName;
  content: string;
  seen: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UpdateNotificationsPayload = Pick<Notification, "seen"> & {
  ids: string[];
};
