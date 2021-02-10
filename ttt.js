var packageRoot = require.resolve('nodemcu-tool')
    .match(/^.*[\/\\]node_modules[\/\\][^\/\\]*/)[0];

console.log(packageRoot)


;(async ()=>{
var _connector = require('nodemcu-tool');
console.log(await _connector.connect('COM3'))
console.log('dd')
console.log(await _connector.upload('test/led.lua', 'led.lua.', {minify: true}, ()=>{}))
await _connector.disconnect();
})();

//
