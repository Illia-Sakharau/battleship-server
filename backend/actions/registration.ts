import { WebSocket } from 'ws';
import { Action, User } from "../types";

type Props = {
  action: Action;
  users: Map<WebSocket, User>;
  ws: WebSocket;
}

let idCounter = 0;

export const registration = ({ action, users, ws }: Props) => {
  const data = JSON.parse(action.data);

  if (data.name.length < 5 || data.password.length < 5) {
    ws.send(JSON.stringify({
      type: "reg",
      data: JSON.stringify(
        {
          error: true,
          errorText: 'Invalid name or password',
        }),
      id: action.id,
    }))
    return;
  }
  const hasUserName = !Array.from(users.values()).every((user) => !(user.name === data.name))
  if (hasUserName) {
    ws.send(JSON.stringify({
      type: "reg",
      data: JSON.stringify(
        {
          error: true,
          errorText: 'A user with this name exists',
        }),
      id: action.id,
    }))
    return;
  }

  const user = users.set(ws, {
    id: idCounter++,
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