import { WebSocketServer, WebSocket } from 'ws';
import { Action, User } from './types';
import { registration } from './actions/registration';

const users = new Map<WebSocket, User>();

const wss = new WebSocketServer({ port: 3000 }, () => {
  console.log('WS server started on ws://localhost:3000/');
});

wss.on('connection', (ws) => {
  ws.on('message', (req) => {
    const action = JSON.parse(req.toString()) as Action;

    switch (action.type) {
      case 'reg': {
        registration({ action, users, ws });
        break;
      }

      default: {
        console.log(action);        
        break;
      }
    }
  });
  
  ws.on('close', () => {
    users.delete(ws)
  })

});

wss.on('close', (ws: WebSocket) => {
  wss.clients.forEach((client) => {
    console.log();
    
    client.close()
  })
})
