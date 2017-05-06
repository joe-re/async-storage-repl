require('babel-register');
const spawn = require('child_process').spawn;
const path = require('path');

global._ayncStorageWebSocketServer = spawn('node', [path.join(__dirname, 'wss/server.js')], {
  stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
});

process.on('exit', () => {
  console.log('exit');
  global._ayncStorageWebSocketServer.send('exit');
});

process.on('SIGINT', () => {
  console.log('sigint');
  process.exit();
});

process.on('SIGTERM', () => {
  console.log('sigterm');
  process.exit();
});

global.RNAsyncStorage = require('./cli/RNAsyncStorage');
