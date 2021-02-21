module.exports = (params) => {

	const md5 = require('md5');

	const serve = require(__dirname + '/serve.js')();
	const log = require(__dirname + '/lib/log.js')();



	let waitList = {};
	let reg = {};

	let f = {
		generateId: () => {
			return md5(''+new Date().valueOf()+Math.random()).substring(0, 8);
		}
	}


  	let o = {
		push: (id, cmd, body, cb) => new Promise((resolve, reject) => {
			if(!waitList.hasOwnProperty(id)){
				waitList[id] = {};
			}
			let sid = f.generateId();
			waitList[id][sid] = {};
			waitList[id][sid].body = JSON.stringify({
				fid: cmd,
				sid: sid,
				body: body
			});
			waitList[id][sid].res = false;

			let lstn = ()=>{
				if(waitList.hasOwnProperty(id) && waitList[id].hasOwnProperty(sid) && waitList[id][sid].res !== false && waitList[id][sid].res !== null){
					let body = waitList[id][sid].res;
					delete waitList[id][sid];
					if(typeof cb == "function"){
						cb(body)
					}
					resolve(body)
				}else{
					setTimeout(lstn, 50);
				}
			}
			lstn();
		})
	}


	serve.add('/', (info, data) => {

		if(!data.hasOwnProperty('id')){
			return;
		}

		// First heartbeat
		if(!waitList.hasOwnProperty(data.id)){
			waitList[data.id] = {};
		}

		// cmd response
		if(data.hasOwnProperty('sid') && data.sid){
			if(waitList.hasOwnProperty(data.id) && waitList[data.id].hasOwnProperty(data.sid)){
				waitList[data.id][data.sid].res = data.body;
			}
		}
		//heartbeat-cmd
		for(let i in waitList[data.id]){
			if(waitList[data.id][i].res === false){
				log.info(data.id, 'Type: heartbeat-cmd | res: '+JSON.stringify(data) + ' | payload: '+waitList[data.id][i].body);
				waitList[data.id][i].res = null;
				return waitList[data.id][i].body;
			}
		};
		//heartbeat without cmd
		log.info(data.id, 'Type: heartbeat | res: '+JSON.stringify(data));
		return ;
	});

	return o ;

}