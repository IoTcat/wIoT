module.exports = () => {

    const colors = require('colors');
    const boxen = require('boxen');
    const table = require('cli-table');
    const ora = require('ora');
    const fs = require('fs');


    let path = './';


    for(let i = 0; i < 30; i ++){
    	if(fs.readdirSync(path).indexOf('.wiot') !== -1 && fs.existsSync(path + 'config.json') && fs.existsSync(path + '.wiot/__hash')){
            if(fs.readdirSync(path + '.wiot').indexOf('cache') == -1){
                fs.mkdirSync(path + '.wiot/cache');
                fs.writeFileSync(path + '.wiot/cache/.gitignore', '*', 'utf-8');
            }

    		let config = JSON.parse(fs.readFileSync(path + 'config.json'));
    		config.root = path;
    		config.hash = fs.readFileSync(path + '.wiot/__hash', 'utf-8');
    		return config;
    	}
    	path = '../' + path;
    }

    require(__dirname + '/error.js')('No wIoT project selected!\nAre you in a wIoT project folder?');
	  return null;
}
