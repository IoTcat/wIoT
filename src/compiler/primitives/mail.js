module.exports = wiot => {
	wiot.newPrimitive('mail', (node, wire_en, wire_to, wire_subject, wire_body, from = 'wiot') => ({
		node: node,
		from: from,
		input: [wire_en, wire_to, wire_subject, wire_body]
	}), (o, method) => {
		let node = o.node;
		node.trigger(o.input[0], `if ${o.input[0].reg}==1 then http.request('http://api.yimian.xyz/mail/?to='..tostring(${o.input[1].reg})..'&subject='..tostring(${o.input[2].reg})..'&body='..tostring(${o.input[3].reg})..'&from=${o.from}','GET','','',function(c,d)end);end;`);
	});
}