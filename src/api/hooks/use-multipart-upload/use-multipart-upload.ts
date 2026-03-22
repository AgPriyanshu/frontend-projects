import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import api from "../../api";
import type { ApiResponse } from "../../types";
import type {
  AbortMultipartPayload,
  CompleteMultipartPayload,
  MultipartInitiatePayloadBase,
  MultipartInitResponse,
  MultipartSignResponse,
  Part,
  SignMultipartPayload,
  UseMultipartUploadOptions,
} from "./types";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PARALLEL_UPLOADS = 4;

/**
 * Uploads a file through a multipart flow:
 * 1. initialize the upload and obtain an upload id + storage key
 * 2. sign and upload file parts in bounded parallel batches
 * 3. complete the multipart upload with the collected part metadata
 * 4. abort the multipart upload if any step fails after initialization
 *
 * The hook is transport-generic as long as the backend follows the same
 * multipart contract for init, sign, complete, and abort.
 */
export const useMultipartUpload = <
  TInitiatePayload extends MultipartInitiatePayloadBase,
  TCompleteResponse = unknown,
>(
  options: UseMultipartUploadOptions<TCompleteResponse>
) => {
  // States.
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const endpoints = options.endpoints;

  // Mutations.
  const initMutation = useMutation({
    mutationFn: async (payload: TInitiatePayload) => {
      const response = await api.post<ApiResponse<MultipartInitResponse>>(
        endpoints.init,
        payload
      );

      return response.data.data;
    },
  });

  const signMutation = useMutation({
    mutationFn: async (payload: SignMultipartPayload) => {
      const response = await api.post<ApiResponse<MultipartSignResponse>>(
        endpoints.sign,
        payload
      );
      return response.data.data;
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (payload: CompleteMultipartPayload) => {
      const response = await api.post<ApiResponse<TCompleteResponse>>(
        endpoints.complete,
        payload
      );
      return response.data.data;
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });

  const abortMutation = useMutation({
    mutationFn: async (payload: AbortMultipartPayload) => {
      await api.post(endpoints.abort, payload);
    },
  });

  /**
   * Uploads a single chunk after requesting a signed URL for its part number.
   * Returns the S3-compatible part metadata required by the complete step.
   */
  const uploadPart = async (
    file: File,
    fileSize: number,
    uploadId: string,
    key: string,
    partIndex: number
  ): Promise<Part> => {
    const partNumber = partIndex + 1;
    const start = partIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, fileSize);
    const chunk = file.slice(start, end);

    const multipartSignResponse = await signMutation.mutateAsync({
      upload_id: uploadId,
      key,
      part_number: partNumber,
    });

    const response = await axios.put(multipartSignResponse.url, chunk);
    const etag = response.headers["etag"]?.replace(/"/g, "");

    if (!etag) {
      console.warn(`Part ${partNumber} uploaded but ETag missing. CORS issue?`);
    }

    return { PartNumber: partNumber, ETag: etag || "" };
  };

  /**
   * Uploads all chunks with a small worker pool and preserves output order by
   * writing each resolved part into its original index.
   */
  const uploadParts = async (
    file: File,
    totalChunks: number,
    uploadId: string,
    key: string
  ): Promise<Part[]> => {
    const parts: Part[] = new Array(totalChunks);
    const partQueue = Array.from({ length: totalChunks }, (_, index) => index);
    let uploadedChunks = 0;

    const runUploadWorker = async (): Promise<void> => {
      while (partQueue.length > 0) {
        const partIndex = partQueue.shift();

        if (partIndex === undefined) {
          return;
        }

        parts[partIndex] = await uploadPart(
          file,
          file.size,
          uploadId,
          key,
          partIndex
        );

        uploadedChunks += 1;
        setProgress(Math.round((uploadedChunks / totalChunks) * 100));
      }
    };

    const workerCount = Math.min(MAX_PARALLEL_UPLOADS, totalChunks);

    await Promise.all(
      Array.from({ length: workerCount }, () => runUploadWorker())
    );

    return parts;
  };

  /**
   * Starts a multipart upload for the given file and completes it when all
   * parts are persisted. The caller defines the init payload structure and the
   * hook only injects the file name before calling the init endpoint.
   */
  const uploadFile = async (
    file: File,
    initPayload: Omit<TInitiatePayload, "name">
  ) => {
    setIsUploading(true);
    let uploadId = "";
    let key = "";

    try {
      setProgress(0);

      const multipartInitResponse = await initMutation.mutateAsync({
        name: file.name,
        ...initPayload,
      } as TInitiatePayload);

      uploadId = multipartInitResponse.uploadId;
      key = multipartInitResponse.key;

      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const parts = await uploadParts(file, totalChunks, uploadId, key);

      await completeMutation.mutateAsync({
        upload_id: uploadId,
        key,
        parts,
      });
    } catch (error) {
      console.error("Multipart upload failed:", error);

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
