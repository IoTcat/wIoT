module.exports = wiot => {
	wiot.newPrimitive('bigiot', (node, DeviceID, APIkey, wire_output, wire_trigger) => ({
		node: node,
		DeviceID: DeviceID,
		APIkey: APIkey,
		output: [wire_output, wire_trigger]
	}), (o, method) => {
		let node = o.node;
		let obj = method.Reg()
		node.setReg(obj, '{}');

		node.always(`${o.output[0].reg}=${obj}.reg;`);
		node.always(`${o.output[1].reg}=${obj}.trigger;`);
		node.finale(`node.LFS.bigiot()('${o.DeviceID}','${o.APIkey}',${obj});`);

	});
}