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
    const md5 = require('md5');


	yargs = yargs


    .command('compile [entrance]', "compile JavaScript into Lua files", yargs => {
        return yargs
        .example([
            ['$0 compile', 'compile the default entrance file'],
            ['$0 compile wiotProgram1.js', 'compile wiotProgram1.js file']
        ])

    }, async argv => {
        require(__dirname + '/modules/compile.js')(argv);
    })

        

	return yargs;
}
