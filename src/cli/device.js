module.exports = (yargs) => {
	var o = {
        flash: async (argv) => new Promise(async resolve => {
            await winFlash(argv._[1], __dirname+'/../drivers/nodemcu/bin/full.bin');
            resolve()
		}),
        upload: async (argv) => new Promise(async resolve => {
            await reset(argv._[1]);
            await upload(argv._[1], __dirname+'/../drivers/nodemcu/lua/init.lua');
            await upload(argv._[1], __dirname+'/../drivers/nodemcu/lua/config.json');
            await upload(argv._[1], __dirname+'/../drivers/nodemcu/lua/FUNC.json');
            await upload(argv._[1], __dirname+'/../drivers/nodemcu/lua/__stopped');
            await reset(argv._[1]);
            resolve()
        }),
        terminal: async (argv) => new Promise(async resolve => {
        	terminal(argv._[1])
        	resolve();
        })
	}

	const ora = require('ora');
	const fs = require('fs');
	const winDevList = require(__dirname + '/modules/winDevList.js');
	const winFlash = require(__dirname + '/modules/winFlash.js');
	const upload = require(__dirname + '/modules/upload.js');
	const terminal = require(__dirname + '/modules/terminal.js');
	const reset = require(__dirname + '/modules/reset.js');

	yargs = yargs
	.command('flash', "wiot flash <PortsName>".green + " Flash a NodeMCU board..", yargs => yargs, async argv => {
        await o.flash(argv);
	})
	.command('upload', "wiot upload <PortsName>".green + " Upload a NodeMCU board..", yargs => yargs, async argv => {
        await o.upload(argv);
	})
	.command('terminal', "wiot terminal <PortsName>".green + " Open a NodeMCU terminal..", yargs => yargs, async argv => {
        await o.terminal(argv);
	})
	.command('ini', "wiot ini <PortsName>".green + " Init a NodeMCU board..", yargs => yargs, async argv => {
        await o.flash(argv);
        await o.upload(argv);
	})
	.command('lsp', "wiot lsp".green + " List all available devices.", yargs => yargs, async argv => {
            ban = new ora(`Collecting information...`).start();
            let deviceList = await winDevList();
            ban.succeed('Found ' + deviceList.length + ' devices!!');
            console.log(deviceList);
	})


	return yargs;
}
