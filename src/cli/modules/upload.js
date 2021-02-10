module.exports = async (port, file) => {

	const { execFile } = require('child_process');
	const path = require('path');
	const ora = require('ora');
	const root = __dirname + '/../../../';
	

	const upload = () => {
		return new Promise((resolve, reject) => {
			//ban = new ora(`Upload ${file}...`).start();
			let process = execFile(root + 'node_modules/.bin/nodemcu-tool.cmd', ['upload', '-p', port, file], async (err, stdout, stderr) => {
			    if(err) {
			    	//ban.fail(`${file} uploaded!!`);
			    	//console.log(stderr);
			    	setTimeout(async ()=>{resolve(await upload())}, 1000);
			    }else{
			    	//ban.succeed(file+' uploaded!!');
			    	resolve(stdout);
			    }
			});
		});
	}

	return new Promise(async (resolve, reject) => {
		resolve(await upload());
	});
}
