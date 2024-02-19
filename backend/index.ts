import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3000 }, () => {
  console.log('WS server started on ws://localhost:3000/');
});

wss.on('connection', (ws) => {

  ws.on('message', (data) => {
    console.log('received: %s', data);
    ws.send('123');
  });
  
  ws.on('error', ws.close);
});

wss.on('close', (ws: WebSocket) => {
  wss.clients.forEach((client) => {
    console.log();
    
    client.close()
  })
})
