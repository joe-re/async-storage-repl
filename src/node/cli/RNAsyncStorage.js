// @flow

const tempWrite = require('temp-write');
const sleep = require('sleep');
const fs = require('fs');

function resolveMessageFromRN(filePath) {
  let result = null;
  for (let i = 0; i < 10; i++) {
    sleep.sleep(1);
    if (fs.existsSync(filePath)) {
      result = JSON.parse(fs.readFileSync(filePath, 'utf8')).result;
      break;
    }
  }
  return result;
}

class RNAsyncStorage {
  queNo: number;
  que: {[key: number]: Object}

  constructor() {
    this.queNo = 0;
    this.que = {};
  }

  getAllKeys(): string[] {
    const result = this.sendToRN('getAllKeys');
    return result || [];
  }

  getItem(key: string) {
    return this.sendToRN('getItem', [key]);
  }

  setItem(key: string, value: string) {
    return this.sendToRN('setItem', [key, value]);
  }

  removeItem(key: string) {
    return this.sendToRN('removeItem', [key]);
  }

  mergeItem(key: string, value: string) {
    return this.sendToRN('mergeItem', [key, value]);
  }

  clear() {
    return this.sendToRN('clear');
  }

  flushGetRequests() {
    return this.sendToRN('flushGetRequests');
  }

  multiGet(keys: string[]) {
    return this.sendToRN('multiGet', [keys]);
  }

  multiSet(keyValuePairs: string[][]) {
    return this.sendToRN('multiSet', [keyValuePairs]);
  }

  multiRemove(keys: string[]) {
    return this.sendToRN('multiRemove', [keys]);
  }

  multiMerge(keyValuePairs: string[][]) {
    return this.sendToRN('multiMerge', [keyValuePairs]);
  }

  sendToRN(apiName: string, args: mixed[]=[]): ?any {
    const queId = ++this.queNo;
    const fileName = tempWrite.sync('');
    this.que[queId] = { fileName };
    _ayncStorageWebSocketServer.send(JSON.stringify({ apiName, queId, fileName, args }));
    return resolveMessageFromRN(fileName);
  }
}

module.exports = new RNAsyncStorage();
