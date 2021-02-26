module.exports = (yargs) => {

	const ora = require('ora');
	const fs = require('fs');
    const error = require(__dirname + '/modules/error.js');
    const colors = require('colors');
    const boxen = require('boxen');
    const Table = require('cli-table');



    const listWiFi = () => {
        let table = new Table({
            head: ['index', 'ssid', 'password']
        });
        let config = require(__dirname + '/modules/getConfig.js')();
        if(!config) return;

        config.wifi.forEach((item, index) => {
            if(item !== null) table.push([index, item.ssid, item.pwd])
        });
        console.log(table.toString());
    }



	yargs = yargs


    .command('wifi', "set wifi configuration. Use \""+yargs.$0+" node -h\" for more information. ", yargs => {
        return yargs.
        example([
            ['$0 node search', 'search for all NodeMCUs connected to this computer']
        ])


        .command('ls', "List all wifi configuration", yargs => {
            return yargs.
            example([
                ['$0 wifi ls', 'List all wifi configuration']
            ])
        }, async argv => {
            listWiFi();
        })

        .command('set', "set wifi configuration", yargs => {
            return yargs
            .option('ssid', {
                alias: 's',
                type: 'string',
                demandOption: true,
                describe: 'wifi ssid'
            })
            .option('pwd', {
                alias: 'p',
                type: 'string',
                demandOption: true,
                describe: 'wifi password'
            })
            .option('index', {
                alias: 'i',
                type: 'number',
                demandOption: false,
                default: 0,
                describe: 'wifi index in the configuration'
            })
            .example([
                ['$0 wifi set --ssid=abc --pwd=123 --index=0', 'Set ssid and password of a wifi at index 0']
            ])
        }, async argv => {
            let config = require(__dirname + '/modules/getConfig.js')();
            if(!config) return;

            let raw_config = JSON.parse(fs.readFileSync(config.root + 'config.json', 'utf-8'));
            raw_config.wifi[argv.index] = {
                ssid: argv.ssid,
                pwd: argv.pwd
            };
            fs.writeFileSync(config.root + 'config.json', JSON.stringify(raw_config, null, 2), 'utf-8');

            listWiFi();
        })

        .command('remove', "remove wifi configuration", yargs => {
            return yargs
            .option('index', {
                alias: 'i',
                type: 'number',
                demandOption: true,
                describe: 'wifi index in the configuration'
            })
            .example([
                ['$0 wifi remove --index=0', 'remove the wifi configuration at index 0']
            ])
        }, async argv => {
            let config = require(__dirname + '/modules/getConfig.js')();
            if(!config) return;
            
            let raw_config = JSON.parse(fs.readFileSync(config.root + 'config.json', 'utf-8'));
            raw_config.wifi[argv.index] = null;
            if(!raw_config.wifi.some(i=>i)) raw_config.wifi = [];
            fs.writeFileSync(config.root + 'config.json', JSON.stringify(raw_config, null, 2), 'utf-8');



            listWiFi();
        })



    }, async argv => {
        throw null;
    })

        

	return yargs;
}
