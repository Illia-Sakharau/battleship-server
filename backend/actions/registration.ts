import { WebSocket } from 'ws';
import { Action, User } from "../types";

type Props = {
  action: Action;
  users: Map<WebSocket, User>;
  ws: WebSocket;
}

export const registration = ({ action, users, ws }: Props) => {
  const data = JSON.parse(action.data);
  const user = users.set(ws, {
    id: users.size,
    ...data
  }).get(ws)
  
  ws.send(JSON.stringify({
    type: "reg",
    data: JSON.stringify(
      {
        name: user?.name,
        index: user?.id,
      }),
    id: action.id,
  }))
  
}