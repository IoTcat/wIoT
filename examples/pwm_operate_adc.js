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
	w2 = new wiot.wire();

let node = nodes[0];
let node1 = nodes[1];
/*		wiot.gpio(wiot.INPUT, node.D3, w1, node);
		wiot.gpio(wiot.INPUT, node1.D3, w2, node1);

		//or ($0+$1)%2+math.floor(($0+$1)/2)
		//and math.floor(($0+$1)/2)
		//xor ($0+$1)%2
		//not ($0+1)%2
		wiot.operate('(($0+$1)%2+1)%2', node, w, w1, w2);

		wiot.gpio(wiot.OUTPUT, node.D4, w, node);
*/

	//wiot.gpio(wiot.INPUT, node1.D3, w2, node1);
	wiot.adc(w1, node);
	//wiot.gpio(wiot.OUTPUT, node.D4, w, node);
	//wiot.operate('math.floor($0/600)', node, w, w1);
	wiot.operate('($0/2)+300', node, w, w1);

wiot.pwm(nodes[0].D4, w, new wiot.wire(500), nodes[0]);

