const WebSocket = require('ws');
const fs = require('fs');

class WebSocketServer {
  start(port) {
    const wss = new WebSocket.Server({ port: port || 8080 });
    this.ws = null;
    wss.on('connection', (ws) => {
      ws.on('message', (message) => {
        const json = JSON.parse(message);
        fs.writeFileSync(json.fileName, message, 'utf8');
      });
      this.ws = ws;
    });
    process.on('message', (message) => {
      if (message === 'exit') {
        wss.close();
        return;
      }
      if (this.ws) {
        this.ws.send(message);
      }
    });
  }
}
const server = new WebSocketServer();
server.start(process.env.asrport);
