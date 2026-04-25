export type Stat = {
  id: string;
  name: string;
  value: number;
  max: number;
  notes: string;
};

export type Character = {
  id: string;
  name: string;
  avatar: string;
  className: string;
  level: number;
  stats: Stat[];
};
