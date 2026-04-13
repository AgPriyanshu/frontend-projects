export type Stat = {
  name: string;
  value: number;
  max: number;
};

export type Character = {
  id: string;
  name: string;
  avatar: string;
  class: string;
  level: number;
  stats: Stat[];
};
