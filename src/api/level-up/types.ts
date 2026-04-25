export interface StatResponse {
  id: string;
  name: string;
  value: number;
  max: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterResponse {
  id: string;
  name: string;
  avatar: string;
  className: string;
  level: number;
  stats: StatResponse[];
  createdAt: string;
  updatedAt: string;
}

export type CharacterListResponse = CharacterResponse[];

export interface CreateCharacterPayload {
  name: string;
  avatar: string;
  className: string;
  level: number;
  stats: { name: string; value: number; max: number }[];
}

export interface UpdateCharacterPayload {
  id: string;
  name?: string;
  avatar?: string;
  className?: string;
  level?: number;
}

export interface AddStatPayload {
  characterId: string;
  name: string;
  value: number;
  max: number;
}

export interface UpdateStatPayload {
  id: string;
  value?: number;
  name?: string;
  max?: number;
  notes?: string;
}
