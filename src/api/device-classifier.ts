import type { APIResponse } from "@/features/device-classifier/types";
import { api } from "./api";

export const deviceClassifierApi = {
  classifyImage: async (image: File): Promise<APIResponse> => {
    const formData = new FormData();
    formData.append("device", image);
    const response = await api.post("/device-classifier/classify/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  },
};
