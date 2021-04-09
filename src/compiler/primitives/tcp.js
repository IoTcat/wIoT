module.exports = wiot => {
	wiot.newPrimitive('tcp', (node, host, port, wire_res_data, wire_send_data) => ({
		node: node,
		host: host,
		port: port,
		output: [wire_res_data],
		input: [wire_send_data]
	}), (o, method) => {
		let node = o.node;
		let v = method.Reg()
		let status = method.Reg();
		node.setReg(v);
		node.setReg(status, false);

		node.prepare(`${v}=net.createConnection(net.TCP,0);`);
		node.finale(`${v}:connect(${o.port},'${o.host}');`);
		node.trigger(o.input[0], `if ${status} then ${v}:send(tostring(${o.input[0].reg}));end;`);
		node.prepare(`${v}:on('receive',function(s,d)${o.output[0].reg}=d;end);`);
		node.prepare(`${v}:on('connection',function()${status}=true;end);`);
		node.prepare(`${v}:on('disconnection',function()${status}=false;tmr.create():alarm(1000,tmr.ALARM_SINGLE,function()${v}:connect(${o.port},'${o.host}');end);end);`);

	});
}