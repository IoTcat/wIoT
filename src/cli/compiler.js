(()=>{

const fs = require('fs');
const md5 = require('md5');

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



const wiot = {
	INPUT: 'gpio.INPUT',
	OUTPUT: 'gpio.OUTPUT',
	CLOCK_INTERVAL: 100,
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
			wiot.__[nid].method = wiot.__udpMethod(wiot.__[nid]);
			shortcut(wiot.__[nid], wiot.__[nid].method);
			return wiot.__[nid];
		}
	},
	__systemPrimitive: {
		wire: function(default_value = 0, isPersist = false){
			let reg = Reg();
			let wire = {
				type: 'wire',
				reg: reg,
				default: default_value,
				isPersist: isPersist,
				input: [],
				output: [],
				generate: () => {
					wire.input = uniqueArr(wire.input);
					wire.output = uniqueArr(wire.output);
					wire.input.forEach(udp => {
						let node = udp.node;
						node.setReg(reg, default_value, isPersist);
					});
					wire.output.forEach(udp => {
						let node = udp.node;
						node.setReg(reg, default_value, isPersist);
					});

					wiot.__systemPrimitive.channel(wire);
				}
			}
			return wire;
		},
		channel: (wire) => {

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
	},
	__udpMethod: (node) => ({
		trigger: function(wire, cmd){
			node.regs[wire.reg].trigger.push(cmd);
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
		}
	}),
	__systemMethod: {
		Reg: Reg
	},
	newUDP: (type, getObj, genCode) => {
		wiot.udp[type] = function(){
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
		shortcut(wiot, wiot.udp)
	},
	udp: {}
}


/* wire shortcut */
wiot.wire = wiot.__systemPrimitive.wire;



/* pre-installed udp defination */
wiot.newUDP('gpio', (mode, pin, wire, node) => ({
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


wiot.newUDP('buffer', (wire_output, wire_input, node, delay_s = 0) => ({
	node: node,
	delay_s: delay_s,
	input: [wire_input],
	output: [wire_output]
}), (o, method) => {
	let node = o.node;
	let cnt = method.Reg();
	node.setReg(cnt, 0);
	node.trigger(o.input[0], `${cnt}=${(Math.round(o.delay_s*1000/wiot.CLOCK_INTERVAL)||1)+1};`);
	node.always(`if not(${cnt}==0)then ${cnt}=${cnt}-1;end;`);
	node.always(`if ${cnt}==1 then ${o.output[0].reg}=${o.input[0].reg};end;`);
});


wiot.newUDP('operate', (expression, node, wire_output, ...wires_input) => ({
	node: node,
	expression: expression,
	input: wires_input,
	output: [wire_output]
}), (o, method) => {
	let node = o.node;
	let s = o.expression;
	o.input.forEach((wire, index) => {
		s = s.replace(new RegExp('\\$'+index, 'g'), wire.reg);
	});

	let func = method.Reg();
	node.setReg(func);

	node.prepare(`${func}=function()${o.output[0].reg}=${s};end;`);
	o.input.forEach(wire => {
		node.trigger(wire, `${func}();`);
	});
});


wiot.newUDP('pwm', (pin, wire_duty, wire_clock, node) => ({
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


wiot.newUDP('adc', (wire_output, node) => ({
	node: node,
	pin: 0,
	output: [wire_output]
}), (o, method) => {
	let node = o.node;
	node.always(`${o.output[0].reg}=adc.read(${o.pin});`);
});

module.exports = wiot;

})()