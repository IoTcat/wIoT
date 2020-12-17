const wiot = require('./compiler.js')();


;(async () => {
	// declare two nodemcu board by ID
	let NodeTest1 = wiot.device.nodemcu('test1');
	let NodeTest2 = wiot.device.nodemcu('test2');
	// declare a led
	let led = wiot.module.led(NodeTest1, NodeTest1.pin.D2);
	// declare a sensor
	let sensor = wiot.module.sensor(NodeTest2, NodeTest2.pin.A0);
	// let the frequency of breathing is controled by sensor
	led.breath(sensor);
	// push above to the two nodemcu
	await NodeTest1.service.push()
	await NodeTest2.service.push()
})();






/*
//breathing led
;(async () => {
	// declear new nodemcu board by ID
	let NodeTest1 = wiot.device.nodemcu('test1');
	//declear new led module at D2 on nodemcu test1
	let led = wiot.module.led(NodeTest1, NodeTest1.pin.D2);
	// let led breathe with 2s
	led.breath(2000);
	// push the above functions to nodemcu
	await NodeTest1.service.push()
})();

*/



