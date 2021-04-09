module.exports = wiot => {
	/* pre-installed udp defination */
	wiot.newPrimitive('gpio', (node, mode, pin, wire) => ({
		node: node,
		pin: pin,
		mode: mode,
		[(mode==wiot.INPUT)?'output':'input']: [wire]
	}), (o, method) => {
		node = o.node;
		node.init(`gpio.mode(${o.pin},${o.mode});`);
		if(o.mode == wiot.INPUT){
			node.always(`${o.output[0].reg}=gpio.read(${o.pin});`);
		}
		if(o.mode == wiot.OUTPUT){
			node.prepare(`gpio.write(${o.pin},${o.input[0].reg}%2);`);
			node.trigger(o.input[0], `gpio.write(${o.pin},${o.input[0].reg}%2);`);
		}
	});
}