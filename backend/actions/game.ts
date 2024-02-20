import { ROOMS_DB } from "..";

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
}