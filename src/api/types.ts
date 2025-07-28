import { HttpStatusCode } from "axios";

export type ApiResponse<T = any> = {
  data: T;
  meta: {
    status: HttpStatusCode;
    success: boolean;
    message: string;
  };
};
