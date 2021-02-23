module.exports = (logger, host = '0.0.0.0', port = 6789) => {

	let cbArr = {
		income: [],
		outgo: [],
		forward: [],
		newNode: [],
		connect: [],
		disconnect: [],
		error: []
	};


	let o = {
		income: cb => { //cb(nid, info{funcID, error}, data)
			cbArr.income.push(cb);
		},
		forward: cb => { //cb(nid, info{funcID, error}, data)
			cbArr.forward.push(cb);
		},
		outgo: (nid, data, isudp) => {
			if(!nidtable.hasOwnProperty(nid) || !nidtable[nid].socket || (!nidtable[nid].status && !isudp)){
				flow.error('[OUTGOING]', '<nid lookup failure>', data.to+'<--'+data.from, data.name, data.body);
				return false;
			}
			try{
				nidtable[nid].socket.write(JSON.stringify(data));
				if(!isudp) nidtable[nid].status = false;
			}catch(e){
				flow.error('[OUTGOING]', '<nid lookup failure>', data.to+'<--'+data.from, data.name, data.body);
			}
			
			cbArr.outgo.forEach(cb => {
				cb(nid, nidtable[nid], data);
			});
			flow.log('[OUTGOING]', data.from + '-->' + data.to, data.name, data.body);
			return true;
		},
		newNode: cb => {
			cbArr.newNode.push(cb);
		},
		connect: cb => {
			cbArr.connect.push(cb);
		},
		disconnect: cb => {
			cbArr.disconnect.push(cb);
		},
		error: cb => {
			cbArr.error.push(cb);
		}
	}



	let nidtable = {}



function isJson(str) {
        try {
            if (typeof JSON.parse(str) == "object") {
                return true;
            }
        } catch(e) {
        }
        return false;
    }


    const net = require('net');



	const flow = logger.getLogger('flow');
	const access = logger.getLogger('access');


	const server = net.createServer((socket) => {
		access.trace('Unspecified', socket.remoteAddress+':'+socket.remotePort, 'New TCP request.');
		socket.setKeepAlive(true);
		let nid = null;
		socket.on('data', (data) => {
			data = data.toString();
			if(!isJson(data)){
				access.error(nid, socket.remoteAddress+':'+socket.remotePort, 'Data is not JSON! Data::'+data);
				return;
			}
			data = JSON.parse(data);
			
			if(data.hasOwnProperty('nid') && data.hasOwnProperty('funcID') && data.hasOwnProperty('port') && data.hasOwnProperty('ip') && data.hasOwnProperty('HeartbeatInterval') && data.hasOwnProperty('uptime')){
				nid = data.nid;
				let isNew = false;
				if(!nidtable.hasOwnProperty(nid)){
					nidtable[nid] = {};
					isNew = true;
				}
				if(nidtable[nid].socket){
					nidtable[nid].socket.destroy();
					nidtable[nid].socket = null;
					nidtable[nid].ip = null;
					nidtable[nid].port = null;
					access.info(nid, socket.remoteAddress+':'+socket.remotePort, '[CLOSE]');
					cbArr.disconnect.forEach(cb => {
						cb(nid, nidtable[nid]);
					});
				}
				nidtable[nid].status = true;
				nidtable[nid].funcID = data.funcID;
				nidtable[nid].localport = data.port;
				nidtable[nid].localip = data.ip;
				nidtable[nid].HeartbeatInterval = data.HeartbeatInterval;
				nidtable[nid].LastUpTime = new Date().valueOf() - data.uptime*1000;
				nidtable[nid].LastActiveTime = new Date().valueOf();
				nidtable[nid].ip = socket.remoteAddress;
				nidtable[nid].port = socket.remotePort;
				nidtable[nid].socket = socket;

				socket.setTimeout(2.2 * nidtable[nid].HeartbeatInterval);


				if(isNew){
					cbArr.newNode.forEach(cb => {
						cb(nid, nidtable[nid]);
					});
				}
				if(data.hasOwnProperty('error') && data.error){
					nidtable[nid].error = data.error;
					cbArr.error.forEach(cb => {
						cb(nid, nidtable[nid]);
					});
				}
				cbArr.connect.forEach(cb => {
					cb(nid, nidtable[nid]);
				});



				access.info(nid, socket.remoteAddress+':'+socket.remotePort, 'New TCP connection. Data::', JSON.stringify(data));
				return;
			}

			if(!nid){
				access.error(nid, socket.remoteAddress+':'+socket.remotePort, 'No nid is specified. Data::', data);
				return;
			}
			nidtable[nid].LastActiveTime = new Date().valueOf();
			nidtable[nid].status = true;

			if(data.hasOwnProperty('uptime') && data.hasOwnProperty('heap') && data.hasOwnProperty('spiff')){
				nidtable[nid].LastUpTime = new Date().valueOf() - data.uptime*1000;
				nidtable[nid].heap = data.heap;
				nidtable[nid].spiff = data.spiff;
				access.info(nid, socket.remoteAddress+':'+socket.remotePort, '[HEARTBEAT]', data);
				return;
			}

			if(!data.hasOwnProperty('from') || !data.hasOwnProperty('to') || !data.hasOwnProperty('name') || !data.hasOwnProperty('body')){
				access.error(nid, socket.remoteAddress+':'+socket.remotePort, 'Illegal package format. Data::', data);
				return;
			}


			if(data.to != 'director'){
				if(nidtable.hasOwnProperty(data.to)){
					nidtable[data.to].socket.write(JSON.stringify(data));
					flow.log('[FORWARD]', data.to+'<--'+data.from, data.name, data.body);
				}else{
					flow.error('[FORWARD]', '<nid lookup failure>', data.to+'<--'+data.from, data.name, data.body);
				}
				cbArr.forward.forEach(cb => {
					cb(nid, nidtable[nid], data);
				});
				return;
			}


			if(data.to == 'director'){
				cbArr.income.forEach(cb => {
					cb(nid, nidtable[nid], data);
				});
				flow.log('[INCOMING]', data.to+'<--'+data.from, data.name, data.body );
				return;
			}



		});

		socket.setTimeout(60 * 1000);
		socket.on('timeout', () => {
		  access.info(nid, socket.remoteAddress+':'+socket.remotePort, '[TIMEOUT]', 'After', socket.timeout, 'ms');
			nidtable[nid].socket = null;
			nidtable[nid].ip = null;
			nidtable[nid].port = null;
			nidtable[nid].status = false;
			access.info(nid, socket.remoteAddress+':'+socket.remotePort, '[CLOSE]');
			cbArr.disconnect.forEach(cb => {
				cb(nid, nidtable[nid]);
			});

		  socket.destroy();
		});

		socket.on('error', function(err){
			access.error(nid, socket.remoteAddress+':'+socket.remotePort, '[ERROR]', 'Exist unsent package');
		});

		socket.on('close', function(err){
			if(nid && nidtable[nid].socket === socket){
				nidtable[nid].socket = null;
				nidtable[nid].ip = null;
				nidtable[nid].port = null;
				nidtable[nid].status = false;
				access.info(nid, socket.remoteAddress+':'+socket.remotePort, '[CLOSE]');
				cbArr.disconnect.forEach(cb => {
					cb(nid, nidtable[nid]);
				});
			}
		})
	}).on('error', (err) => {
		
		access.error('[ERROR]', 'Exist unsent package');
	});

	// Grab an arbitrary unused port.
	server.listen({
		host: host,
		port: port,
		exclusive: true
	}, () => {
		access.info('TCP Server Begin at ', host + ':' + port);
	});




	return o;



}