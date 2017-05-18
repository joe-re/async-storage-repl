# AsyncStorageREPL

AsyncStorageRepl provides you to access remote ReactNative application's AsyncStorage from your node REPL.

![gif](https://cloud.githubusercontent.com/assets/4954534/26222189/09924ee2-3c54-11e7-8247-ed15afa7cd31.gif)

```
npm i async-storage-repl -D
```

# BasicUsage

1. Write bellow code in your ReactNative Application.

```js
import AsyncStorageREPL from 'async-storage-repl';
AsyncStorageREPL().connect();
```

2. Start node REPL.

```sh
./node_modules/.bin/async-storage-repl
```

3. Let's get access your ReactNative application's storage from your node REPL.

```sh
$ ./node_modules/.bin/async-storage-repl
> RNAsyncStorage.getItem('item1')
null
> RNAsyncStorage.setItem('item1', 'nice value!')
null
> RNAsyncStorage.getItem('item1')
'nice value!'
> RNAsyncStorage.getAllKeys()
[ 'reduxPersist:timeline',
  'item1',
  'reduxPersist:auth',
  'reduxPersist:nav' ]
```

# Example

[example](/example)

# API

AsyncStorageREPL provides RNAsyncStorage on your node REPL as a global object.
You can access [AsyncStorage's all APIs](https://facebook.github.io/react-native/docs/asyncstorage.html) via this object.

- getAllKeys(): string[]
- getItem(key: string)
- setItem(key: string, value: string)
- removeItem(key: string)
- mergeItem(key: string, value: string)
- clear()
- flushGetRequests()
- multiGet(keys: string[])
- multiSet(keyValuePairs: string[][])
- multiRemove(keys: string[])
- multiMerge(keyValuePairs: string[][])

AsyncStorageREPL's methods args are guaranteed type-safe by [flow-runtime](https://codemix.github.io/flow-runtime/).

```sh
> RNAsyncStorage.getItem(1)
RuntimeTypeError: key must be a string

Expected: string

Actual: number

```

# Advanced Usage

## ReactNative side

AsyncStorageREPL() accepts an object with a host and port key.
Port key must be matched REPL side.
You don't need specify a host in case of running on a simulator.
but in case of runnning on a real device, specify your computer host.

```js
AsyncStorageREPL({ host: 'localhost', port: 8080 }) // default
  .connect();
```

## REPL side

You can specify portNo --port option.

```sh
async-storage-repl --port 8080
```
