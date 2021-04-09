module.exports = wiot => {

	wiot.newPrimitive('adc', (node, wire_output) => ({
		node: node,
		pin: 0,
		output: [wire_output]
	}), (o, method) => {
		let node = o.node;
		node.always(`${o.output[0].reg}=adc.read(${o.pin});`);
	});
}