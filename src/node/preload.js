require('babel-register');
const spawn = require('child_process').spawn;
const path = require('path');
const Storage = require('./RNAsyncStorage');

global.RNAsyncStorage = new Storage();
global._ayncStorageWebSocketServer = spawn('node', [path.join(__dirname, 'server.js')], {
  stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
  env: process.env,
});

process.on('exit', () => {
  global.RNAsyncStorage._exit();
  global._ayncStorageWebSocketServer.send('exit');
});

process.on('SIGINT', () => {
  process.exit();
});

process.on('SIGTERM', () => {
  process.exit();
});
