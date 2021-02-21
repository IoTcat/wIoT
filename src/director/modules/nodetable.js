module.exports = (host = '0.0.0.0', port = 4444) => {

	let cbArr = {
		income: [],
		outcome: [],
		forward: [],
		error: []
	};


	let o = {
		income: cb => { //cb(nid, info{funcID, error}, data)
			cbArr.income.push(cb);
		},
		forward: cb => { //cb(nid, info{funcID, error}, data)
			cbArr.forward.push(cb);
		},
		outgo: (nid, data) => {
			if(!nidtable.hasOwnProperty(nid) || !nidtable[nid].socket){
				flow.error('[OUTGOING]', '<nid lookup failure>', data.to+'<--'+data.from, data.name, data.body);
				return false;
			}
			nidtable[nid].socket.write(JSON.stringify(data));
			flow.log('[OUTGOING]', data.from + '-->' + data.to, data.name, data.body);
			return true;
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




	const LOG_PATH = __dirname + '/../data/log/iptable/';


	const net = require('net');
	const log4js = require('log4js');


	log4js.configure({
	  appenders: {
	    flow: {type: 'file', filename: LOG_PATH + 'flow.log'},
	    access: {type: 'file', filename: LOG_PATH + 'access.log'},
	    console: { type: 'console' }
	  },
	  categories: {
	    flow: {appenders: ['flow', 'console'], level: 'trace' },
	    access: { appenders: ['access', 'console'], level: 'trace' },
	    default: { appenders: ['access', 'console'], level: 'trace' }
	  }
	});


	const flow = log4js.getLogger('flow');
	const access = log4js.getLogger('access');


	const server = net.createServer((socket) => {
		access.trace('Unspecified', socket.remoteAddress+':'+socket.remotePort, 'New TCP request.');
		let nid = null;
		socket.on('data', (data) => {
			data = data.toString();
			if(!isJson(data)){
				access.error(nid, socket.remoteAddress+':'+socket.remotePort, 'Data is not JSON! Data::'+data);
				return;
			}
			data = JSON.parse(data);
			
			if(data.hasOwnProperty('nid') && data.hasOwnProperty('funcID')){
				nid = data.nid;
				if(!nidtable.hasOwnProperty(nid)){
					nidtable[nid] = {};
				}
				nidtable[nid].funcID = data.funcID;
				nidtable[nid].ip = socket.remoteAddress;
				nidtable[nid].ip = socket.remotePort;
				nidtable[nid].socket = socket;
				if(data.hasOwnProperty('error') && data.error){
					nidtable[nid].error = data.error;
				}
				access.info(nid, socket.remoteAddress+':'+socket.remotePort, 'New TCP connection.');
				return;
			}

			if(!nid){
				access.error(nid, socket.remoteAddress+':'+socket.remotePort, 'No nid is specified. Data::', data);
				return;
			}

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
				flow.log('[INCOMING]', data.to+'<--'+data.from, data.name, data.body);
				return;
			}



		});

		socket.on('close', function(err){
			if(nid){
				nidtable[nid].socket = null;
				nidtable[nid].ip = null;
				nidtable[nid].port = null;
			}
		})
	}).on('error', (err) => {
		
		throw err;
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