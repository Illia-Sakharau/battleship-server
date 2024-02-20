import { WebSocket } from 'ws';

export type User = {
  id: number;
  ws: WebSocket;
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
