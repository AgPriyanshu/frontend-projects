export const QueryKeys = {
  todoList: ["/tasks"],
  datasets: ["/web-gis/datasets"],
  datasetDownload: (id: string) => [`/web-gis/datasets/${id}/download`],
  layers: ["/layers"],
  layer: (id: string) => [`/web-gis/layers/${id}`],
  notifications: ["/notifications"],
  notificationsBulk: ["/notifications/bulk"],
  notification: (id: string) => [`/notifications/${id}`],
};
