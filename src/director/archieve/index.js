const heartbeat = require(__dirname + '/modules/heartbeat.js')();
const app = require('express')();

app.listen(8081);


app.get('/', async function (req, res) {
   
    if(!req.query.hasOwnProperty('id') || !req.query.hasOwnProperty('fid') || !req.query.hasOwnProperty('body')){
      res.send('Illegal params');
      return;
    }
    console.log(req.query.body)
    let msg = await heartbeat.push(req.query.id, req.query.fid, JSON.parse(new Buffer(req.query.body, 'base64').toString())[0]);
    res.send(msg);
})





;(async () => {
  //console.log('aaaaaaaaaaaaaaa: ', await heartbeat.push('test1', 'info', ''))
  //heartbeat.push('test1', 'test', 'test1', (r)=>{
    //console.log(r)
  //})

  //heartbeat.push('test1', 'exec', 'pwm.setup(2, 100, 512);pwm.start(2);local n = 0; local timer = tmr.create(); timer:register(10, tmr.ALARM_AUTO, function() pwm.setduty(2, n%1024); n = n + 1; end);timer:start();');


  //console.log(await heartbeat.push('test1', 'exec', 'return adc.read(0)'))






})()