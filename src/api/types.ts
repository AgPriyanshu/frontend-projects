interface ApiResonseMeta {
  status_code: number;
  success: Boolean;
  message: string;
}

export interface ApiResponse<T> {
  meta: ApiResonseMeta;
  data: T;
}
