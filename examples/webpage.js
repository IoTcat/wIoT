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

wiot.gpio(wiot.INPUT, node.D3, w1, node);

wiot.buffer(w, w1, node);

wiot.buffer(w, w2, node);

wiot.operate(`${wiot.if(`$0==0`, `'true'`, `'false'`)}`, node, w3, w);
wiot.operate(`${wiot.if(`$0=='true'`, 0, 1)}`, node, w2, w4);

wiot.webpage(node, '122f3169fa7e12989bd7f1ed1c571b64', [{
	id: 'a',
	name: 'led'
},{
	id: 'c',
	name: 'on-board button'
},{
	id: 'b',
	name: 'web button',
	type: 'button'
}], {
	b: w4
}, {
	a: w3,
	c: w1
});