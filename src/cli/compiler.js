(()=>{

const fs = require('fs');
const md5 = require('md5');
const got = require('got');

let config = require(__dirname + '/modules/getConfig.js')();
if(!config) return;

/* system private method */
const uniqueArr = arr => [...new Set(arr)];

const shortcut = (obj1, obj2) => {
	Object.keys(obj2).forEach(name => {
		if(!obj1.hasOwnProperty(name) && typeof obj2[name] == 'object' || typeof obj2[name] == 'function'){
			obj1[name] = obj2[name];
		}
	});
}

const Reg = (() => {
	let cnt = 0;
	return () => {
		let div = ++cnt,
			rem = 0; 
		let s = '_';
		while(div > 0){
			rem = Math.floor(div%52);
			div = parseInt(div/52);
			if(rem<26) s += String.fromCharCode(rem + 97);
			else s += String.fromCharCode(rem-26 + 65);
		}
		return s;
	}
})();

const sync = sync => {

	Object.keys(wiot.__).forEach(nid => {
	    let s = '';
	    let node = wiot.__[nid];

	    node.unique();

	    node.head.forEach(item => s += item);
	    Object.keys(node.regs).forEach(item =>{
	    	let default_val = node.regs[item].default;
	    	if(node.regs[item].isPersist){
	    		default_val = `db.get('${item}')`;
	    		s += `${item}=${default_val};if ${item}==nil then ${item}=${node.regs[item].default};end;`
				if(node.regs[item].trigger.length) s += `F${item}=${item};`
	    	}else{
	    		 s += `${item}=${default_val};`
				if(node.regs[item].trigger.length) s += `F${item}=${item};`
	    	}
	    });
	    node.body.forEach(item=> s += item);

	    s += 'tmr.create():alarm('+wiot.CLOCK_INTERVAL+',tmr.ALARM_AUTO,function()';

	    Object.keys(node.regs).forEach(item =>{
	    	if(node.regs[item].trigger.length){
	    		s += `if not(F${item}==${item})then `
	    		node.regs[item].trigger.forEach(funcs=>{
	    			s += `${funcs}`;
	    		});
	    		if(node.regs[item].isPersist){
	    			s += `db.set('${item}',${item})`;
	    		}
	    		s += `end;`;
	    		s += `F${item}=${item};`
	    	}
	    });

	    node.loop.forEach(item => s += item);
	    s += 'end);';
	    node.footer.forEach(item => s += item);

	    fs.writeFileSync(config.root+'.wiot/compiled_files/'+nid, s);

	});
}

const channel = (wire) => {

	nodes_output = wire.output.map(udp=>udp.node);
	nodes_output = uniqueArr(nodes_output);
	nodes_input = wire.input.map(udp=>udp.node);
	nodes_input = uniqueArr(nodes_input);

	if(nodes_input.length == 1 && nodes_output.length == 1 && nodes_input[0] == nodes_output[0]) return;
	if(nodes_input.length == 1 && nodes_output.length == 0) return;
	if(nodes_input.length == 0 && nodes_output.length == 1) return;

	nodes_output.forEach(node_output => {
		node_output.footer.push(node_output.MSGonSend(wire.reg, `${wire.reg}=body;FR${wire.reg}=from;`));
	});

	 //console.log(nodes_input.map(d=>d.regs[wire.reg].trigger))

	nodes_input.forEach(node_input => {
		node_input.unique();
		nodes_output.forEach(node_output => {
			//if(node_input == node_output) return;
			node_output.unique();
			let arr = node_input.regs[wire.reg].trigger;
			let s2 = node_input.MSGSend(node_output.nid, wire.reg, wire.reg);
			//console.log(arr)
			//console.log(s2)
			if(arr.indexOf(s2) !== -1) arr.splice(arr.indexOf(s2), 1);;
			s2 =  `if not(FR${wire.reg}=='${node_output.nid}')then ${node_input.MSGSend(node_output.nid, wire.reg, wire.reg)}end;`;
			if(arr.indexOf(s2) !== -1) arr.splice(arr.indexOf(s2), 1);
			s2 = `FR${wire.reg}=nil;`;
			if(arr.indexOf(s2) !== -1) arr.splice(arr.indexOf(s2), 1);
			//console.log(arr)
		})
	});

	 let io = nodes_input.filter(function(v){ return nodes_output.indexOf(v) > -1 });
	 let i = nodes_input.filter(v=>io.indexOf(v) == -1);
	 let o = nodes_output.filter(v=>io.indexOf(v) == -1);

	 //console.log(nodes_input.map(d=>d.regs[wire.reg].trigger))

	 if(!io.length){
	 	if(!o.length) return;
		 let pnt = 0;
		 i.forEach(node => {
		 	let s2 = node.MSGSend(o[pnt%o.length].nid, wire.reg, wire.reg);
		 	node.trigger(wire, s2);
		 	pnt++;
		 });
	 }else{
		 let pnt = 0;
		 i.forEach(node => {
		 	let s2 = node.MSGSend(io[pnt%io.length].nid, wire.reg, wire.reg);
		 	node.trigger(wire, s2);
		 	pnt++;
		 });

		 pnt = 0;
		 o.forEach(node=>{
		 	let s2 = io[pnt%io.length].MSGSend(node.nid, wire.reg, wire.reg);
		 	io[pnt%io.length].trigger(wire, s2);
		 	pnt++;
		 });
		 pnt = 0;

		 io.forEach((node,index)=>{
		 	if(index){
		 		let s2 = node.MSGSend(io[index-1].nid, wire.reg, wire.reg);
		 		s2 = `if not(FR${wire.reg}=='${io[index-1].nid}')then ${s2}end;`
		 		node.trigger(wire, s2);
		 	}
		 	if(index != io.length-1){
		 		let s2 = node.MSGSend(io[index+1].nid, wire.reg, wire.reg);
		 		s2 = `if not(FR${wire.reg}=='${io[index+1].nid}')then ${s2}end;`
		 		node.trigger(wire, s2);
		 	}
		 	node.trigger(wire, `FR${wire.reg}=nil;`);
		 });
	 }

//console.log(nodes_input.map(d=>d.regs[wire.reg].trigger))
}

const wiot = {
	INPUT: 'gpio.INPUT',
	OUTPUT: 'gpio.OUTPUT',
	CLOCK_INTERVAL: 10,
	__: {

	},
	node: {
		nodemcu: function(nid){
			wiot.__[nid] = {
				nid: nid,
				regs: {},
				head: [],
				body: [],
				loop: [],
				footer: [],
				D1: 1,
				D2: 2,
				D3: 3,
				D4: 4,
				D5: 5,
				D6: 6,
				D7: 7,
				D8: 8
			}
			wiot.__[nid].method = wiot.__primitiveMethod(wiot.__[nid]);
			shortcut(wiot.__[nid], wiot.__[nid].method);
			return wiot.__[nid];
		}
	},
	__primitiveMethod: (node) => ({
		trigger: function(wire, cmd){
			if(Array.isArray(wire) && wire.length > 1){
				let func = Reg();
				node.setReg(func);
				node.prepare(`${func}=function()${cmd}end;`);
				wire.forEach(item=>{
					node.regs[item.reg].trigger.push(`${func}();`);
				});
			}else{
				if(Array.isArray(wire)) node.regs[wire[0].reg].trigger.push(cmd);
				else node.regs[wire.reg].trigger.push(cmd);
			}
		},
		unique: function(){
		    node.head = uniqueArr(node.head);
		    node.body = uniqueArr(node.body);
		    node.loop = uniqueArr(node.loop);
		    node.footer = uniqueArr(node.footer);
		    Object.keys(node.regs).forEach(item =>{
		    	node.regs[item].trigger = uniqueArr(node.regs[item].trigger);
		    });
		},
		setReg: function(reg, default_val = 0, isPersist = false){
			if(Object.keys(node.regs).indexOf(reg) == -1) {
				node.regs[reg] = {
					default: default_val,
					isPersist: isPersist,
					trigger: []
				}
			}else{
				node.regs[reg].default = default_val;
			}
		},
		MSGonSend: function(name, cmd, bodyMark = 'body', fromMark = 'from'){
			return `msg.onSend('${name}',function(${fromMark},${bodyMark})${cmd}end);`;
		},
		MSGSend: function(to, name, body, proxy = false){
			return `msg.send('${to}','${name}',${body}${(proxy?',true':'')});`;
		},
		always: function(cmd){
			node.loop.push(cmd);
		},
		init: function(cmd){
			node.head.push(cmd);
		},
		prepare: function(cmd){
			node.body.push(cmd);
		},
		finale: function(cmd){
			node.footer.push(cmd);
		}
	}),
	__systemMethod: {
		Reg: Reg
	},
	newPrimitive: (type, getObj, genCode) => {
		wiot.primitive[type] = function(){
			let o =getObj(...arguments);
			o.type = type;
			o.__hash = md5(Math.random());
			if(o.input && o.input.length){
				o.input.forEach(wire=>wire.output.push(o));
				o.input.forEach(wire=>wire.generate());
			}
			if(o.output && o.output.length){
				o.output.forEach(wire=>wire.input.push(o));
				o.output.forEach(wire=>wire.generate());
			}

			genCode(o, wiot.__systemMethod);
			sync();
			return o;
		};
		shortcut(wiot, wiot.primitive)
	},
	newOperator: (type, genExpression) => {
		wiot.operator[type] = genExpression;
		shortcut(wiot, wiot.operator)
	},
	newModule: (name, func) => {
		wiot.module[name] = func;
		shortcut(wiot, wiot.module)
	},
	primitive: {},
	operator: {},
	module: {}
}


/* wire shortcut */

wiot.newPrimitive('wire', (default_value = 0, isPersist = false) => ({
	reg: Reg(),
	default: default_value,
	isPersist: isPersist,
	input: [],
	output: []
}), (o, method) => {
	let wire = o;
	o.generate = () => {
		wire.input = uniqueArr(wire.input);
		wire.output = uniqueArr(wire.output);
		wire.input.forEach(udp => {
			let node = udp.node;
			node.setReg(o.reg, o.default, o.isPersist);
		});
		wire.output.forEach(udp => {
			let node = udp.node;
			node.setReg(o.reg, o.default, o.isPersist);
		});
		channel(wire);
	}
});



/* pre-installed udp defination */
wiot.newPrimitive('gpio', (node, mode, pin, wire) => ({
	node: node,
	pin: pin,
	mode: mode,
	[(mode==wiot.INPUT)?'output':'input']: [wire]
}), (o, method) => {
	node = o.node;
	node.init(`gpio.mode(${o.pin},${o.mode});`);
	if(o.mode == wiot.INPUT){
		node.always(`${o.output[0].reg}=gpio.read(${o.pin});`);
	}
	if(o.mode == wiot.OUTPUT){
		node.prepare(`gpio.write(${o.pin},${o.input[0].reg}%2);`);
		node.trigger(o.input[0], `gpio.write(${o.pin},${o.input[0].reg}%2);`);
	}
});


wiot.newPrimitive('buffer', (node, wire_output, wire_input, delay_s = 0, isSyncAtInit = false) => ({
	node: node,
	delay_s: delay_s,
	isSyncAtInit: isSyncAtInit,
	input: [wire_input],
	output: [wire_output]
}), (o, method) => {
	let node = o.node;
	let cnt = method.Reg();
	node.setReg(cnt, (o.isSyncAtInit)?2:0);
	node.trigger(o.input[0], `${cnt}=${(Math.round(o.delay_s*1000/wiot.CLOCK_INTERVAL)||1)+1};`);
	node.always(`if not(${cnt}==0)then ${cnt}=${cnt}-1;end;`);
	node.always(`if ${cnt}==1 then ${o.output[0].reg}=${o.input[0].reg};end;`);
});


wiot.newPrimitive('operate', (node, expression, wire_output, ...wires_input) => ({
	node: node,
	expression: expression,
	input: wires_input,
	output: [wire_output]
}), (o, method) => {
	let node = o.node;
	let s = o.expression;
	s = s.replace(new RegExp('\\$0', 'g'), o.output[0].reg);
	o.input.forEach((wire, index) => {
		s = s.replace(new RegExp('\\$'+(index+1), 'g'), wire.reg);
	});
	node.trigger(o.input, `${o.output[0].reg}=${s};`);
});

wiot.newPrimitive('print', (node, ...wires_input) => ({
	node: node,
	input: wires_input
}), (o, method) => {
	let node = o.node;
	node.trigger(o.input, `print(${o.input.map(wire=>wire.reg).join(',')});`);
});

wiot.newPrimitive('sjson_encode', (node, wire_output, wire_input) => ({
	node: node,
	input: wire_input,
	output: wire_output
}), (o, method) => {
	let node = o.node;
	node.trigger(o.input, `tmp,${o.output[0].reg}=pcall(sjson.encode,${o.input[0].reg});`);
});

wiot.newPrimitive('sjson_decode', (node, wire_output, wire_input) => ({
	node: node,
	input: wire_input,
	output: wire_output
}), (o, method) => {
	let node = o.node;
	node.trigger(o.input, `tmp,${o.output[0].reg}=pcall(sjson.decode,${o.input[0].reg});`);
});

wiot.newPrimitive('pwm', (node, pin, wire_duty, wire_clock) => ({
	node: node,
	pin: pin,
	input: [wire_duty, wire_clock]
}), (o, method) => {
	let node = o.node;
	node.prepare(`pwm.setup(${o.pin},${o.input[1].reg},${o.input[0].reg});`);
	node.prepare(`pwm.setduty(${o.pin},${o.input[0].reg});`);
	node.trigger(o.input[0], `pwm.setduty(${o.pin},${o.input[0].reg});`);
	node.trigger(o.input[1], `pwm.setclock(${o.pin},${o.input[1].reg});`);
});


wiot.newPrimitive('adc', (node, wire_output) => ({
	node: node,
	pin: 0,
	output: [wire_output]
}), (o, method) => {
	let node = o.node;
	node.always(`${o.output[0].reg}=adc.read(${o.pin});`);
});

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

wiot.newPrimitive('bigiot', (node, DeviceID, APIkey, wire_output) => ({
	node: node,
	DeviceID: DeviceID,
	APIkey: APIkey,
	output: [wire_output]
}), (o, method) => {
	let node = o.node;
	let obj = method.Reg()
	node.setReg(obj, '{}');

	node.always(`${o.output[0].reg}=${obj}.reg;`);
	node.finale(`node.LFS.bigiot()('${o.DeviceID}','${o.APIkey}',${obj});`);

});

wiot.newPrimitive('mail', (node, wire_en, wire_to, wire_subject, wire_body, from = 'wiot') => ({
	node: node,
	from: from,
	input: [wire_en, wire_to, wire_subject, wire_body]
}), (o, method) => {
	let node = o.node;
	node.trigger(o.input[0], `if ${o.input[0].reg}==1 then http.request('http://api.yimian.xyz/mail/?to='..tostring(${o.input[1].reg})..'&subject='..tostring(${o.input[2].reg})..'&body='..tostring(${o.input[3].reg})..'&from=${o.from}','GET','','',function(c,d)end);end;`);
});

wiot.newPrimitive('memobird', (node, AppKey, UserID, memobirdID, wire_en, wire_body) => ({
	node: node,
	ak: AppKey,
	uid: UserID,
	memobirdID: memobirdID,
	input: [wire_en, wire_body]
}), (o, method) => {
	let node = o.node;
	node.trigger(o.input[0], `if ${o.input[0].reg}==1 then http.request('http://api.yimian.xyz/gugu/?ak=${o.ak}&userID=${o.uid}&memobirdID=${o.memobirdID}&body='..tostring(${o.input[1].reg}),'GET','','',function(c,d)end);end;`);
});


wiot.newOperator('if', (condition, ifTrue, ifFalse) => {
	return `((${condition})and{${ifTrue}}or{${ifFalse}})[1]`;
});




/*
wiot.newOperator('strIndexOf', (str, segment) => {
	return `string.find(${str},${segment})`;
});

wiot.newOperator('strSubStr', (str, pos, length) => {
	return `string.sub(${str},${pos}${length?`,${length}`:``})`;
});
*/


wiot.newModule('breathing', (node, period_s, wire_output) => {
	let w1 = new wiot.wire(0),
	w2 = new wiot.wire(10);
	wiot.operate(node, `math.abs($1%2047-1023)`, wire_output, w2);
	wiot.operate(node, `($1+math.floor(2048*0.01/${period_s}))%2048`, w2, w1);
	wiot.buffer(node, w1, w2, .01, true);


});


module.exports = wiot;

})()