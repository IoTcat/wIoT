module.exports = async (port) => {

	const { execFile } = require('child_process');
	const path = require('path');
	const ora = require('ora');
	const root = __dirname + '/../../../';


	const reset = () => {
		return new Promise((resolve, reject) => {
			ban = new ora(`Reset ${port}...`).start();
			let process = execFile(root + 'node_modules/.bin/nodemcu-tool.cmd', ['reset', '-p', port], (err, stdout, stderr) => {
			    if(err) {
			    	ban.fail(`${port} reset fail!!`);
			    	console.log(stderr);
			    	reject();
			    }else{
			    	ban.succeed(port+' reset successfully!!');
			    	resolve(stdout);
			    }
			});
		});
	}

	return new Promise(async (resolve, reject) => {
		resolve(await reset());
	});
}
