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


    .command('publish [entrance]', "publish local change to nodes", yargs => {
        return yargs
        .example([
            ['$0 publish', 'publish the compiled files in cache'],
            ['$0 publish wiotProgram1.js', 'compile and publish wiotProgram1.js']
        ])

    }, async argv => {
        let config = require(__dirname + '/modules/getConfig.js')();
        if(!config) return;


        if(argv.entrance){
            require(__dirname + '/modules/compile.js')(argv);
        }

        let dir = config.root + '.wiot/compiled_files/';


            Object.keys(config.nodes).forEach(async nid => {
                let ban = new ora(`${nid}: publish...`).start();
                let funcID = 'default', s = '', size = 0;
                if(fs.existsSync(dir+nid)) {
                    s = fs.readFileSync(dir+nid, 'utf-8');
                    funcID = md5(s).substring(0, 5);
                    size = fs.lstatSync(dir+nid).size;
                }
                let res = null;
                try{
                    res = await got(config.director + (config.director.substring(config.director.length-1)=='/'?'':'/') +'setFunc?hash='+config.hash+'&nid='+nid + '&funcID=' + funcID+ '&func='+Buffer.from(s).toString('base64') , {
                        responseType: 'json'
                    });
                }catch(e){
                    ban.fail(`${nid}: HTTP request error!`.red);
                    return;

                }
                if(!res || typeof res != 'object' || !res.body || typeof res.body != 'object' || !res.body.hasOwnProperty('status')){
                    ban.fail(`${nid}: Illegal response from director!`.red);
                    return;
                }

                if(!res.body.status){
                    ban.fail(`${nid}: Unknown server error!`.red);
                    return;
                }

                ban.succeed(`${nid}: finished  FuncID: ${funcID}  Size:${size}`.green);

            });

    })

        

	return yargs;
}
