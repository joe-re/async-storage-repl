class RNAsyncStorage {
  constructor() {
    this.queNo = 0;
    this.que = {};
    _ayncStorageWebSocketServer.on('message', (e) => {
      console.log(`process_message:${e}`);
      const json = JSON.parse(e);
      this.que[json.queId] = json.result;
    });
  }

  getAllKeys() {
    return this.sendToRN('getAllKeys', []);
  }

  sendToRN(apiName, args) {
    const queId = ++this.queNo;
    _ayncStorageWebSocketServer.send(JSON.stringify({ apiName, queId, args }));
    return new Promise((resolve, reject) => {
      let retryCount = 0;
      const timer = setInterval(() => {
        if (retryCount > 9) {
          reject("can't receive responses from react native application..");
        }
        if (this.que[queId]) {
          resolve(this.que[queId]);
          clearInterval(timer);
        }
        ++retryCount;
      }, 1000);
    });
  }
}
module.exports = RNAsyncStorage;
