module.exports = (logger, nodetable) => {


	let nodes = {}
	const CMD_DELAY = 200;

	let delay = (time_ms) => new Promise(resolve => {
		setTimeout(()=>{
			resolve();
		}, time_ms);
	});



	const event = logger.getLogger('event');






	nodetable.newNode((nid, info) => {
		nodes[nid] = {
			send: (name, body, isudp) => {
				return nodetable.outgo(nid, {
					to: nid,
					from: "director",
					name: name,
					body: body
				}, isudp);
			},
			triggers: {
				income: [
					function(name, body){
						if(name == '__getInfo'){
							nodes[nid].info.localport = body.port;
							nodes[nid].info.localip = body.ip;
							nodes[nid].info.funcID = body.funcID;
							nodes[nid].info.HeartbeatInterval = body.HeartbeatInterval;
							nodes[nid].ns = body.ns;
							nodes[nid].LastRefreshTime = new Date().valueOf();
						}
					},
					function(name, body){
						if(name == '__checkNS'){
							if(!nodes[nid].rns.hasOwnProperty(body.from) || nodes[nid].rns[body.from].ip != body.ip || nodes[nid].rns[body.from].port != body.port){
								nodes[nid].rns[body.from] = body;
								nodes[nid].rns[body.from].updated = true;
							}
							nodes[nid].rns[body.from].LastCheckTime = new Date().valueOf();
						}
					}
				],
				connect: [],
				disconnect: [],
				restart: [],
				error: []
			},
			LastRefreshTime: 0,
			LastRestartTime: 0,
			ns: {},
			rns: {},
			on: (type, cb) => {
				nodes[nid].triggers[type].push(cb);
			},
			restart: () => new Promise((resolve) => {
				let restartTime = new Date().valueOf();
				let counter = 100;
				nodes[nid].send('__restart', '');
				let timer = () => {
					setTimeout(()=>{
						if(nodes[nid].info.LastUpTime < restartTime){
							if(counter){
								if(nodes[nid].info.LastActiveTime > restartTime + 500){
									nodes[nid].send('__restart', '');
									restartTime = new Date().valueOf();
									counter = 100;
								}
								timer();
								counter --;
							}else{
								resolve(false);
								return;
							}
						}else{
							event.info('[CMD]', '<'+nid+'>', '__restart');
							resolve(true);
							return;
						}
					}, 300);
				};
				timer();
			}),
			refresh: () => new Promise((resolve) => {
				let startTime = new Date().valueOf();
				let counter = 100;
				nodes[nid].send('__getInfo', '');
				let timer = () => {
					setTimeout(async ()=>{
						if(nodes[nid].LastRefreshTime < startTime){
							if(counter){
								if(counter == 70 || counter == 40){
									nodes[nid].send('__getInfo', '');
								}
								timer();
								counter--;
							}else{
								resolve(false);
								return;
							}
						}else{
							await delay(CMD_DELAY)
							event.info('[CMD]', '<'+nid+'>', '__refresh');
							resolve(true);
							return;
						}
					}, 300);
				};
				timer();
			}),
			setNS: (nsArr) => new Promise(async (resolve) => {


				let checkLocalNS = () => Object.keys(nodes[nid].ns).every(id => {
					if(nsArr.hasOwnProperty(id) && nodes[nid].ns[id].ip == nsArr[id].ip && nodes[nid].ns[id].port == nsArr[id].port){
						return true;
					}else{
						return false;
					}
				}) && Object.keys(nsArr).every(id => {
					if(nodes[nid].ns.hasOwnProperty(id) && nodes[nid].ns[id].ip == nsArr[id].ip && nodes[nid].ns[id].port == nsArr[id].port){
						return true;
					}else{
						return false;
					}
				});



				if(checkLocalNS()){
					resolve(true);
					return;
				}


				let body = {};
				Object.keys(nsArr).forEach(id => {
					body[id] = {
						ip: nsArr[id].ip,
						port: nsArr[id].port
					}
				});


				nodes[nid].send('__setNS', body);


				await delay(CMD_DELAY);

				if(checkLocalNS()){
					event.info('[CMD]', '<'+nid+'>', '__setNS', JSON.stringify(Object.keys(body)));
					resolve(true);
				}else{
					resolve(false);
				}
				
			}),
			checkNS: (id, ip, port) => new Promise(async (resolve) => {

				nodes[nid].send('__checkNS', {
					to: id,
					from: nid,
					ip: ip,
					port: port
				}, true);

				await delay(CMD_DELAY);

				nodes[nid].send('__checkNS', {
					to: id,
					from: nid,
					ip: ip,
					port: port
				},true);

				await delay(CMD_DELAY);

				event.info('[CMD]', '<'+nid+'>', '__checkNS', id);

			}),
			setFunc: (id, func) => new Promise(async resolve => {
				let restartTime = new Date().valueOf();
				let counter = 100;
				if(nodes[nid].info.funcID == id) {
					resolve(true);
					return;				
				}
				nodes[nid].send('__setFunc', {
					func: {
						id: id,
						online: func
					}
				});
				let timer = () => {
					setTimeout(()=>{
						if(nodes[nid].info.LastUpTime < restartTime || nodes[nid].info.funcID != id){
							if(counter){
								if(nodes[nid].info.LastActiveTime > restartTime + 500){
									nodes[nid].send('__setFunc', {
										func: {
											id: id,
											online: func
										}
									});
									restartTime = new Date().valueOf();
									counter = 100;
								}
								timer();
								counter --;
							}else{
								resolve(false);
								return;
							}
						}else{
							event.info('[CMD]', '<'+nid+'>', '__setFunc', id, func);
							resolve(true);
							return;
						}
					}, 300);
				};
				timer();
			})
		};
		nodes[nid].info = info;
	});


	nodetable.connect((nid, info) => {
		nodes[nid].status = true;
		if(new Date().valueOf() < nodes[nid].info.LastUpTime + nodes[nid].info.HeartbeatInterval){
			nodes[nid].triggers.restart.forEach(cb => {
				cb();
			});
			nodes[nid].LastRestartTime = new Date().valueOf();
			event.info('[RESTART]', '<'+nid+'>', '{'+info.funcID+'}');
		}
		nodes[nid].triggers.connect.forEach(cb => {
			cb();
		});
		event.info('[CONNECT]', '<'+nid+'>', '{'+info.funcID+'}');

	});
	

	nodetable.disconnect((nid, info) => {
		nodes[nid].status = false;
		nodes[nid].triggers.disconnect.forEach(cb => {
			cb();
		});
		event.info('[DISCONNECT]', '<'+nid+'>', '{'+info.funcID+'}');
	});

	nodetable.income((nid, info, data) => {
		nodes[nid].status = true;
		nodes[nid].triggers.income.forEach(cb => {
			cb(data.name, data.body);
		});
	});


	nodetable.error((nid, info) => {
		nodes[nid].triggers.error.forEach(cb => {
			cb(info.error);
		});
		event.error('[ERROR]', '<'+nid+'>', '{'+info.funcID+'}', info.error);
	});


	return nodes;
}