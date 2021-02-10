module.exports = async (port) => {

	const { execFile } = require('child_process');
	const path = require('path');
	const ora = require('ora');
	const root = __dirname + '/../../../';
	const nt = require('nodemcu-tool');


	const reset = () => {
		return new Promise(async (resolve, reject) => {
			await nt.hardreset(port);
			await nt.disconnect();
			resolve();
		});
	}

	return new Promise(async (resolve, reject) => {
		resolve(await reset());
	});
}
