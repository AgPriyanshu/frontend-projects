import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import api from "../api";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type {
  AddStatPayload,
  CharacterListResponse,
  CharacterResponse,
  CreateCharacterPayload,
  StatResponse,
  UpdateCharacterPayload,
  UpdateStatPayload,
} from "./types";

export const useCharacters = () => {
  return useQuery({
    queryKey: QueryKeys.levelUpCharacters,
    queryFn: async () => {
      return await api.get<ApiResponse<CharacterListResponse>>(
        "/level-up/characters/"
      );
    },
    select: (response: AxiosResponse<ApiResponse<CharacterListResponse>>) =>
      response.data.data,
  });
};

export const useCreateCharacter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCharacterPayload) => {
      return await api.post<ApiResponse<CharacterResponse>>(
        "/level-up/characters/",
        payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.levelUpCharacters });
    },
  });
};

export const useUpdateCharacter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateCharacterPayload) => {
      return await api.patch<ApiResponse<CharacterResponse>>(
        `/level-up/characters/${id}/`,
        payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.levelUpCharacters });
    },
  });
};

export const useDeleteCharacter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/level-up/characters/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.levelUpCharacters });
    },
  });
};

export const useAddStat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ characterId, ...payload }: AddStatPayload) => {
      return await api.post<ApiResponse<StatResponse>>(
        `/level-up/characters/${characterId}/stats/`,
        payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.levelUpCharacters });
    },
  });
};

export const useUpdateStat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateStatPayload) => {
      return await api.patch<ApiResponse<StatResponse>>(
        `/level-up/stats/${id}/`,
        payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.levelUpCharacters });
    },
  });
};
