export const QueryKeys = {
  todoList: ["/tasks/"],
  datasets: ["/datasets/"],
  datasetsDetailDownload: (id: string) => [`/datasets/${id}/download`],
  layers: ["/layers/"],
  layerDetail: (id: string) => [`/layers/${id}/`],
};
