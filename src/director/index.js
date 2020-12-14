const heartbeat = require(__dirname + '/modules/heartbeat.js')();

;(async () => {
  console.log(await heartbeat.push('test1', 'info', ''))
})()