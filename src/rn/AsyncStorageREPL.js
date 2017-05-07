// @flow

import { AsyncStorage } from 'react-native';

function applyAsyncStorage(apiName: string, args: string[]): Promise<*> {
  if (!AsyncStorage.hasOwnProperty(apiName)) {
    return Promise.reject(`can't find AsyncStorage API: ${apiName}`);
  }
  console.log(args);
  return AsyncStorage[apiName](...args);
}

function extractDataFromMessage(e: MessageEvent): ?string {
  const data = e.data;
  if (typeof data !== 'string') {
    console.log(`receive invalid message from node.: ${typeof data}`);
    return null;
  }
  return data;
}

class AsyncStorageREPL {
  ws: WebSocket;
  connect() {
    this.ws = new WebSocket('ws://localhost:8080');
    this.ws.onopen = () => {
      // const dumpRaw = AsyncStorage.getAllKeys().then((keys) => {
      //   return Promise.all(keys.map((key) => AsyncStorage.getItem(key)));
      // });
      // dumpRaw.then((data) => {
      //   console.log(data);
      //   ws.send(data.join(',')); // send a message
      // })
    };

    this.ws.onmessage = (e: MessageEvent) => {
      const data = extractDataFromMessage(e);
      if (!data) {
        return;
      }
      const json = JSON.parse(data);
      const { apiName, args, queId, fileName } = json;
      const result = applyAsyncStorage(apiName, args);
      console.log(result);
      if (result && typeof result.then === 'function') {
        result.then((resolved) => {
          this.ws.send(JSON.stringify({ queId, fileName, error: 0, result: resolved }));
        }).catch((message) => {
          this.ws.send(JSON.stringify({ queId, fileName, error: 1, message }));
        });
      } else {
        this.ws.send(JSON.stringify({ queId, fileName, error: 0, result }));
      }
    };
  }
}

export default new AsyncStorageREPL();
