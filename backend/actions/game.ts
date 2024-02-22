import { WebSocket } from 'ws';
import { ROOMS_DB, USERS_DB, WINNERS_DB } from "..";
import { Room, ShipCell, User } from "../types";
import { finishGameChecker } from "../utils/finishGameChecker";
import { killedShip } from "../utils/killedShip";
import { nextClosedCell } from "../utils/nextClosedCell";
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
  const room = ROOMS_DB.get(roomID) as Room;
  const winnerName = room.roomUsers[winnerID].name;
  const currentWins = WINNERS_DB.get(winnerName);

  room?.roomUsers.forEach((user, i) => {
    (USERS_DB.get(user.ws) as User).roomID = undefined;
    
    user.ws.send(JSON.stringify({
      type: "finish",
      data: JSON.stringify({
        winPlayer: winnerID,
      }),
      id: 0,
    }))
  });

  if (currentWins) {
    WINNERS_DB.set(winnerName, currentWins + 1)
  } else {
    WINNERS_DB.set(winnerName, 1)
  }
  
  ROOMS_DB.delete(roomID);
  updateWinnersForAll();
  updateRoomsForAll();
}

const updateWinnersForAll = () => {
  Array.from(USERS_DB.keys()).forEach((ws) => updateWinners(ws))
}

export const updateWinners = (ws: WebSocket) => {
  const preparedWinners = Array.from(WINNERS_DB.entries()).map((value) => ({ name: value[0], wins: value[1]}));
  ws.send(JSON.stringify({
    type: "update_winners",
    data: JSON.stringify(preparedWinners),
    id: 0,
  }))
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
    const isWater = typeof attackedCell === 'boolean';
    if (isWater) {
      room.boards[attackedPlayer][y][x] = true;
      turnUser(gameId, attackedPlayer);
      attackFeedback({ gameId, x, y, indexPlayer, status: 'miss' });
    } else {
      const attackedBoard = room.boards[attackedPlayer]
      attackedCell as ShipCell;
      attackedCell.value = true;
      const killedShipCor = killedShip({ board: attackedBoard, x, y });
      if (killedShipCor) {        
        // Attack around
        for (let i = killedShipCor.start.x - 1; i <= killedShipCor.end.x + 1; i++) {
          for (let j = killedShipCor.start.y - 1; j <= killedShipCor.end.y + 1; j++ ) {
            if (i >= 0 && i < 10 && j >= 0 && j < 10) {
              
              if (typeof attackedBoard[j][i] === 'boolean') {
                attackedBoard[j][i] = true;
                attackFeedback({ gameId, x: i, y: j, indexPlayer, status: 'miss' });
              } else {
                (attackedBoard[j][i] as ShipCell).value = true;
                attackFeedback({ gameId, x: i, y: j, indexPlayer, status: 'killed' });
              }
            }
          }
        }
        // Check finish
        if (finishGameChecker(attackedBoard)) {
          finishGame(gameId, indexPlayer)
        } else {
          turnUser(gameId, indexPlayer);
        }
      } else {
        attackFeedback({ gameId, x, y, indexPlayer, status: 'shot' });
        turnUser(gameId, indexPlayer);
      }
    }
  }
}

export const randomAttack = (props: Omit<attackProps, 'x' | 'y'>) => {
  const attackedPlayer = props.indexPlayer === 0 ? 1 : 0;
  const board = (ROOMS_DB.get(props.gameId) as Room).boards[attackedPlayer];
  const [x, y] = nextClosedCell(board);
  attack( {...props, x, y});
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
