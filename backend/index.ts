import { WebSocketServer, WebSocket } from 'ws';
import { Action, Room, Ship, User } from './types';
import { registration } from './actions/registration';
import { addUserToRoom, createRoom, updateRoomsForAll } from './actions/room';
import { attack, finishGame, randomAttack, startGame } from './actions/game';
import { fillBoard } from './utils/fillBoard';

export const USERS_DB = new Map<WebSocket, User>();
export const ROOMS_DB = new Map<number, Room>();
export const WINNERS_DB = new Map<string, number>();


const wss = new WebSocketServer({ port: 3000 }, () => {
  console.log('WS server started on ws://localhost:3000/');
});

wss.on('connection', (ws) => {
  ws.on('message', (req) => {
    const action = JSON.parse(req.toString()) as Action;

    switch (action.type) {
      case 'reg': {
        registration({ action, ws });
        break;
      }
      case 'create_room': {
        createRoom(ws);
        break;
      }
      case 'add_user_to_room': {
        const roomId = JSON.parse(action.data).indexRoom
        addUserToRoom(ws, roomId);
        break;
      }
      case 'add_ships': {
        const data = JSON.parse(action.data)
        const roomID = USERS_DB.get(ws)?.roomID as number;
        const room = ROOMS_DB.get(roomID) as Room;
        room.ships[data.indexPlayer] = data.ships
        room.boards[data.indexPlayer] = fillBoard(data.ships)
        
        if (room.ships[0] && room.ships[1]) {
          startGame(roomID);
        }
        break;
      }
      case 'attack': {
        const data = JSON.parse(action.data)
        attack(data);
        break;
      }
      case 'randomAttack': {
        const data = JSON.parse(action.data)
        randomAttack(data);
        break;
      }
      default: {
        console.log(action);     
        break;
      }
    }
  });
  
  ws.on('close', () => {
    const user = USERS_DB.get(ws);
    const roomID = USERS_DB.get(ws)?.roomID;
    if (typeof roomID === 'number') {
      const room = ROOMS_DB.get(roomID) as Room;
      const winnerID = room?.roomUsers.findIndex((roomUser) => roomUser.id !== user?.id);
      finishGame(roomID, winnerID);
    }
    USERS_DB.delete(ws)
  })

});

wss.on('close', (ws: WebSocket) => {
  wss.clients.forEach((client) => {
    client.close()
  })
})
