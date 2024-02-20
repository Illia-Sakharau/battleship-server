import { ROOMS_DB } from "..";
import { Room } from "../types";
import { updateRoomsForAll } from "./room";

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

export const finishGame = (roomID: number, winnerID: number) => {
  const room = ROOMS_DB.get(roomID);

  room?.roomUsers.forEach((user, i) => {
    user.ws.send(JSON.stringify({
      type: "finish",
      data: JSON.stringify({
        winPlayer: winnerID,
      }),
      id: 0,
    }))
  });
  
  ROOMS_DB.delete(roomID);
  updateRoomsForAll();
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
