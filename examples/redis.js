//import wiot compiler
const wiot = require('../../src/cli/compiler.js');

//node ID array
let nids = ['7534c', 'b840a', '1d17a', '9f163', '8908c', 
			'39747', '308b4', 'd689e', '30e3f', '0d672'];

//node object array constructed from the above node IDs
let nodes = nids.map(nid=>new wiot.node.nodemcu(nid));
//create a virtual wire
let w = new wiot.wire(0),
	w1 = new wiot.wire(),
	w3 = new wiot.wire(),
	w2 = new wiot.wire();

let node = nodes[0];
let node1 = nodes[1];

wiot.gpio(wiot.INPUT, node.D3, w1, node);
//wiot.gpio(wiot.INPUT, node1.D3, w2, node1);
//wiot.print(node, w1, w1);

wiot.redis(w2, w1, node, '192.168.3.4', 'test2');

wiot.print(node, w2)