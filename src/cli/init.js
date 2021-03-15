module.exports = (yargs) => {

    const ora = require('ora');
    const { execFile, exec } = require('child_process');
    const fs = require('fs');
    const root = __dirname + '/../../';

    yargs
    .command('init <ProjectName> [path]', "Create and initiate a new wIoT Project folder", yargs => {
      return yargs
      .option('director', {
        alias: 'd',
        default: 'https://wiot-director.yimian.xyz/',
        type: 'string',
        describe: 'director URL'
      })
      .option('entrance', {
        alias: 'e',
        default: 'index.js',
        type: 'string',
        describe: 'default entrance'
      })
      .example([
          ['$0 init myproject', 'Create a wiot project named "myproject" at current folder']
        ])
    }, async argv => {
        let ban = new ora(`Creating new wIoT project...`).start();
        let path = './';

        if(argv.hasOwnProperty('path')){
            path = argv.path;
            if(path.substring(-1) != '/' && path.substring(-1) != '\\'){
                path += '/';
            }
        }
        let dir = path + argv.ProjectName;
        if(fs.existsSync(dir)){
          ban.fail('Folder already exists!!');
          return;
        }
        fs.mkdir(dir, async function(err){
           if (err) {
                ban.fail('Creating failure!!');
                throw err;
           }
           fs.mkdirSync(dir+'/.wiot');
           fs.writeFileSync(dir+'/.wiot/__hash', require('crypto').createHash('sha256').update(Math.random().toString()).digest('hex'));
           fs.writeFileSync(dir+'/config.json', JSON.stringify({
              name: argv.ProjectName,
              entrance: argv.entrance,
              director: argv.director,
              nodes: {},
              wifi: []
           }, null, 2));
           fs.writeFileSync(dir + '/.wiot/.gitignore', 'cache/\n\rcompiled_files/', 'utf-8');

           ban.succeed('Initiate successfully!! Please go into the project folder and use `npm i wiot` to install packages.');
        });
    })

}
