import type { ApiResponse } from "../types";

// Responses.
export type LoginResponseData = { token: string };

// Payloads.
export type LoginPayload = { username: string; password: string };
