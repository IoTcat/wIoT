module.exports = (logger, node, nodetable) => {


	const log = logger.getLogger('nslog');



	const NS_DELAY = 2000;


	let delay = (time_ms) => new Promise(resolve => {
		setTimeout(()=>{
			resolve();
		}, time_ms);
	});



	let o = {
		get: (nodeArr, refer) => new Promise(async resolve => {
			let list = [];
			nodeArr.forEach(nid => {
				if(node.hasOwnProperty(nid)){
					list.push(nid);
				}
			});

			let nsList = {};
			let beginTime = new Date().valueOf();
			for(nid1 of list){
				for(nid2 of list){
					if(nid1 != nid2){
						log.info('[CHECK]', nid2, '-->', nid1);
						await node[nid2].checkNS(nid1, refer && refer[nid2] && refer[nid2][nid1] && refer[nid2][nid1].ip || node[nid1].info.localip, refer && refer[nid2] && refer[nid2][nid1] && refer[nid2][nid1].port || node[nid1].info.localport)
					}
				}
			};

			await delay(NS_DELAY);

			list.forEach(nid => {
				Object.keys(node[nid].rns).forEach(nid2 => {
					let rns = node[nid].rns[nid2];
					if(rns.LastCheckTime > beginTime){
						log.info('[VERIFIED]', nid2, '-->', nid);
						if(!nsList.hasOwnProperty(nid2)){
							nsList[nid2] = {};
						}
						nsList[nid2][nid] = {
							ip: rns.ip,
							port: rns.port
						}
					}
				});
			});


			resolve(nsList);

		}),
		set: (nsList) => new Promise(async resolve => {
			let status = true;
			Object.keys(nsList).forEach(async nidf => {
				log.info('[SET]', nidf, '::', JSON.stringify(nsList[nidf]));
				status = status && await node[nidf].setNS(nsList[nidf]);
			});
			resolve(status);
		})
	}



	return o;
}