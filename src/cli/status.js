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



	yargs = yargs


    .command('status [nid]', "show nodes status", yargs => {
        return yargs
        .example([
            ['$0 status', 'show overview nodes status'],
            ['$0 status node1', 'show detailed status of node1']
        ])

    }, async argv => {
        let config = require(__dirname + '/modules/getConfig.js')();
        if(!config) return;

        if(!argv.nid){
            let table = new Table({
                head: ['nid'.cyan, 'nickname'.cyan, 'status'.cyan, 'funcID'.cyan, 'uptime'.cyan, 'heap'.cyan]
            });
            let res = null;
            try{
                res = await got(config.director + (config.director.substring(config.director.length-1)=='/'?'':'/') +'status?hash='+config.hash+'&query='+JSON.stringify(Object.keys(config.nodes)), {
                    responseType: 'json'
                });
            }catch(e){
                error('HTTP request error!');
                return;

            }
            if(!res || typeof res != 'object' || !res.body || typeof res.body != 'object'){
                error('Illegal response from director!');
                return;
            }

            Object.keys(config.nodes).forEach((nid, index) => {
                if(res.body[nid]) table.push([nid, config.nodes[nid].nickname, (res.body[nid].status)?'online'.green:'offline'.red, res.body[nid].funcID, timeago.format(res.body[nid].LastUpTime, 'en_US'), res.body[nid].heap]);
                else table.push([nid, config.nodes[nid].nickname, 'offline'.red, 'unknown'.gray, 'unknown'.gray, 'unknown'.gray]);
            });
            console.log(table.toString());
        }else{
            let nid = nidMatch(argv.nid);
            if(!nid || !nid.length){
                error('No node selected! \nPlease use "'+argv.$0+' ls" to check the nid.');
                return;
            }
            if(nid.length > 1){
                error('Found multiple nodes. Which one do you want?');
                return;
            }

            let res = null;
            try{
                res = await got(config.director + (config.director.substring(config.director.length-1)=='/'?'':'/') +'status?hash='+config.hash+'&query='+JSON.stringify(nid), {
                    responseType: 'json'
                });
            }catch(e){
                error('HTTP request error!');
                return;

            }
            if(!res || typeof res != 'object' || !res.body || typeof res.body != 'object'){
                error('Illegal response from director!');
                return;
            }

            console.log(require('util').inspect(res.body, false, null, true));
        }
    })

        

	return yargs;
}
