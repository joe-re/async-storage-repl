const tempWrite = require('temp-write');
const sleep = require('sleep');

class RNAsyncStorage {
  constructor() {
    this.queNo = 0;
    this.que = {};
  }

  getAllKeys() {
    return this.sendToRN('getAllKeys', []);
  }

  sendToRN(apiName, args) {
    const queId = ++this.queNo;
    const fileName = tempWrite.sync('');
    this.que[queId] = { fileName };
    _ayncStorageWebSocketServer.send(JSON.stringify({ apiName, queId, fileName, args }));
    return this._resolveMessageFromRN(fileName);
  }

  _resolveMessageFromRN(filePath) {
    let result = null;
    for (let i = 0; i < 10; i++) {
      sleep.sleep(1);
      if (fs.existsSync(filePath)) {
        result = fs.readFileSync(filePath, 'utf8');
        break;
      }
    }
    return result;
  }
}

module.exports = RNAsyncStorage;
