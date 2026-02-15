export const QueryKeys = {
  todoList: ["/tasks"],
  datasets: ["/web-gis/datasets"],
  datasetDownload: (id: string) => [`/web-gis/datasets/${id}/download`],
  // Layers.
  layer: (id: string) => [`/web-gis/layers/${id}`],
  layers: ["/web-gis/layers"],
  // Notifications.
  notification: (id: string) => [`/notifications/${id}`],
  notifications: ["/notifications"],
  notificationsBulk: ["/notifications/bulk"],
};
