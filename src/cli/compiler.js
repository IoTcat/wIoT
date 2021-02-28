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
		let s = '';
		while(div > 0){
			rem = Math.floor(div%26);
			div = parseInt(div/26);
			s += String.fromCharCode(rem + 97);
		}
		return s;
	}
})();

const sync = sync => {

	Object.keys(wiot.__).forEach(nid => {
	    let s = '';
	    let seg = wiot.__[nid];

	    seg.head = uniqueArr(seg.head);
	    seg.body = uniqueArr(seg.body);
	    seg.loop = uniqueArr(seg.loop);
	    seg.footer = uniqueArr(seg.footer);

	    seg.head.forEach(item => s += item);
	    Object.keys(seg.regs).forEach(item =>{
	    	seg.regs[item].trigger = uniqueArr(seg.regs[item].trigger);
			if(seg.regs[item].trigger.length) s += `${item},F${item}=${seg.regs[item].default},${seg.regs[item].default};`
			else s += `${item}=${seg.regs[item].default};`
	    });
	    seg.body.forEach(item=> s += item);

	    s += 'tmr.create():alarm('+wiot.CLOCK_INTERVAL+',tmr.ALARM_AUTO,function()';

	    Object.keys(seg.regs).forEach(item =>{
	    	if(seg.regs[item].trigger.length){
	    		s += `if not(F${item}==${item})then `
	    		seg.regs[item].trigger.forEach(funcs=>{
	    			s += `${funcs}`;
	    		});
	    		s += `end;`;
	    		s += `F${item}=${item};`
	    	}
	    });

	    seg.loop.forEach(item => s += item);
	    s += 'end);';
	    seg.footer.forEach(item => s += item);

	    fs.writeFileSync(config.root+'.wiot/compiled_files/'+nid, s);

	});
}



const wiot = {
	INPUT: 'gpio.INPUT',
	OUTPUT: 'gpio.OUTPUT',
	CLOCK_INTERVAL: 30,
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
			if(wire.input.length == 1 && wire.output.length == 1 && wire.input[0] == wire.output[0]) return;
			wire.output.forEach(udp_output => {
				let node_output = udp_output.node;
				node_output.MSGonSend(wire.reg, `${wire.reg}=body;`);
			});

/*
			 let iANDo = wire.input.filter(function(v){ return wire.output.indexOf(v) > -1 });

			 iANDo.forEach(udp=>{

			 });

*/
			wire.input.forEach(udp_input => {
				let node_input = udp_input.node;
				wire.output.forEach(udp_output => {
					let node_output = udp_output.node;
					if(node_input == node_output) return;
					let s2 = node_input.MSGSend(node_output.nid, wire.reg, wire.reg);
					node_input.trigger(wire, s2);
				})
			});

		}
	},
	__udpMethod: (node) => ({
		trigger: function(wire, cmd){
			node.regs[wire.reg].trigger.push(cmd);
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
			node.footer.push(`msg.onSend('${name}',function(${fromMark},${bodyMark})${cmd}end);`);
		},
		MSGSend: function(to, name, body, proxy = false){
			return `msg.send('${to}','${name}',${body}${(proxy?',true':'')});`;
		},
		always: function(cmd){
			node.loop.push(cmd);
		},
		init: function(cmd){
			node.head.push(cmd);
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
			if(o.input){
				o.input.output.push(o);
				o.input.generate();
			}
			if(o.output){
				o.output.input.push(o);
				o.output.generate();
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
wiot.newUDP('gpio', (mode, pin, wire, node, default_output = 1) => ({
	node: node,
	pin: pin,
	mode: mode,
	[(mode==wiot.INPUT)?'output':'input']: wire,
	default_output: default_output
}), (o, method) => {
	node = o.node;
	node.init(`gpio.mode(${o.pin},${o.mode});`);
	if(o.mode == wiot.INPUT){
		node.always(`${o.output.reg}=gpio.read(${o.pin});`);
	}
	if(o.mode == wiot.OUTPUT){
		node.setReg(o.input.reg, o.default_output);
		node.trigger(o.input, `gpio.write(${o.pin},${o.input.reg});`);
	}
});


wiot.newUDP('buffer', (wire_input, wire_output, node, delay_s = 0) => ({
	node: node,
	delay_s: delay_s,
	input: wire_input,
	output: wire_output
}), (o, method) => {
	let node = o.node;
	let cnt = method.Reg();
	node.setReg(cnt, 0);
	node.trigger(o.input, `${cnt}=${(Math.round(o.delay_s*1000/wiot.CLOCK_INTERVAL)||1)+1};`);
	node.always(`if not(${cnt}==0)then ${cnt}=${cnt}-1;end;`);
	node.always(`if ${cnt}==1 then ${o.output.reg}=${o.input.reg};end;`);
});




module.exports = wiot;

})()