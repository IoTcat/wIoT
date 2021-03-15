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
	w3 = new wiot.wire(),
	w4 = new wiot.wire();

let node = nodes[0];

wiot.gpio(wiot.OUTPUT, node.D4, w, node);

wiot.buffer(w, w2, node);

wiot.bigiot(node, 21249, 'ee37b3a2a', w3);

wiot.operate(`${wiot.if(`$1=='play'`, 0, wiot.if(`$1=='stop'`, 1, `$0`))}`, node, w2, w3);
