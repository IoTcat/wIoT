module.exports = (argv) => {

	const ora = require('ora');
	const fs = require('fs');
    const error = require(__dirname + '/error.js');
    const colors = require('colors');
    const boxen = require('boxen');
    const Table = require('cli-table');
    const nidMatch = require(__dirname + '/nidMatch.js');
    const got = require('got');
    const timeago = require('timeago.js');
    const inquirer = require('inquirer');
    const md5 = require('md5');


        let config = require(__dirname + '/getConfig.js')();
        if(!config) return;
        let dir = config.root + '.wiot/compiled_files/';
        let entrance =  process.cwd() + '/' + config.root + config.entrance;
        if(argv.entrance){
            entrance = process.cwd() + '/' +  argv.entrance;
        }


        fs.rmdirSync(dir, {
            recursive: true
        });
        config = require(__dirname + '/getConfig.js')();
        if(!config) return;

        try{
            require(entrance);


        }catch(e){
            error('Error occors in ' + (argv.entrance || config.entrance));
            console.error(e);
            return;
        }

        fs.readdirSync(dir).forEach(item => {
            if(!config.nodes.hasOwnProperty(item)){
                error('Cannot found nid "'+item+'"! Please check your code!');
                throw null;
            }
        });

        Object.keys(config.nodes).forEach(async nid => {
            let ban = new ora(`${nid}: compileing...`).start();
            let funcID, size;
            if(fs.existsSync(dir+nid)) {
            	funcID = md5(fs.readFileSync(dir+nid, 'utf-8')).substring(0, 5);
            	size = fs.lstatSync(dir+nid).size;
            }
            else {
            	funcID = 'default';
            	size = 0;
            }
            ban.succeed(`${nid}: ok.  FuncID:${funcID}  Size:${size}`.green);
        });

}
