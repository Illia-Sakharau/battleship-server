import { ROOMS_DB } from "..";
import { Room } from "../types";

export const startGame = (roomID: number) => {
  const room = ROOMS_DB.get(roomID);

  room?.roomUsers.forEach((user, i) => {
    user.ws.send(JSON.stringify({
      type: "start_game",
      data: JSON.stringify({
        ships: room.ships[i],
        currentPlayerIndex: i,
      }),
      id: 0,
    }))
  });

  turnUser(roomID);
}

export const turnUser = (roomID: number) => {
  const room = ROOMS_DB.get(roomID) as Room;
  const nextUserId = room.currentUser === 0 ? 1 : 0;

  room?.roomUsers.forEach((user, i) => {
    user.ws.send(JSON.stringify({
      type: "turn",
      data: JSON.stringify({
        currentPlayer: nextUserId,
      }),
      id: 0,
    }))
  });
}
