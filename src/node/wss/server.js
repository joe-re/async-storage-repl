const WebSocket = require('ws');

class WebSocketServer {
  start() {
    const wss = new WebSocket.Server({ port: 8080 });
    wss.on('connection', (ws) => {
      ws.on('message', (message) => {
        console.log(`ws message!:${message}`);
        process.send(message);
      });
      process.on('message', (message) => {
        if (message === 'exit') {
          wss.close();
          return;
        }
        console.log(`peocess message!:${message}`);
        ws.send(message);
      });
    });
  }
}
const server = new WebSocketServer();
server.start();
