module.exports = async (port, bin) => {

	const { execFile } = require('child_process');
	const path = require('path');
	const ora = require('ora');
	const root = __dirname + '/../../../';


	const getDevList = () => {
		return new Promise((resolve, reject) => {
			ban = new ora(`Flashing...`).start();
			let process = execFile(root + 'lib/esptool-ck/esptool.exe', ['-cp', port, '-cd', 'nodemcu', '-ca', '0x00000', '-cf', bin], (err, stdout, stderr) => {
			    if(err) {
			    	console.log(stderr);
			    	reject();
			    }
                resolve(stdout);
			});
			process.stdout.on('data', (data) => {
	
				if(data.toString().substring(0, 3) == '. ['){
					ban.info('Flashing...' + data.toString().substring(1, 9));
				}
				if(data.toString().indexOf('[ 100% ]') != -1){
					ban.succeed('Flash finished!!');
				}
			});
		});
	}

	return new Promise(async (resolve, reject) => {
		resolve(await getDevList());
	});
}
