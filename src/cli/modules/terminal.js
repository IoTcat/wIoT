module.exports = async (port) => {

	const { execFile } = require('child_process');
	const path = require('path');
	const ora = require('ora');
	const root = __dirname + '/../../../';

	let cache = '';

	const upload = () => {
		return new Promise((resolve, reject) => {
			let process = execFile(root + 'node_modules/.bin/nodemcu-tool.cmd', ['terminal', '-p', port], (err, stdout, stderr) => {
			    if(err) {
			    	console.log(stderr);
			    	reject();
			    }else{
			    	resolve(stdout);
			    }
			});
			process.stdout.on('data', (data) => {
				cache += String(data);
				if(data.indexOf('\n') != -1){
					console.log(cache);
					cache = '';
				}
			});
		});
	}

	return new Promise(async (resolve, reject) => {
		resolve(await upload());
	});
}
