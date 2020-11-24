
function evall(obj){     return Function('"use strict";return (setImmediate(()=>{' + obj + '}))')(); }

try{

	t = evall('console.log("evall ok")');
}catch(e){}


const express = require('express');
const mqtt = require('mqtt');


var client  = mqtt.connect('mqtt://192.168.3.4');


client.on('connect', function () {
	client.subscribe('/t/#');
});


var que = [];


client.on('message', function (topic, message) {
	console.log(message.toString());
	que.forEach(obj => {
		if(obj.topic == topic){
			obj.func(message);
		}
	});
});


wiot = {
	device:{
		nodemcu: (id) => {
			let o = {
				'id': id
			}
			return o;
		}
	},
	module: {
		led: (device, pin) => {
			let o = {
				set: (val) => {
					client.publish('/t/'device.id+'/'+pin, val);
				}
			}
			return o;
		},
		sensor: (device, pin) => {
			let o = {
				trigger: (func) => {
					que.push({
						topic: '/t/'device.id+'/'+pin,
						'func': (s) => {
							func(s);
						}
					});
				}
			}
			return o;
		}
	}
};







const app = express()
const port = 3000

app.get('/', (req, res) => {
	try{
		clearImmediate(t);
		t = evall(atob(req.query.body));
	}catch(e){
		t = evall('console.log("'+e+'"")');
	}
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})



let b = wiot.device.nodemcu('n1');let b2 = wiot.device.nodemcu('n2');let l = wiot.module.led(b, 'D2');let s = wiot.module.sensor(b2, 'D5');s.trigger(m=>l.set(m*400));