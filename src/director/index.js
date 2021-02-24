const logger = require(__dirname + '/modules/log.js')();
const nodetable = require(__dirname + '/modules/nodetable.js')(logger);
const node = require(__dirname + '/modules/node.js')(logger, nodetable);
const ns = require(__dirname + '/modules/ns.js')(logger, node);
const api = require(__dirname + '/modules/api.js')(logger, node, ns);


let OnlineBoard = [];

setInterval(async ()=>{
	//console.log(await node.good.restart());
	//console.log('ddd')
	//console.log(await node.good.refresh());
	//console.log(await node.good.setNS('ccc', '192.168.3.253', 6789));
	//console.log(await node.good.checkNS('ccc', '111.111.11.11', 6789));
	//console.log(await node.good.setFunc('333Func', 'tmr.create():alarm(3000, tmr.ALARM_AUTO, function() print("hello") end)'));

	/*l = await ns.get(['good', 'good3'], {
		'good': {
			'good3': {
				port: 22,
				ip: '111.222.333.44'
			}
		}
	})*/

	let online = [];
	
	Object.keys(node).forEach(nid => {
		if(node[nid].status){
			online.push(nid);
		}
	});

	if(online.some(nid => OnlineBoard.indexOf(nid) == -1)){
		await ns.set(await ns.get(online, {
		'good': {
			'good3': {
				port: 22,
				ip: '111.222.333.44'
			}
		},
		'good3': {
			'good': {
				port: 22,
				ip: '111.222.333.44'
			}
		},
	}))
	}


	OnlineBoard = online;

},10000)




