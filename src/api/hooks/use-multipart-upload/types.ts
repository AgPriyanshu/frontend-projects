export interface MultipartInitResponse {
  uploadId: string;
  key: string;
}

export interface MultipartSignResponse {
  url: string;
}

export interface MultipartUploadEndpoints {
  init: string;
  sign: string;
  complete: string;
  abort: string;
}

export interface UseMultipartUploadOptions<TCompleteResponse = unknown> {
  endpoints: MultipartUploadEndpoints;
  onSuccess?: (data: TCompleteResponse) => void;
  onError?: (error: unknown) => void;
}

export type MultipartInitiatePayloadBase = {
  name: string;
};

export type SignMultipartPayload = {
  upload_id: string;
  key: string;
  part_number: number;
};

export type CompleteMultipartPayload = {
  upload_id: string;
  key: string;
  parts: { ETag: string; PartNumber: number }[];
};

export type AbortMultipartPayload = { uploadId: string; key: string };

export type Part = { ETag: string; PartNumber: number };
