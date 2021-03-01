//import wiot compiler
const wiot = require('../../src/cli/compiler.js');

//node ID array
let nids = ['7534c', 'b840a', '1d17a', '9f163', '8908c', '39747', '308b4', 'd689e', '30e3f'];

//node object array constructed from the above node IDs
let nodes = nids.map(nid=>new wiot.node.nodemcu(nid));
//create a virtual wire
let w_all = new wiot.wire();

//for each node in the nodes array, do
nodes.forEach((node, index) => {
	//if(!index){//if is the first node (index=0, nid='7534c'), do
		//create a gpio input listener on D3 pin and connect to the virtual wire w
		//D3 pin is connected to an on-board button on NodeMCU

	//}else{//if is not the first node (index!=0), do
		//create another virtual wire
		let w = new wiot.wire();
		wiot.buffer(w_all/*output wire*/, w/*input wire*/, node);
		wiot.gpio(wiot.INPUT, node.D3, w/*output wire*/, node);
		//implement a buffer module so only when signal in wire has changed and held
		//for 0.2*index seconds, the w_delay will be updated with the value in the w

		//create a gpio output module on D4 pin, controlled by the w_delayed virtual wire
		//D4 is connected to an on-board LED on NodeMCU
		wiot.gpio(wiot.OUTPUT, node.D4, w_all, node);
	//}
});


