module.exports = (yargs) => {
	var o = {
        check: async (argv) => new Promise(async resolve => {
            ban = new ora(`Checking port ${argv.port}...`).start();
            let deviceList = await winDevList();
            if(deviceList.indexOf(argv.port) == -1){
                 ban.fail('No NodeMCU device on '+argv.port+'!!');
                return;
            }
            ban.succeed('Found NodeMCU device on '+argv.port+'!!');
            resolve();
        }),
        flash: async (argv) => new Promise(async resolve => {
            await winFlash(argv.port, __dirname+'/../drivers/nodemcu/bin/full.bin');
            resolve()
		}),
        upload: async (argv) => new Promise(async resolve => {
            let config = require(__dirname + '/modules/getConfig.js')();
            if(!config) return;

            if(!config.wifi[argv.wifiIndex]){
                error('Invalid WiFi index '+argv.wifiIndex+'!\nSee "'+argv.$0+' wifi ls" to find a wifi index.');
                return;
            }

            ban = new ora(`Preparing ${argv.NodeName}...0%`).start();
            await reset(argv.port);
            ban.info('Preparing '+argv.NodeName+'...10%');
            if(argv.config){

                Object.keys(config.nodes).forEach(nid => {
                    if(config.nodes[nid].nickname == argv.nickname){
                        error('Nickname "'+argv.nickname+'"" has already been used by '+nid);
                        throw null;
                    }
                })

                let nid = o.nidGen();
                config.nodes[nid] = {
                    nickname: argv.nickname,
                    msgport: argv.msgport,
                    wifiIndex: argv.wifiIndex
                }
                let raw_config = JSON.parse(fs.readFileSync(config.root + 'config.json', 'utf-8'));
                raw_config.nodes = config.nodes;
                fs.writeFileSync(config.root + 'config.json', JSON.stringify(raw_config, null, 2), 'utf-8');

                let config_path = config.root + '.wiot/cache/config.json';
                let config_obj = {
                    nid: nid,
                    wifi: config.wifi[config.nodes[nid].wifiIndex],
                    msg: {
                        port: config.nodes[nid].msgport
                    },
                    director: {
                        ip: '192.168.3.100',
                        port: 6789,
                        HeartbeatInterval: argv.heartbeat
                    }
                }
                fs.writeFileSync(config_path, JSON.stringify(config_obj), 'utf-8');
                await upload(argv.port, config_path);
            }
            ban.info('Preparing '+argv.NodeName+'...30%');
            if(argv.img) await upload(argv.port, __dirname+'/../drivers/nodemcu/lua/lfs.img');
            ban.info('Preparing '+argv.NodeName+'...60%');
            if(argv.lua) await upload(argv.port, __dirname+'/../drivers/nodemcu/lua/init.lua');
            ban.info('Preparing '+argv.NodeName+'...70%');
            await reset(argv.port);
            ban.info('Preparing '+argv.NodeName+'...100%');
            ban.succeed(argv.NodeName+' on '+argv.port+' is ready for online!!');
            resolve()
        }),
        terminal: async (argv) => new Promise(async resolve => {
        	terminal(argv.port)
        	resolve();
        }),
        nidGen: () => require('crypto').createHash('sha256').update(Math.random().toString()).digest('hex').substring(0, 5)
	}

	const ora = require('ora');
	const fs = require('fs');
	const winDevList = require(__dirname + '/modules/winDevList.js');
	const winFlash = require(__dirname + '/modules/winFlash.js');
	const upload = require(__dirname + '/modules/upload.js');
	const terminal = require(__dirname + '/modules/terminal.js');
	const reset = require(__dirname + '/modules/reset.js');
    const error = require(__dirname + '/modules/error.js');

	yargs = yargs


    .command('node', "operate NodeMCU devices connected on this computer. Use \""+yargs.$0+" node -h\" for more information. ", yargs => {
        return yargs.
        example([
            ['$0 node search', 'search for all NodeMCUs connected to this computer']
        ])


        .command('search', "List all available ports", yargs => {
            return yargs.
            example([
                ['$0 node search', 'search for all NodeMCUs connected to this computer']
            ])
        }, async argv => {
                ban = new ora(`Collecting port information...`).start();
                let deviceList = await winDevList();
                ban.succeed('Found ' + deviceList.length + ' NodeMCU devices!!');
                console.log(deviceList);
        })

        .command('init <port>', "flash and prepare a NodeMCU device..", yargs => {
            return yargs
            .option('nickname', {
                alias: 'n',
                demandOption: true,
                type: 'string',
                describe: 'nickname for this node'
            })
            .option('wifiIndex', {
                alias: 'w',
                default: 0,
                type: 'number',
                describe: 'determine which wifi config to use'
            })
            .option('msgport', {
                alias: 'm',
                default: 6789,
                type: 'number',
                describe: 'udp port on NodeMCU for MSG communication'
            })
            .option('heartbeat', {
                default: 10000,
                type: 'number',
                describe: 'heartbeat interval'
            })
            .option('lua', {
                alias: 'l',
                default: true,
                type: 'boolean',
                describe: 'update init.lua'
            })
            .option('img', {
                alias: 'i',
                default: true,
                type: 'boolean',
                describe: 'update lfs.img'
            })
            .option('config', {
                alias: 'c',
                default: true,
                type: 'boolean',
                describe: 'update config.json'
            })
            .example([
                ['$0 node init COM3 -n firstnode', 'flash and prepare the NodeMCU device on COM3 and name it as "firstnode"']
            ])
        }, async argv => {
            await o.check(argv);
            await o.flash(argv);
            await o.upload(argv);
        })


        .command('flash <port>', "flash a NodeMCU device.", yargs => {
            return yargs.
            example([
                ['$0 node flash COM3', 'flash the NodeMCU device on COM3 port']
            ])
        }, async argv => {
            await o.check(argv);
            await o.flash(argv);
        })

        .command('prepare <port>', "prepare wIoT system environment on the NodeMCU", yargs => {
            return yargs
            .option('nickname', {
                alias: 'n',
                demandOption: true,
                type: 'string',
                describe: 'nickname for this node'
            })

            .option('wifiIndex', {
                alias: 'w',
                default: 0,
                type: 'number',
                describe: 'determine which wifi config to use'
            })
            .option('msgport', {
                alias: 'm',
                default: 6789,
                type: 'number',
                describe: 'udp port on NodeMCU for MSG communication'
            })
            .option('heartbeat', {
                default: 10000,
                type: 'number',
                describe: 'heartbeat interval'
            })
            .option('lua', {
                alias: 'l',
                default: true,
                type: 'boolean',
                describe: 'update init.lua'
            })
            .option('img', {
                alias: 'i',
                default: true,
                type: 'boolean',
                describe: 'update lfs.img'
            })
            .option('config', {
                alias: 'c',
                default: true,
                type: 'boolean',
                describe: 'update config.json'
            })
            .example([
                ['$0 node prepare COM3 -n firstnode', 'prepare the NodeMCU device on COM3 and name it as "firstnode"']
            ])
        }, async argv => {
            await o.check(argv);
            await o.upload(argv);
        })

        .command('terminal <port>', "open a NodeMCU UART terminal for debug purpose", yargs => {
            return yargs.
            example([
                ['$0 node terminal COM3', 'open the UART terminal on COM3 port']
            ])
        }, async argv => {
            await o.check(argv);
            await o.terminal(argv);
        })

        
    }, async argv => {
        throw null;
    })

        

	return yargs;
}
