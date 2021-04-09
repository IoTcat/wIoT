module.exports = wiot => {
	wiot.newPrimitive('redis', (node, host, channel, wire_res, wire_send, port = 6379) => ({
		node: node,
		host: host,
		port: port,
		channel: channel,
		output: [wire_res],
		input: [wire_send]
	}), (o, method) => {
		let node = o.node;
		let vpub = method.Reg(),
			vsub = method.Reg();
		node.setReg(vpub);
		node.setReg(vsub);
		node.prepare(`${vpub}=node.LFS.redis().connect('${o.host}',${o.port});`);
		node.prepare(`${vsub}=node.LFS.redis().connect('${o.host}',${o.port});`);
		node.finale(`${vsub}:subscribe('${o.channel}',function(c,m)${o.output[0].reg}=m;end);`);
		node.trigger(o.input, `${vpub}:publish('${o.channel}',tostring(${o.input[0].reg}));`);
	});
}