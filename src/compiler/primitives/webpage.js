module.exports = wiot => {
	wiot.newPrimitive('webpage', (node, key, template, wires_output_map = {}, wires_input_map = {}, interval_s = 0.4, host = 'http://wiot-webpage.yimian.xyz/') => ({
		node: node,
		host: host,
		key: key,
		interval_s: interval_s,
		template: template,
		output: Object.keys(wires_output_map).map(id => wires_output_map[id]),
		input: Object.keys(wires_input_map).map(id => wires_input_map[id]),
		wires_output_map: wires_output_map,
		wires_input_map: wires_input_map
	}), (o, method) => {
		let node = o.node;

		let url = `${o.host}${(o.host.substring(o.host.length-1)=='/'?'':'/')}SET?key=${o.key}`;
		url += '&template='+JSON.stringify(o.template);	
		got(url, {
	        responseType: 'json'
	    });

		let url2 = `${o.host}${(o.host.substring(o.host.length-1)=='/'?'':'/')}SYNC?key=${o.key}`;

		Object.keys(o.wires_input_map).forEach(id => {
			url2 += `&${id}='..${o.wires_input_map[id].reg}..'`;
		});

		let s = '';
		Object.keys(o.wires_output_map).forEach(id => {
			s += `${o.wires_output_map[id].reg}=obj['${id}'];`;
		});
		node.prepare(`tmr.create():alarm(${o.interval_s*1000},tmr.ALARM_AUTO,function()http.request('${url2}','GET','','',function(c,d)if c==200 then local st,obj=pcall(sjson.decode,d);if st then ${s}end;end;end);end)`);

	});
}