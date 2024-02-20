export type User = {
  id: number;
  name: string;
  password: string;
  roomID?: number; 
}

export type Action = {
  type: string;
  data: string;
  id: number;
}

export type Room = {
  id: number;
  roomUsers: Omit<User, 'password'>[];
}
