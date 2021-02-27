module.exports = (yargs) => {

	const ora = require('ora');
	const fs = require('fs');
    const error = require(__dirname + '/modules/error.js');
    const colors = require('colors');
    const boxen = require('boxen');
    const Table = require('cli-table');
    const nidMatch = require(__dirname + '/modules/nidMatch.js');




	yargs = yargs


    .command('remove <nid>', "remove nodes from project", yargs => {
        return yargs
        .example([
            ['$0 remove node1', 'remove node1 from project']
        ])

    }, async argv => {
        let config = require(__dirname + '/modules/getConfig.js')();
        if(!config) return;


        let nid = nidMatch(argv.nid);
        if(!nid || !nid.length){
            error('No node selected! \nPlease use "'+argv.$0+' ls" to check the nid.');
            return;
        }
        if(nid.length > 1){
            error('Found multiple nodes. Which one do you want?');
            return;
        }
        nid = nid[0];
        
        delete config.nodes[nid];

        let raw_config = JSON.parse(fs.readFileSync(config.root + 'config.json', 'utf-8'));
        raw_config.nodes = config.nodes;
        fs.writeFileSync(config.root + 'config.json', JSON.stringify(raw_config, null, 2), 'utf-8');


        let table = new Table({
            head: ['nid', 'nickname', 'msgport', 'wifiIndex']
        });

        Object.keys(config.nodes).forEach((nid, index) => {
            if(nid !== null) table.push([nid, config.nodes[nid].nickname, config.nodes[nid].msgport, config.nodes[nid].wifiIndex])
        });
        console.log(table.toString());

        
    })

        

	return yargs;
}
