const md5 = (str) => {
	let hash = require('crypto').createHash('sha256');
	hash.update(str.toString());
	return hash.digest('hex');
}


const reg = (() => {
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
const fs = require('fs');
let config = require(__dirname + '/modules/getConfig.js')();
if(!config) return;


const wiot = {
	INPUT: 'gpio.INPUT',
	OUTPUT: 'gpio.OUTPUT',
	CLOCK_INTERVAL: 100,
	__: {

	},
	node: {
		nodemcu: function(nid){
			wiot.__[nid] = {
				reg: {},
				head: [],
				body: [],
				loop: [],
				footer: []
			}
			return {
				D1: 1,
				D2: 2,
				D3: 3,
				D4: 4,
				D5: 5,
				D6: 6,
				D7: 7,
				D8: 8,
				nid: nid
			}
		}
	},
	udp: {
		gpio: function(mode, pin, wire, node, default_output = 1){
			let o = {
				udp: 'pin',
				node: node,
				mode, mode,
				pin: pin
			};
			wiot.__[node.nid].head.push(`gpio.mode(${pin},${mode});`);
			if(mode == wiot.INPUT){
				wiot.__[node.nid].loop.push(`${wire.id}=gpio.read(${pin});`);
				o.output = wire;
				wire.input.push(o);
			}
			if(mode == wiot.OUTPUT){
				if(Object.keys(wiot.__[node.nid].reg).indexOf(wire.id) == -1) wiot.__[node.nid].reg[wire.id] = {
					default: 0,
					trigger: []
				};
				wiot.__[node.nid].reg[wire.id].default = default_output;
				wiot.__[node.nid].reg[wire.id].trigger.push(`gpio.write(${pin},${wire.id});`);
				o.input = wire;
				wire.output.push(o);
			}
			wire.generate(wire);
			sync();
			return o;
		},
		trigger: (wire, node) => {

		},
		wire: function(){
			let id = reg();
			return {
				upd: 'wire',
				id: id,
				input: [],
				output: [],
				generate: (wire) => {
					let nodes_input = [],
						nodes_output = [];

					wire.input.forEach(udp => {
						if(nodes_input.indexOf(udp.node) == -1){
							nodes_input.push(udp.node);
						}
					});

					wire.output.forEach(udp => {
						if(nodes_output.indexOf(udp.node) == -1){
							nodes_output.push(udp.node);
						}
					});


					wiot.udp.channel(wire, nodes_input, nodes_output);
				}
			}
		},
		channel: (wire, nodes_input, nodes_output) => {
			if(nodes_input.length == 1 && nodes_output.length == 1 && nodes_input[0] == nodes_output[0]) return;
			nodes_output.forEach(node_output => {
				let s = `msg.onSend('${wire.id}',function(_f,_b) ${wire.id}=_b; end);`;
				wiot.__[node_output.nid].footer.push(s);
				if(Object.keys(wiot.__[node_output.nid].reg).indexOf(wire.id) == -1) wiot.__[node_output.nid].reg[wire.id] = {
					default: 0,
					trigger: []
				};
			});

			nodes_input.forEach(node_input => {

				if(Object.keys(wiot.__[node_input.nid].reg).indexOf(wire.id) == -1) wiot.__[node_input.nid].reg[wire.id] = {
					default: 0,
					trigger: []
				};
				nodes_output.forEach(node_output => {
					if(node_input == node_output) return;
					let s2 = `msg.send('${node_output.nid}','${wire.id}',${wire.id});`;
					wiot.__[node_input.nid].reg[wire.id].trigger.push(s2);
				})
			});

		},
		delay: function(wire_input, wire_output, delay_s, node){
			let o = {
				udp: 'delay',
				node: node,
				delay_s: delay_s,
				input: wire_input,
				output: wire_output
			};
			let cnt = reg();
			if(Object.keys(wiot.__[node.nid].reg).indexOf(cnt) == -1) wiot.__[node.nid].reg[cnt] = {
				default: 0,
				trigger: []
			};
			wiot.__[node.nid].reg[cnt].default = 0;
			if(Object.keys(wiot.__[node.nid].reg).indexOf(o.input.id) == -1) wiot.__[node.nid].reg[o.input.id] = {
				default: 0,
				trigger: []
			};
			wiot.__[node.nid].reg[o.input.id].trigger.push(`${cnt}=${Math.round(delay_s*1000/wiot.CLOCK_INTERVAL)+1};`);
			wiot.__[node.nid].loop.push(`if not (${cnt}==0) then ${cnt}=${cnt}-1;end;`);
			wiot.__[node.nid].loop.push(`if ${cnt}==1 then ${o.output.id}=${o.input.id};end;`);
			wire_input.output.push(o);
			wire_output.input.push(o);


			wire_input.generate(wire_input);
			wire_output.generate(wire_output);
			sync();
			return o;
		}
	}
}


function sync(){

	Object.keys(wiot.__).forEach(nid => {
	    let s = '';
	    let seg = wiot.__[nid];

	    seg.head = [...new Set(seg.head)];
	    seg.body = [...new Set(seg.body)];
	    seg.loop = [...new Set(seg.loop)];
	    seg.footer = [...new Set(seg.footer)];

	    seg.head.forEach(item => s += item);
	    Object.keys(seg.reg).forEach(item =>{
	    	seg.reg[item].trigger = [...new Set(seg.reg[item].trigger)];
			if(seg.reg[item].trigger.length) s += `${item},f_${item}=${seg.reg[item].default},${seg.reg[item].default};`
			else s += `${item}=${seg.reg[item].default};`
	    });
	    seg.body.forEach(item=> s += item);

	    s += 'tmr.create():alarm('+wiot.CLOCK_INTERVAL+', tmr.ALARM_AUTO, function()';

	    Object.keys(seg.reg).forEach(item =>{
	    	if(seg.reg[item].trigger.length){
	    		s += `if not (f_${item}==${item}) then `
	    		seg.reg[item].trigger.forEach(funcs=>{
	    			s += `${funcs}`;
	    		});
	    		s += ` end;`;
	    		s += `f_${item}=${item};`
	    	}
	    });

	    seg.loop.forEach(item => s += item);
	    s += ' end);';
	    seg.footer.forEach(item => s += item);

	    fs.writeFileSync(config.root+'.wiot/compiled_files/'+nid, s);

	});
}

module.exports = wiot;