module.exports = () => {
	let o = {
		device: {
			nodemcu: id => {

				let service = {};

				let act = {
					clear: () => new Promise(async resolve => {
						let res = await send(id, 'clear', '');
						if(res.status){
							resolve(true);
						}else{
							resolve(false);
						}
					}),
					refresh: () => new Promise(async resolve => {
						let res = await send(id, 'refresh', '');
						if(res.status){
							resolve(true);
						}else{
							resolve(false);
						}
					}),
					getConstruct: () => {
						let s = '';
						for(let fid in service){
							if(service[fid].hasOwnProperty('construct') && service[fid].construct){
								s += service[fid].construct;
								s += ' ';
							}
						}
						s += '';
						return s;
					},
					getDestruct: () => {
						let s = '';
						for(let fid in service){
							if(service[fid].hasOwnProperty('destruct') && service[fid].destruct){
								s += service[fid].destruct;
								s += ' ';
							}
						}
						s += '';
						return s;
					},
					getMainTbl: () => {
						let tbl = {};
						for(let fid in service){
							if(service[fid].hasOwnProperty('main') && service[fid].main){
								tbl[fid] = service[fid].main;
							}
						}
						return tbl;
					}
				}


				let o = {
					id: id,
					pin: {
						D0: 0,
						D1: 1,
						D2: 2,
						D3: 3,
						D4: 4,
						D5: 5,
						D6: 6,
						D7: 7,
						D8: 8,
						A0: 0
					},
					service: {
						add: (fid, main, construct, destruct) => {
							service[fid] = {};
							service[fid].main = main;
							service[fid].construct = construct || '';
							service[fid].destruct = destruct || '';
						},
						del : (fid) => {
							if(service.hasOwnProperty(fid)){
								delete service[fid];
							}
						},
						clear: () => {
							service = {}
						},
						list: () => service,
						push: () => new Promise(async (resolve, reject) => {
							let construct = act.getConstruct();
							let destruct = act.getDestruct();
							let mainTbl = act.getMainTbl();

							await act.clear();

							await push(id, 'construct', construct);

							await push(id, 'destruct', destruct);

							for(let fid in mainTbl){
								await push(id, fid, mainTbl[fid]);
							}

							await act.refresh();

							let res = await send(id, 'list', '');

							let flag = Object.keys(mainTbl).every(val => Object.keys(res).indexOf(val) != -1)

							resolve(flag);

						})
					}
				}

				return o;

			}
		},
		module: {
			led: (dev, pin) => {
				let o = {
					breath: (val) => {
						if(typeof val == "number") dev.service.add('led', ``, `pwm.setup(${pin}, 100, 512);pwm.start(${pin});local n = 0; timer = tmr.create(); timer:register(10, tmr.ALARM_AUTO, function() pwm.setduty(${pin}, math.abs((n*${Math.floor(1024*2*10/val)})%(1022*2) - 1023)); n = n + 1; end);timer:start();`, `timer:unregister();timer = nil;pwm.close(${pin})`);
						if(typeof val == "object") {
							dev.service.add('led', `function(s) G.val = s; end`, `G.val = 2;pwm.setup(${pin}, 100, 512);pwm.start(${pin});local n = 0; timer = tmr.create(); timer:register(10, tmr.ALARM_AUTO, function() pwm.setduty(${pin}, math.abs((n*G.val)%(1022*2) - 1023)); n = n + 1; end);timer:start();`, `timer:unregister();timer = nil;pwm.close(${pin})`);
							val.reg('192.168.3.225', '5678', 'led')
						}
						//dev.service.add('led'+val, '', `print("cons")`, `print("dest")`);
					}
				}
				return o;
			},
			sensor: (dev, pin) => {
				let o = {
					reg: (ip, port, fip) => {
						dev.service.add('sensor', '', `local fVal = false; timer = tmr.create(); timer:alarm(300, tmr.ALARM_AUTO, function() local v = adc.read(0) if not (v > 400) == fVal then fVal=(v>400); print(v); if v> 400 then w.send('${ip}', ${port}, '${fip}', 15) else w.send('${ip}', ${port}, '${fip}', 5) end end end);`, `timer:unregister();timer = nil;pwm.close(${pin})`);
					}
				}
				return o;
			}
		}
	}


	const request = require('request');


	let send = (id, fid, body) => new Promise((resolve, reject) => {
		request(`http://127.0.0.1:8081/?id=${id}&fid=${fid}&body=${new Buffer(JSON.stringify([body])).toString('base64')}`, (err, req, res) => {
			console.log('Sent '+fid +' to '+id)
			if(typeof res == "string"){
				try{
					res = JSON.parse(res)
				}catch(e){

				}
			}
			if(err){
				resolve(false)
			}else{
				console.log(res)
				if(!res.status){
					resolve(false);
				}else{
					resolve(res.data)
				}
			}
		});
	});

	let push = (id, fid, body) => new Promise(async resolve => {
		let obj = {
			"hash": fid,
			"func": body
		}
		console.log(obj)
		let res = await send(id, 'push', obj);
		resolve(res);
	})


	return o;
}