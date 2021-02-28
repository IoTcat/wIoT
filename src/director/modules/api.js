module.exports = (logger, node, ns) => {


	const log = logger.getLogger('weblog');
	const express = require('express');
	const app = express()
	const port = 3001;

	app.get('/', (req, res) => {
	  	res.send('Hello World!')
	})

	app.listen(port, () => {
	  	log.info('API web server begin at ', port);
	})

function isJson(str) {
        try {
            if (typeof JSON.parse(str) == "object") {
                return true;
            }
        } catch(e) {
        }
        return false;
    }

	app.get('/status', (req, res) => {
		if(!req.query.hasOwnProperty('query')){
			res.status(500).send();
			return;
		}
		if(!isJson(req.query.query)){
			res.status(500).send();
			return;
		}

		let query = JSON.parse(req.query.query);

		let resData = {};
		query.forEach(nid => {
			if(node.hasOwnProperty(nid)){
				resData[nid] = {};
				resData[nid].status = node[nid].status;
				resData[nid].funcID = node[nid].info.funcID;
				resData[nid].port = node[nid].info.localport;
				resData[nid].ip = node[nid].info.localip;
				resData[nid].ns = node[nid].ns;
				resData[nid].heap = node[nid].info.heap;
				resData[nid].spiff = node[nid].info.spiff;
				resData[nid].HeartbeatInterval = node[nid].info.HeartbeatInterval;
				resData[nid].LastUpTime = node[nid].info.LastUpTime;
				resData[nid].LastActiveTime = node[nid].info.LastActiveTime;
				resData[nid].LastRefreshTime = node[nid].LastRefreshTime;
				resData[nid].LastRestartTime = node[nid].LastRestartTime;
			}
		});

		res.send(resData);
		log.info('[status]', JSON.stringify(req.query.query));
	})



	app.get('/setFunc', async (req, res) => {
		if(!req.query.hasOwnProperty('nid') || !req.query.hasOwnProperty('funcID') || !req.query.hasOwnProperty('func')){
			res.status(500).send();
			return;
		}

		let nid = req.query.nid,
			funcID = req.query.funcID,
			func = new Buffer(req.query.func, 'base64').toString()

		if(!node.hasOwnProperty(nid)){
			res.status(404).send();
			return;
		}


		if(!node[nid].status){
			res.status(503).send();
			return;
		}


		let status = await node[nid].setFunc(funcID, func);



		res.send({status: status});
		log.info('[setFunc]', '<'+nid+'>', funcID, status);
	})



	app.get('/restart', async (req, res) => {
		if(!req.query.hasOwnProperty('nid')){
			res.status(500).send();
			return;
		}

		let nid = req.query.nid;

		if(!node.hasOwnProperty(nid)){
			res.status(404).send();
			return;
		}


		if(!node[nid].status){
			res.status(503).send();
			return;
		}


		let status = await node[nid].restart();
		res.send({status: status});
		log.info('[restart]', '<'+nid+'>', status);
	})





	app.get('/log', (req, res) => {
		if(!req.query.hasOwnProperty('type') || !req.query.hasOwnProperty('start')){
			res.status(500).send();
			return;
		}

		res.send();
		log.info('[log]', req.query.type);
	})





	return null;
}