interface ApiResonseMeta {
  status_code: number;
  success: Boolean;
  message: string;
}

export interface ApiResponse<T = any> {
  meta: ApiResonseMeta;
  data: T;
}
