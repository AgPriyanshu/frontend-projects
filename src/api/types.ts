interface ApiResonseMeta {
  status_code: number;
  success: boolean;
  message: string;
}

export interface ApiResponse<T = any> {
  meta: ApiResonseMeta;
  data: T;
}
