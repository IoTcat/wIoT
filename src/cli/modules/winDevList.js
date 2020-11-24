module.exports = async () => {

	const { exec } = require('child_process');
	const path = require('path');


	const getDevList = (port) => {
		return new Promise((resolve, reject) => {
			exec('mode ' + port, {}, (err, stdout, stderr) => {
			    if(!err) {
			    	resolve(true);
			    }else{
			    	resolve(false);
			    }
			});
		});
	}

	return new Promise(async (resolve, reject) => {
		let o = [];
		for(let i = 0; i < 30; i ++){
			if(await getDevList('COM' + i)){
				o.push('COM' + i);
			}
		}
		resolve(o);
	});
}
