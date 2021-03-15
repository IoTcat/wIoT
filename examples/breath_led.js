//import wiot compiler
const wiot = require('../../src/cli/compiler.js');

//node ID array
let nids = ['7534c', 'b840a', '1d17a', '9f163', '8908c', 
			'39747', '308b4', 'd689e', '30e3f', '0d672'];

//node object array constructed from the above node IDs
let nodes = nids.map(nid=>new wiot.node.nodemcu(nid));
//create a virtual wire
let w = new wiot.wire(0),
	w1 = new wiot.wire(10),
	w2 = new wiot.wire(),
	w3 = new wiot.wire();

let node = nodes[0];
let node1 = nodes[1];

wiot.gpio(wiot.INPUT, node1.D3, w3, node1);
wiot.operate(wiot.if(`$1==1`, `math.abs($0%2047-1023)`, `1023`), node, w2, w, w3);
wiot.operate('($0+20)%2048', node, w, w1);
wiot.buffer(w1, w, node, .01, true);

wiot.pwm(node.D4, w2, new wiot.wire(500), node);

//wiot.print(node, w)
