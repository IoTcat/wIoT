module.exports = wiot => {
	wiot.newPrimitive('udp', (node, wire_res_ip, wire_res_port, wire_res_data, wire_send_ip, wire_send_port, wire_send_data, localport = parseInt(Math.random()*20000)+10000) => ({
		node: node,
		localport: localport,
		output: [wire_res_ip, wire_res_port, wire_res_data],
		input: [wire_send_ip, wire_send_port, wire_send_data]
	}), (o, method) => {
		let node = o.node;
		let v = method.Reg()
		node.setReg(v);

		node.prepare(`${v}=net.createUDPSocket();`);
		node.prepare(`${v}:listen(${o.localport});`);
		node.trigger(o.input[2], `${v}:send(${o.input[1].reg},${o.input[0].reg},tostring(${o.input[2].reg}));`);
		node.finale(`${v}:on('receive',function(s,d,p,i)${o.output[2].reg}=d;${o.output[1].reg}=p;${o.output[0].reg}=i;end);`);

	});
}