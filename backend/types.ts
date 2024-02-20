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

export type Ship = {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
}

export type Room = {
  id: number;
  roomUsers: (Omit<User, 'password'>)[];
  ships: Ship[][]
}
