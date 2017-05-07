// @flow

const tempWrite = require('temp-write');
const sleep = require('sleep');
const fs = require('fs');

module.exports = class RNAsyncStorage {
  queNo: number;
  que: {[key: number]: Object}
  timeout: number;

  constructor(props: { timeout?: number } = {}) {
    this.queNo = 0;
    this.que = {};
    this.timeout = props.timeout || 10;
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
    return this._resolveMessageFromRN(fileName, this.timeout);
  }

  _resolveMessageFromRN(fileName) {
    let result = null;
    for (let i = 0; i < this.timeout; i++) {
      sleep.sleep(1);
      const fileContent = fs.readFileSync(fileName, 'utf8');
      if (fileContent) {
        const json = JSON.parse(fileContent);
        delete this.que[Number(json.queId)];
        result = json.result;
        break;
      }
    }
    fs.unlinkSync(fileName);
    if (!result) {
      throw new Error("can't receive response from ReactNative Application");
    }
    return result;
  }

};
