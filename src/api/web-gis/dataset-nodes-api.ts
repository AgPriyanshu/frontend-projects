import { useMutation, useQuery } from "@tanstack/react-query";
import api from "api/api";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type { AxiosResponse } from "axios";
import type { DatasetNodeResponse, DatasetNodeUploadPayload } from "./types";

export const useDatasets = () => {
  return useQuery({
    queryKey: QueryKeys.datasets,
    queryFn: async () => {
      return await api.get<ApiResponse<DatasetNodeResponse[]>>(
        QueryKeys.datasets[0]
      );
    },
    select: (response: AxiosResponse<ApiResponse<DatasetNodeResponse[]>>) =>
      response.data,
  });
};

export const useUploadDatasets = () => {
  return useMutation({
    mutationFn: async (payload: DatasetNodeUploadPayload) => {
      const formData = new FormData();

      formData.append("name", payload.name);
      formData.append("type", payload.type);

      if (payload.parent) {
        formData.append("parent", payload.parent);
      }

      payload.files.forEach((file: File) => {
        formData.append("files", file);
      });

      return await api.post<ApiResponse<DatasetNodeResponse>>(
        QueryKeys.datasets[0],
        formData
      );
    },
  });
};

export const useDownloadDataset = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.get(QueryKeys.datasetDownload(id)[0], {
        responseType: "blob", // Important for file downloads
      });
      return response;
    },
    onSuccess: (response) => {
      // Extract filename from Content-Disposition header if available
      const contentDisposition = response.headers["content-disposition"];
      let filename = "download";

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};
