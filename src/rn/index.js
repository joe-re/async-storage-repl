export default class AsyncStorageCLI {
  connect() {
    const ws = new WebSocket('ws://localhost:8080');
    ws.onmessage = (e) => {
      console.log(e.data);
      ws.send(e.data);
    };

    ws.onerror = (e) => {
      // an error occurred
      console.log(e.message);
    };

    ws.onclose = (e) => {
      // connection closed
      console.log(e.code, e.reason);
    };
  }
}
