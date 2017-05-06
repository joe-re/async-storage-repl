const WebSocket = require('ws');
const fs = require('fs');

class WebSocketServer {
  start() {
    const wss = new WebSocket.Server({ port: 8080 });
    wss.on('connection', (ws) => {
      ws.on('message', (message) => {
        const json = JSON.parse(message);
        fs.writeFileSync(json.fileName, json.result, 'utf8');
      });

      process.on('message', (message) => {
        if (message === 'exit') {
          wss.close();
          return;
        }
        ws.send(message);
      });
    });
  }
}
const server = new WebSocketServer();
server.start();
