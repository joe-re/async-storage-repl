require('react-native-mock/mock');
const td = require('testdouble');
const proxyquire = require('proxyquire');
const fs = require('fs');
const RNAsyncStorage = require('./src/node/RNAsyncStorage');
const WebSocketClient = require('./src/rn/WebSocketClient').default;
const assert = require('assert');

if (!fs.existsSync('./sandbox')) {
  fs.mkdirSync('./sandbox');
}

describe('RNAsyncStorage#sendToRN', () => {
  const testee = new RNAsyncStorage({ timeout: 1 });

  beforeEach(() => {
    const send = td.function('send');
    global._ayncStorageWebSocketServer = { send };
  });

  context('no response from WebSocketServer', () => {
    it('shuold get error message', () => {
      let message = '';
      try {
        testee.sendToRN('someAPI', []);
      } catch (e) {
        message = e.message;
      }
      assert.equal(message, "can't receive response from ReactNative Application");
    });
  });

  context('receive response from WebSocketServer', () => {
    let proxiedTestee = null;
    const response = { result: 'foo', queId: 1 };
    const tempFilePath = './sandbox/testresult';

    beforeEach(() => {
      const sync = td.function('sync');
      td.when(sync('')).thenReturn(tempFilePath);
      proxiedTestee = new (proxyquire('./src/node/RNAsyncStorage', { 'temp-write': { sync } }))();
      fs.writeFileSync(tempFilePath, JSON.stringify(response));
    });

    it('shuold get response', () => {
      const result = proxiedTestee.sendToRN('someAPI', []);
      assert.equal(result, response.result, 'assert response');
      assert(!fs.existsSync(tempFilePath), 'remove tempfile');
      assert.deepEqual({}, proxiedTestee.que, 'remove que');
    });
  });
});

describe('RNAsyncStorage#_exit()', () => {
  const testee = new RNAsyncStorage({ timeout: 1 });
  const tempFilePath = './sandbox/_exit_temp_file';
  it('shuold remove remain tempfiles', () => {
    testee.que[1] = { fileName: tempFilePath };
    fs.writeFileSync(tempFilePath, '');
    testee._exit();
    assert(!fs.existsSync(tempFilePath), 'remove tempfile');
  });
});


describe('AsyncStorageREPL#handleMessage()', () => {
  let clientSend = null;
  let testee = null;

  beforeEach(() => {
    testee = proxyquire('./src/rn/AsyncStorageREPL', {
      'react-native': { AsyncStorage: {
        promiseAPI: () => Promise.resolve('result'),
        valueAPI: () => 'result',
      } },
    }).default();
    const client = new WebSocketClient({ url: 'test', port: 8080 });
    clientSend = td.function('send');
    client.send = clientSend;
    testee.client = client;
  });

  context('receives undefined apiName', () => {
    it('should send error', () => {
      const result = testee.handleMessage(JSON.stringify({
        apiName: 'undefinedAPI',
        queId: 1,
        args: [],
        filename: './tempfile',
      }));
      return result.then((resolved) => {
        throw new Error(`Promise was unexpectedly fulfilled: ${resolved}`);
      }).catch((error) => {
        td.verify(clientSend(JSON.stringify({
          queId: 1,
          error: 1,
          message: error,
        })));
      });
    });
  });

  context('resolve as Promise', () => {
    it('should send result', () => {
      const result = testee.handleMessage(JSON.stringify({
        apiName: 'promiseAPI',
        queId: 1,
        args: [],
        filename: './tempfile',
      }));
      return result.then((resolved) => {
        td.verify(clientSend(JSON.stringify({
          queId: 1,
          error: 0,
          result: resolved,
        })));
      });
    });
  });

  context('resolve as value', () => {
    it('should send result', () => {
      const result = testee.handleMessage(JSON.stringify({
        apiName: 'valueAPI',
        queId: 1,
        args: [],
        filename: './tempfile',
      }));
      return result.then((resolved) => {
        td.verify(clientSend(JSON.stringify({
          queId: 1,
          error: 0,
          result: resolved,
        })));
      });
    });
  });
});
