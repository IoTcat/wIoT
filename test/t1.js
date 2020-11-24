//heartbeat LED
let b = wiot.device.nodemcu('n1');

let l = wiot.module.led(b, 'D2');

l.heartbeat(0, 1000, 600, 3000);