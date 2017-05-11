// @flow

import { AsyncStorage } from 'react-native';
import Client from './WebSocketClient';

function applyAsyncStorage(apiName: string, args: string[]): Promise<*> {
  if (!AsyncStorage.hasOwnProperty(apiName)) {
    return Promise.reject(`can't find AsyncStorage API: ${apiName}`);
  }
  const result = AsyncStorage[apiName](...args);
  if (result && typeof result.then === 'function') {
    return result;
  }
  return Promise.resolve(result);
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
    return result.then((resolved) => {
      this.client.send(JSON.stringify({ queId, fileName, error: 0, result: resolved }));
      return resolved;
    }).catch((errMessage) => {
      this.client.send(JSON.stringify({ queId, fileName, error: 1, message: errMessage }));
      return Promise.reject(errMessage);
    });
  }
}

export default new AsyncStorageREPL();
