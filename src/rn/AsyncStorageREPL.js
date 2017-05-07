// @flow

import { AsyncStorage } from 'react-native';
import Client from './WebSocketClient';

function applyAsyncStorage(apiName: string, args: string[]): Promise<*> {
  if (!AsyncStorage.hasOwnProperty(apiName)) {
    return Promise.reject(`can't find AsyncStorage API: ${apiName}`);
  }
  console.log(args);
  return AsyncStorage[apiName](...args);
}

class AsyncStorageREPL {
  client: Client;

  constructor() {
    this.client = new Client({
      url: 'localhost',
      port: 8080,
    });
    this.client.on('message', this.handleMessage.bind(this));
  }

  connect() {
    this.client.open();
  }

  handleMessage(message: string) {
    const json = JSON.parse(message);
    const { apiName, args, queId, fileName } = json;
    const result = applyAsyncStorage(apiName, args);
    console.log(result);
    if (result && typeof result.then === 'function') {
      result.then((resolved) => {
        this.client.send(JSON.stringify({ queId, fileName, error: 0, result: resolved }));
      }).catch((errMessage) => {
        this.client.send(JSON.stringify({ queId, fileName, error: 1, message: errMessage }));
      });
    } else {
      this.client.send(JSON.stringify({ queId, fileName, error: 0, result }));
    }
  }
}

export default new AsyncStorageREPL();
