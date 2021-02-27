module.exports = (segment) => {

    const colors = require('colors');
    const boxen = require('boxen');
	const ora = require('ora');

    let config = require(__dirname + '/getConfig.js')();
    if(!config) return;

	let res = [];
	let ban = ora(`Searching node "${segment}"...`).start();

	for(let i of Object.keys(config.nodes)){
		let pos = i.indexOf(segment);
		if(pos != -1 && res.indexOf(i) == -1){
			res.push(i);
			ban.info(i.substring(0, pos) + String(segment).yellow + i.substring(pos + String(segment).length) + '     ' + ((typeof i.nickname == "undefined")?'':i.nickname));
			ban = new ora(`Searching node "${segment}...`).start();
		}
	}

	ban.succeed('Search finished!! Found '+res.length+' results!!');

	return res;

}
