require('babel-register');
const spawn = require('child_process').spawn;
const path = require('path');

global._ayncStorageWebSocketServer = spawn('node', [path.join(__dirname, 'server.js')], {
  stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
});

process.on('exit', () => {
  global._ayncStorageWebSocketServer.send('exit');
});

process.on('SIGINT', () => {
  process.exit();
});

process.on('SIGTERM', () => {
  process.exit();
});

global.RNAsyncStorage = require('./RNAsyncStorage');
