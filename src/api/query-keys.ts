export const QueryKeys = {
  // Todo List.
  todoList: ["/tasks"],
  // Datasets.
  datasets: ["/web-gis/datasets"],
  datasetDownload: (id: string) => [`/web-gis/datasets/${id}/download`],
  datasetTiles: (id: string) => [
    `/web-gis/datasets/${id}/tiles/{z}/{x}/{y}.png`,
  ],
  datasetVectorTiles: (id: string) => [
    `/web-gis/datasets/${id}/vector-tiles/{z}/{x}/{y}.mvt`,
  ],
  // Features.
  features: (datasetId: string) => [`/web-gis/features/?dataset=${datasetId}`],
  // Layers.
  layer: (id: string) => [`/web-gis/layers/${id}`],
  layers: ["/web-gis/layers"],
  // Notifications.
  notification: (id: string) => [`/notifications/${id}`],
  notifications: ["/notifications"],
  notificationsBulk: ["/notifications/bulk"],
  // URL Shortner.
  urls: ["/url-shortner/urls/"],
  // Chat.
  chatSessions: ["/ai/chat-sessions"],
  llms: ["/ai/llms"],
  // Processing jobs.
  processingJobs: ["/web-gis/processing"],
  processingTools: ["/web-gis/processing/tools"],
};
