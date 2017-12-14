// @flow

import { AsyncStorage } from 'react-native';
import getHost from 'rn-host-detect';
import Client from './WebSocketClient';

function executeAsyncStorageAPI(apiName: string, args: string[]): Promise<*> {
  if (apiName === 'dump') {
    return dump()
  } else if (!AsyncStorage.hasOwnProperty(apiName)) {
    return Promise.reject(`can't find AsyncStorage API: ${apiName}`);
  }
  const result = AsyncStorage[apiName](...args);
  if (result && typeof result.then === 'function') {
    return result;
  }
  return Promise.resolve(result);
}

async function dump() {
  const keys = await AsyncStorage.getAllKeys();
  return AsyncStorage.multiGet(keys)
}

class AsyncStorageREPL {
  client: Client;

  constructor(params: { host?: string, port?: number } = {}) {
    this.client = new Client({
      url: params.host || getHost('localhost'),
      port: params.port || 8080,
    });
    this.client.on('message', this.handleMessage.bind(this));
  }

  connect() {
    this.client.open();
  }

  handleMessage(message: string) {
    const json = JSON.parse(message);
    const { apiName, args, queId, fileName } = json;
    const result = executeAsyncStorageAPI(apiName, args);
    return result.then((resolved) => {
      this.client.send(JSON.stringify({ queId, fileName, error: 0, result: resolved }));
      return resolved;
    }).catch((errMessage) => {
      this.client.send(JSON.stringify({ queId, fileName, error: 1, message: errMessage }));
      return Promise.reject(errMessage);
    });
  }
}

export default function (params: { host?: string, port?: number } = {}) {
  return new AsyncStorageREPL(params);
}
