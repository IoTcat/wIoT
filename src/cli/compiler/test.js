const wiot = 

let nodemcu1 = wiot.node.nodemcu('good');
let nodemcu2 = wiot.node.nodemcu('good3');
let nodemcu3 = wiot.node.nodemcu('good4');

let w1 = wiot.udp.wire()//,
//	w2 = wiot.udp.wire();


//let buf = wiot.udp.buffer(w1, w2, nodemcu1);

let pin1 = wiot.udp.gpio(wiot.INPUT, nodemcu1.D3, w1, nodemcu1);

let pin2 = wiot.udp.gpio(wiot.OUTPUT, nodemcu2.D4, w1, nodemcu2);

let pin3 = wiot.udp.gpio(wiot.OUTPUT, nodemcu3.D4, w1, nodemcu3);



