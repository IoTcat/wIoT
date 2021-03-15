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

            let nid = o.nidGen();

            if(argv.nid){
                nid = nidMatch(argv.nid);
                if(!nid || !nid.length){
                    error('No node selected! \nPlease use "wiot ls" to check the nid.');
                    return;
                }
                if(nid.length > 1){
                    error('Found multiple nodes. Which one do you want?');
                    return;
                }
                nid = nid[0];
            }


            if(!config.wifi[argv.wifiIndex]){
                error('Invalid WiFi index '+argv.wifiIndex+'!\nSee "wiot wifi ls" to find a wifi index.');
                return;
            }

            ban = new ora(`Preparing ${nid}...0%`).start();
            await reset(argv.port);
            ban.info('Preparing '+nid+'...10%');
            if(argv.config){
                if(!argv.nid){
                    Object.keys(config.nodes).forEach(nid => {
                        if(config.nodes[nid].nickname == argv.nickname){
                            error('Nickname "'+argv.nickname+'"" has already been used by '+nid);
                            throw null;
                        }
                    })

                    config.nodes[nid] = {
                        nickname: argv.nickname,
                        msgport: argv.msgport,
                        wifiIndex: argv.wifiIndex
                    }
                    let raw_config = JSON.parse(fs.readFileSync(config.root + 'config.json', 'utf-8'));
                    raw_config.nodes = config.nodes;
                    fs.writeFileSync(config.root + 'config.json', JSON.stringify(raw_config, null, 2), 'utf-8');
                }
                let config_path = config.root + '.wiot/cache/config.json';
                let config_obj = {
                    nid: nid,
                    wifi: config.wifi[config.nodes[nid].wifiIndex],
                    msg: {
                        port: config.nodes[nid].msgport
                    },
                    director: {
                        hostname: argv.directorHost,
                        port: argv.directorPort,
                        HeartbeatInterval: argv.heartbeat
                    }
                }
                fs.writeFileSync(config_path, JSON.stringify(config_obj), 'utf-8');
                await upload(argv.port, config_path);
            }
            ban.info('Preparing '+nid+'...30%');
            if(argv.img) await upload(argv.port, __dirname+'/../drivers/nodemcu/lua/lfs.img');
            ban.info('Preparing '+nid+'...60%');
            if(argv.lua) await upload(argv.port, __dirname+'/../drivers/nodemcu/lua/init.lua');
            ban.info('Preparing '+nid+'...70%');
            await reset(argv.port);
            ban.info('Preparing '+nid+'...100%');
            ban.succeed(nid+' on '+argv.port+' is ready for online!!');
            let table = new Table({
                head: ['nid', 'nickname', 'msgport', 'wifiIndex']
            });

            table.push([nid, config.nodes[nid].nickname, config.nodes[nid].msgport, config.nodes[nid].wifiIndex])

            console.log(table.toString());
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
    const Table = require('cli-table');
    const nidMatch = require(__dirname + '/modules/nidMatch.js');
	yargs = yargs


    .command('node', "operate NodeMCU devices connected on this computer. Use \"wiot node -h\" for more information. ", yargs => {
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
            let config = require(__dirname + '/modules/getConfig.js')();
            if(!config) return;
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
            .option('directorHost', {
                default: require('url').parse(config.director).hostname,
                type: 'string',
                describe: 'director hostname'
            })
            .option('directorPort', {
                default: 6789,
                type: 'number',
                describe: 'director MSG port'
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
            .option('nid', {
                type: 'string',
                describe: 'update existed node firmware'
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
            let config = require(__dirname + '/modules/getConfig.js')();
            if(!config) return;
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
            .option('directorHost', {
                default: require('url').parse(config.director).hostname,
                type: 'string',
                describe: 'director hostname'
            })
            .option('directorPort', {
                default: 6789,
                type: 'number',
                describe: 'director MSG port'
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
            .option('nid', {
                type: 'string',
                describe: 'update existed node firmware'
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
        .command('update <port> [nid]', "update wIoT system environment on the NodeMCU", yargs => {
            let config = require(__dirname + '/modules/getConfig.js')();
            if(!config) return;
            return yargs
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
            .option('directorHost', {
                default: require('url').parse(config.director).hostname,
                type: 'string',
                describe: 'director hostname'
            })
            .option('directorPort', {
                default: 6789,
                type: 'number',
                describe: 'director MSG port'
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
            if(!argv.nid) argv.config = false;
            await o.check(argv);
            await o.upload(argv);
        })

        
    }, async argv => {
        throw null;
    })

        

	return yargs;
}
