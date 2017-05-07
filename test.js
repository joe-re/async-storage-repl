require('babel-register');
const td = require('testdouble');
const proxyquire = require('proxyquire');
const fs = require('fs');
const RNAsyncStorage = require('./src/node/RNAsyncStorage');
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
