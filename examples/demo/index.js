//import wiot compiler
const wiot = require('wiot');

//node ID array
let nids = ['27e4c', 'cc54c', '3beaa'];

//node object array constructed from the above node IDs
let nodes = nids.map(nid=>new wiot.node.nodemcu(nid));
//create a virtual wire
let w = new wiot.wire(0),
	w1 = new wiot.wire(1),
	w2 = new wiot.wire(),
	w3 = new wiot.wire(),
	w4 = new wiot.wire(),
	w5 = new wiot.wire(),
	w6 = new wiot.wire(),
	w7 = new wiot.wire(),
	w8 = new wiot.wire(),
	w9 = new wiot.wire();



wiot.pwm(nodes[0], nodes[0].D4, w, new wiot.wire(500));
wiot.pwm(nodes[1], nodes[1].D4, w, new wiot.wire(500));
wiot.pwm(nodes[2], nodes[2].D4, w, new wiot.wire(500));
wiot.operate(nodes[0], `$1*$2`, w, w1, w5);

wiot.print(nodes[0], w1, w2, w3, w4)

wiot.operate(nodes[0], `($0+1)%2`, w1, w2);
wiot.buffer(nodes[0], w2, w3, 0.3);
wiot.gpio(nodes[0], wiot.INPUT, nodes[0].D2, w3);


wiot.operate(nodes[0], `${wiot.if(`$1=='play'`, 1, wiot.if(`$1=='stop'`, 0, `$0`))}`, w1, w4);
wiot.bigiot(nodes[0], 21249, 'ee37b3a2a', w4);


wiot.buffer(nodes[0], w5, w6, .8);
wiot.operate(nodes[0], wiot.if(`$1>$0+100 or $1<$0-100`, `$1`, `$0`), w6, w7);
wiot.adc(nodes[0], w7);



wiot.operate(nodes[1], `${wiot.if(`$1==1`, `'on'`, `'off'`)}`, w8, w1);
wiot.operate(nodes[1], `${wiot.if(`$1=='true'`, 1, 0)}`, w1, w9);

wiot.webpage(nodes[1], '122f3169fa7e12989bd7f1ed1c571b64', [{
	id: 'b',
	name: 'Brightness'
},{
	id: 's',
	name: 'Switch'
},{
	id: 'l',
	name: 'LED'
},{
	id: 'w',
	name: 'web button',
	type: 'button'
}], {
	w: w9
}, {
	b: w5,
	s: w2,
	l: w8
});




let w10 = new wiot.wire(0),
	w11 = new wiot.wire(1),
	w12 = new wiot.wire(),
	w13 = new wiot.wire();



wiot.pwm(nodes[2], nodes[2].D6, w10, new wiot.wire(500));
wiot.pwm(nodes[2], nodes[2].D8, w10, new wiot.wire(1000));


wiot.operate(nodes[2], `(($1+1)%2)*$2`, w10, w11, w13);


wiot.buffer(nodes[2], w11, w12, 5);
wiot.gpio(nodes[2], wiot.INPUT, nodes[2].D2, w12);

wiot.breathing(nodes[2], 1, w13);

let wire_en = new wiot.wire(0);
wiot.operate(nodes[2], wiot.if(`$1==0`, 0, 1), wire_en, w10);
wiot.mail(nodes[2], wire_en, new wiot.wire(`'i@iotcat.me'`), 
	new wiot.wire(`'Warning from IR sensor!!'`), new wiot.wire(`'Warning!!!!'`));


wiot.memobird(nodes[2], "9e55121803474371bfa25d20e554b31d", 
	"1133807", "b3ee06a8bd9b49e1", wire_en, new wiot.wire(`'Warning!!!!'`));
