module.exports = (yargs) => {

	const ora = require('ora');
	const fs = require('fs');
    const error = require(__dirname + '/modules/error.js');
    const colors = require('colors');
    const boxen = require('boxen');
    const Table = require('cli-table');
    const nidMatch = require(__dirname + '/modules/nidMatch.js');
    const got = require('got');
    const timeago = require('timeago.js');
    const inquirer = require('inquirer');



	yargs = yargs


    .command('restart [nid]', "restart selected node(s)", yargs => {
        return yargs
        .example([
            ['$0 restart', 'restart all nodes'],
            ['$0 restart node1', 'restart node1']
        ])

    }, async argv => {
        let config = require(__dirname + '/modules/getConfig.js')();
        if(!config) return;


        if(!argv.nid){
            let input = await inquirer.prompt([{
                type: 'confirm',
                name: 'restart',
                message: 'Are you sure to restart ALL nodes?'
            }]);

            if(!input.restart) return;


            Object.keys(config.nodes).forEach(async nid => {
                let ban = new ora(`${nid}: restarting...`).start();
                let res = null;
                try{
                    res = await got(config.director + (config.director.substring(config.director.length-1)=='/'?'':'/') +'restart?hash='+config.hash+'&nid='+nid, {
                        responseType: 'json'
                    });
                }catch(e){
                    ban.fail(`${nid}: HTTP request error!`);
                    return;

                }
                if(!res || typeof res != 'object' || !res.body || typeof res.body != 'object' || !res.body.hasOwnProperty('status')){
                    ban.fail(`${nid}: Illegal response from director!`);
                    return;
                }

                if(!res.body.status){
                    ban.fail(`${nid}: Unknown server error!`);
                    return;
                }

                ban.succeed(`${nid}: restarted`.green);

            });

        }else{
            let nid = nidMatch(argv.nid);
            if(!nid || !nid.length){
                error('No node selected! \nPlease use "wiot ls" to check the nid.');
                return;
            }
            if(nid.length > 1){
                error('Found multiple nodes. Which one do you want?');
                return;
            }

            nid = nid[0];

            let ban = new ora(`${nid}: restarting...`).start();
            let res = null;
            try{
                res = await got(config.director + (config.director.substring(config.director.length-1)=='/'?'':'/') +'restart?hash='+config.hash+'&nid='+nid, {
                    responseType: 'json'
                });
            }catch(e){
                ban.fail(`${nid}: HTTP request error!`);
                return;

            }
            if(!res || typeof res != 'object' || !res.body || typeof res.body != 'object' || !res.body.hasOwnProperty('status')){
                ban.fail(`${nid}: Illegal response from director!`);
                return;
            }

            if(!res.body.status){
                ban.fail(`${nid}: Unknown server error!`);
                return;
            }

            ban.succeed(`${nid}: restarted`.green);
        }
    })

        

	return yargs;
}
