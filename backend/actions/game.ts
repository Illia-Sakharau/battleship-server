import { ROOMS_DB } from "..";
import { Room, ShipCell } from "../types";
import { updateRoomsForAll } from "./room";

export const startGame = (roomID: number) => {
  const room = ROOMS_DB.get(roomID) as Room;
  const currentPlayerId = 0;

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
  turnUser(roomID, currentPlayerId);
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

export const turnUser = (roomID: number, nextUserId: number) => {
  const room = ROOMS_DB.get(roomID) as Room;
  room.currentUser = nextUserId;
  
  room?.roomUsers.forEach((user) => {
    user.ws.send(JSON.stringify({
      type: "turn",
      data: JSON.stringify({
        currentPlayer: nextUserId,
      }),
      id: 0,
    }))
  });
}

type attackProps = {
  gameId: number;
  x: number;
  y: number;
  indexPlayer: number;
}

export const attack = ({ gameId, x, y, indexPlayer }: attackProps) => {
  const room = ROOMS_DB.get(gameId) as Room;
  const attackedPlayer = indexPlayer === 0 ? 1 : 0;
  const attackedCell = room.boards[attackedPlayer][y][x];
  if (room.currentUser === indexPlayer) {
    if (typeof attackedCell === 'boolean') {
      room.boards[attackedPlayer][y][x] = true;
      turnUser(gameId, attackedPlayer);
      attackFeedback({ gameId, x, y, indexPlayer, status: 'miss' });
    } else {
      attackedCell as ShipCell;
      attackedCell.value = true;
      turnUser(gameId, indexPlayer);
      attackFeedback({ gameId, x, y, indexPlayer, status: 'shot' });
    }
  }
}

const attackFeedback = ({ gameId, x, y, indexPlayer, status }: attackProps & {status: string}) => {
  const room = ROOMS_DB.get(gameId) as Room;
  room?.roomUsers.forEach((user) => {
    user.ws.send(JSON.stringify({
      type: "attack",
      data: JSON.stringify({
        position: {x, y},
        currentPlayer: indexPlayer,
        status
      }),
      id: 0,
    }))
  });
}
