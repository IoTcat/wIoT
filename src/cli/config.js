module.exports = (yargs) => {

    const colors = require('colors');
    const boxen = require('boxen');
    const table = require('cli-table');
    const ora = require('ora');
    const fs = require('fs');

    yargs = yargs
    .command("config", "display or update project configuration", yargs => {
      return yargs
      .option('name', {
        alias: 'n',
        type: 'string',
        describe: 'project name'
      })
      .option('director', {
        alias: 'd',
        type: 'string',
        describe: 'director request URL'
      })
      .option('entrance', {
        alias: 'e',
        type: 'string',
        describe: 'default entrance of your project'
      })
      .example([
        ['$0 config', 'display current project configuration'],
        ['$0 config --name newproject', 'update project name to "newproject"'],
        ['$0 config --director http://xxx/', 'change director access URL'],
        ['$0 config --entrance main.js', 'change entrance file to main.js']
        ])
    }, argv => {

        let config = require(__dirname + '/modules/getConfig.js')();
        if(!config) return;

        let raw_config = JSON.parse(fs.readFileSync(config.root + 'config.json', 'utf-8'));

        raw_config.name = argv.name || raw_config.name;
        raw_config.director = argv.director || raw_config.director;
        raw_config.entrance = argv.entrance || raw_config.entrance;


        fs.writeFileSync(config.root + 'config.json', JSON.stringify(raw_config, null, 2), 'utf-8');

        console.log(raw_config);
    })

    return yargs;
}