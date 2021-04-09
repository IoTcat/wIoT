module.exports = wiot => {
	wiot.newPrimitive('http', (node, wire_statusCode, wire_res, wire_url, wire_body = new wiot.wire(`''`), header = 'nil', method = 'GET') => ({
		node: node,
		header: header,
		method: method,
		output: [wire_statusCode, wire_res],
		input: [wire_url, wire_body]
	}), (o, method) => {
		let node = o.node;
		node.trigger(o.input, `http.request(${o.input[0].reg},'${o.method}','${o.header}',${o.input[1].reg},function(c,d)${o.output[0].reg}=c;${o.output[1].reg}=d;end);`);
	});
}