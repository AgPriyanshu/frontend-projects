export const QueryKeys = {
  todoList: ["/tasks/"],
  datasets: ["/datasets/"],
  datasetsDetailDownload: (id: string) => [`/datasets/${id}/download`],
};
