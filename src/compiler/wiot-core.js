(()=>{

const fs = require('fs');
const md5 = require('md5');
const got = require('got');

let config = require(__dirname + '/../cli/modules/getConfig.js')();
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


module.exports = wiot;

})()