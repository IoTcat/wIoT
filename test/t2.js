let b = wiot.device.nodemcu('n1');
let b2 = wiot.device.nodemcu('n2');

let l = wiot.module.led(b, 'D2');
let s = wiot.module.sensor(b2, 'D5');

s.trigger(m=>l.set(m*400));
