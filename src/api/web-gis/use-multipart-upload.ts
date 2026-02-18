import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
// Assuming api is exported as default or named from parent directory
import api from "../api";

interface MultipartCompleteResponse {
  status: string;
  dataset: any;
}

interface UseMultipartUploadOptions {
  onSuccess?: (data: MultipartCompleteResponse) => void;
  onError?: (error: any) => void;
}

export const useMultipartUpload = (options?: UseMultipartUploadOptions) => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const initMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      type: string;
      parent: string | null;
    }) => {
      // Use the correct endpoint path. Ensure it matches your API routing.
      // Assuming /web-gis/api/dataset-nodes/ based on previous context.
      const response = await api.post<any>(
        "/web-gis/datasets/?multipart=init",
        payload
      );
      // API returns struct { data: T, meta: ... }
      return response.data.data;
    },
  });

  const signMutation = useMutation({
    mutationFn: async (payload: {
      upload_id: string;
      key: string;
      part_number: number;
    }) => {
      console.log("Signing payload:", payload);
      const response = await api.post<any>(
        "/web-gis/datasets/?multipart=sign",
        payload
      );
      return response.data.data;
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (payload: {
      upload_id: string;
      key: string;
      parts: { ETag: string; PartNumber: number }[];
    }) => {
      const response = await api.post<any>(
        "/web-gis/datasets/?multipart=complete",
        payload
      );
      return response.data.data;
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });

  const abortMutation = useMutation({
    mutationFn: async (payload: { uploadId: string; key: string }) => {
      await api.post("/web-gis/datasets/?multipart=abort", payload);
    },
  });

  const uploadFile = async (file: File, parentId: string | null) => {
    setIsUploading(true);
    let uploadId = "";
    let key = "";

    try {
      setProgress(0);

      // 1. Initiate Upload
      const initRes = await initMutation.mutateAsync({
        name: file.name,
        type: "dataset",
        parent: parentId,
      });
      // Backend returns camelCase keys from Response({...}) in _multipart_init
      uploadId = initRes.uploadId;
      key = initRes.key;
      console.log("Init response:", initRes, "Mapped:", { uploadId, key });

      // 2. Upload Chunks
      const chunkSize = 5 * 1024 * 1024; // 5MB
      const totalChunks = Math.ceil(file.size / chunkSize);
      const parts: { ETag: string; PartNumber: number }[] = [];

      // Sequential upload for reliability (can be parallelized later)
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        const partNumber = i + 1;

        // Get Presigned URL
        const signRes = await signMutation.mutateAsync({
          upload_id: uploadId,
          key,
          part_number: partNumber,
        });

        // Upload to S3 directly (bypass API axios interceptors)
        const response = await axios.put(signRes.url, chunk, {
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
        });

        // Extract ETag
        // S3 ETag is usually surrounded by quotes.
        const etag = response.headers["etag"]?.replace(/"/g, "");
        if (!etag) {
          console.warn(
            `Part ${partNumber} uploaded but ETag missing. CORS issue?`
          );
        }

        parts.push({ PartNumber: partNumber, ETag: etag || "" });

        // Update progress
        setProgress(Math.round(((i + 1) / totalChunks) * 100));
      }

      // 3. Complete Upload
      await completeMutation.mutateAsync({
        upload_id: uploadId,
        key,
        parts,
      });
    } catch (error) {
      console.error("Multipart upload failed:", error);
      // Attempt to abort if we have an uploadId
      if (uploadId && key) {
        try {
          console.log("Aborting upload...", { uploadId, key });
          await abortMutation.mutateAsync({ uploadId, key });
        } catch (abortErr) {
          console.warn("Failed to abort upload:", abortErr);
        }
      }
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    progress,
    isPending: isUploading,
    error: initMutation.error || signMutation.error || completeMutation.error,
    reset: () => {
      initMutation.reset();
      signMutation.reset();
      completeMutation.reset();
      setProgress(0);
      setIsUploading(false);
    },
  };
};
