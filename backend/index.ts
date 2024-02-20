import { WebSocketServer, WebSocket } from 'ws';
import { Action, Room, User } from './types';
import { registration } from './actions/registration';
import { createRoom, updateRoomsForAll } from './actions/room';

export const USERS_DB = new Map<WebSocket, User>();
export const ROOMS_DB = new Map<number, Room>();

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
      default: {
        console.log(action);        
        break;
      }
    }
  });
  
  ws.on('close', () => {
    const roomID = USERS_DB.get(ws)?.roomID;
    if (typeof roomID === 'number') {
      ROOMS_DB.delete(roomID);
      updateRoomsForAll();
    }
    USERS_DB.delete(ws)
  })

});

wss.on('close', (ws: WebSocket) => {
  wss.clients.forEach((client) => {
    client.close()
  })
})
