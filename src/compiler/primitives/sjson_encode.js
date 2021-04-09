module.exports = wiot => {
	wiot.newPrimitive('sjson_encode', (node, wire_output, wire_input) => ({
		node: node,
		input: wire_input,
		output: wire_output
	}), (o, method) => {
		let node = o.node;
		node.trigger(o.input, `tmp,${o.output[0].reg}=pcall(sjson.encode,${o.input[0].reg});`);
	});
}