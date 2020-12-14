module.exports = (params) => {

	const md5 = require('md5');

	const serve = require(__dirname + '/serve.js')();
	const log = require(__dirname + '/lib/log.js')();



	let cache = {};
	let waitList = {};

	let f = {
		generateId: () => {
			return md5(''+new Date().valueOf()+Math.random()).substring(0, 8);
		}
	}


  	let o = {
		push: (id, cmd, body) => new Promise((resolve, reject) => {
			if(!cache.hasOwnProperty(id)){
				cache[id] = {};
			}
			let sid = f.generateId();
			cache[id][sid] = {};
			cache[id][sid][cmd] = body;
			waitList[sid] = false;

			setTimeout(()=>{
				if(waitList.hasOwnProperty(sid) && waitList[sid] !== false){
					let body = waitList[sid];
					delete waitList[sid];
					resolve(body)
				}
			}, 50);
		})
	}


	serve.add('/', (info, data) => {

		console.log(cache, waitList)
		if(data.hasOwnProperty('payload') && data.payload && Object.keys(data.payload).length){
			for(let i in data.payload){
				if(waitList.hasOwnProperty(i)){
					waitList[i] = data.payload[i];
				}
			}
		}

		if(cache.hasOwnProperty(data.id) && Object.keys(cache[data.id]).length){
			console.log('ssssddd')
			let s = JSON.stringify(cache[data.id]);
			delete cache[data.id]
			log.info(data.id, 'Type: heartbeat | res: '+JSON.stringify(info) + ' | payload: '+s);
			return s;
		}
		log.info(data.id, 'Type: heartbeat | res: '+JSON.stringify(info));
		return '';
	});

	return o ;

}