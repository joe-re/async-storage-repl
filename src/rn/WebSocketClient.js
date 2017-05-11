// @flow

import EventEmitter from 'events';

function extractDataFromMessage(e: MessageEvent): ?string {
  const data = e.data;
  if (typeof data !== 'string') {
    throw new Error(`receive invalid message from node.: ${typeof data}`);
  }
  return data;
}

export default class WebSocketClient extends EventEmitter {
  ws: ?WebSocket;
  url: string;
  port: number;

  constructor(options: { url: string, port?: number }) {
    super(options);
    this.url = options.url;
    this.port = options.port || 8080;
  }

  open() {
    const ws = new WebSocket(`ws://${this.url}:${this.port}`);
    ws.onopen = this.handleOpen.bind(this);
    ws.onclose = this.handleClose.bind(this);
    ws.onmessage = this.handleMessage.bind(this);
    this.ws = ws;
  }

  send(message: string) {
    if (this.ws) {
      this.ws.send(message);
    }
  }

  reconnect() {
    setTimeout(() => {
      console.info('reconnecting...');
      this.open();
    }, 3000);
  }

  handleOpen() {
    console.info(`open connection: ws://${this.url}:${this.port}}`);
  }

  handleClose(e: CloseEvent) {
    if (e.code === 1000) {
      console.info(`close connection: ws://${this.url}:${this.port}}`);
      this.ws = null;
      return;
    }
    this.reconnect();
  }

  handleMessage(e: MessageEvent) {
    const data = extractDataFromMessage(e);
    if (!data) {
      return;
    }
    this.emit('message', data);
  }

}
