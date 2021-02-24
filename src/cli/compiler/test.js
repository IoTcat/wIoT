const md5 = (str) => {
	let hash = require('crypto').createHash('sha256');
	hash.update(str.toString());
	return hash.digest('hex');
}
const g = () => {
	let s = md5(Math.random());

	for(let index in s.split('')){
		if(s.split('')[index] != 0 && !Number(s.split('')[index])) {return s.substring(Number(index), Number(index)+3);}
	}
}



const wiot = {
	INPUT: 'gpio.INPUT',
	OUTPUT: 'gpio.OUTPUT',
	__: {

	},
	node: {
		nodemcu: (nid) => {
			wiot.__[nid] = {
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
				nid: nid
			}
		}
	},
	udp: {
		gpio: (mode, pin, wire, node) => {
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
				wiot.__[node.nid].head.push(`${wire.id}=0;`);
				wiot.__[node.nid].loop.push(`gpio.write(${pin},${wire.id});`);
				o.input = wire;
				wire.output.push(o);
			}
			wire.generate(wire);
			return o;
		},
		trigger: (wire, node) => {

		},
		wire: () => {
			let id = g();
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
			nodes_output.forEach(node_output => {
				let s = `msg.onSend('${wire.id}',function(f,b) ${wire.id}=b; end);`;
				if(wiot.__[node_output.nid].footer.indexOf(s) == -1) wiot.__[node_output.nid].footer.push(s);
			});

			nodes_input.forEach(node_input => {
				let s1 = `if not (f_${wire.id}==${wire.id}) then `;
				let s3 = `end;f_${wire.id}=${wire.id};`;
				if(wiot.__[node_input.nid].loop.indexOf(s1) != -1) wiot.__[node_input.nid].loop.splice(wiot.__[node_input.nid].loop.indexOf(s1), 1);
				if(wiot.__[node_input.nid].loop.indexOf(s3) != -1) wiot.__[node_input.nid].loop.splice(wiot.__[node_input.nid].loop.indexOf(s3), 1);
				wiot.__[node_input.nid].loop.push(s1);
				nodes_output.forEach(node_output => {
					let s2 = `msg.send('${node_output.nid}','${wire.id}',${wire.id});`;
					if(wiot.__[node_input.nid].loop.indexOf(s2) != -1) wiot.__[node_input.nid].loop.splice(wiot.__[node_input.nid].loop.indexOf(s2), 1);
					wiot.__[node_input.nid].loop.push(s2);
				})
				wiot.__[node_input.nid].loop.push(s3);
			});

		}
	}
}



let nodemcu1 = wiot.node.nodemcu('good');
let nodemcu2 = wiot.node.nodemcu('good3');
let nodemcu3 = wiot.node.nodemcu('good4');

let w1 = wiot.udp.wire()//,
//	w2 = wiot.udp.wire();


//let buf = wiot.udp.buffer(w1, w2, nodemcu1);

let pin1 = wiot.udp.gpio(wiot.INPUT, nodemcu1.D3, w1, nodemcu1);

let pin2 = wiot.udp.gpio(wiot.OUTPUT, nodemcu2.D4, w1, nodemcu2);

let pin3 = wiot.udp.gpio(wiot.OUTPUT, nodemcu3.D4, w1, nodemcu3);



const fs = require('fs');

Object.keys(wiot.__).forEach(nid => {
	let s = '';
	let seg = wiot.__[nid];
	seg.head.forEach(item => s += item);
	seg.body.forEach(item=> s += item);

	s += 'tmr.create():alarm(100, tmr.ALARM_AUTO, function()';
	seg.loop.forEach(item => s += item);
	s += ' end);';

	seg.footer.forEach(item => s += item);

	fs.writeFileSync('./'+nid+'.lua', /*new Buffer(*/s/*).toString('base64')*/);

});