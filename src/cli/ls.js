module.exports = (yargs) => {

	const ora = require('ora');
	const fs = require('fs');
    const error = require(__dirname + '/modules/error.js');
    const colors = require('colors');
    const boxen = require('boxen');
    const Table = require('cli-table');
    const nidMatch = require(__dirname + '/modules/nidMatch.js');




	yargs = yargs


    .command('ls [nid]', "list nodes information", yargs => {
        return yargs
        .example([
            ['$0 ls', 'list all nodes'],
            ['$0 ls node1', 'list the information of node1']
        ])

    }, async argv => {
        let config = require(__dirname + '/modules/getConfig.js')();
        if(!config) return;

        if(!argv.nid){
            let table = new Table({
                head: ['nid', 'nickname', 'msgport', 'wifiIndex']
            });

            Object.keys(config.nodes).forEach((nid, index) => {
                if(nid !== null) table.push([nid, config.nodes[nid].nickname, config.nodes[nid].msgport, config.nodes[nid].wifiIndex])
            });
            console.log(table.toString());
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
            console.log({
                nid: nid,
                nickname: config.nodes[nid].nickname,
                msgport: config.nodes[nid].msgport,
                wifi: {
                    ssid: config.wifi[config.nodes[nid].wifiIndex].ssid,
                    pwd: config.wifi[config.nodes[nid].wifiIndex].pwd,
                }
            });
        }
    })

        

	return yargs;
}
