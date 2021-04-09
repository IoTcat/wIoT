module.exports = wiot => {

	wiot.newPrimitive('print', (node, ...wires_input) => ({
		node: node,
		input: wires_input
	}), (o, method) => {
		let node = o.node;
		node.trigger(o.input, `print(${o.input.map(wire=>wire.reg).join(',')});`);
	});
}