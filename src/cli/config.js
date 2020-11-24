module.exports = (yargs) => {



    var o = {
        email: {
            set: s => {
                if(!o.email.check(s)){
                    return 'Illegal Email!!';
                }
                data.config.email(s);
                return;
            },
            get: () => data.config.email(),
            check: s => {
                var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
                return reg.test(s);
            }
        },
        remote: {
            set: s => {
                if(!o.remote.check(s)){
                    return 'Illegal URL!!';
                }
                data.config.remote(s);
                return;
            },
            get: () => data.config.remote(),
            check: s => {
                var reg = /./;///^((https|http|ftp|rtsp|mms):\/\/)(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].[a-z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+\/?)$/;
                return reg.test(s);
            }
        },
        show: () => {
            let configInfo = new table();
            configInfo.push({email: o.email.get()},{remote: o.remote.get()});
            console.log(configInfo.toString());
        }
    };

    var data = require(__dirname + '/../utilities/data.js')();
    const colors = require('colors');
    const boxen = require('boxen');
    const table = require('cli-table');

    yargs = yargs
    .command("config", "mksec config".green + " Config Email and Server URL..", yargs => {
        return yargs
        .option("e", {
            alias: "email",
            default: "",
            describe: "Your Email to login.",
            demand: false,
            type: 'string'
        })
        .option("r", {
            alias: "remote",
            default: "",
            describe: "Remote mksec server URL.",
            demand: false,
            type: 'string'
        })
        .help()
        .version(false)
        .argv;
    }, argv => {
        if(argv.e == "" && argv.r == ""){
            o.show();
            console.error(boxen('Please use '+'mksec config -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
            return;
        }
        if(argv.e != ""){
            var m = o.email.set(argv.e);
            if(m){
                console.error(boxen(m, {padding: 1, margin: 1, borderStyle: 'double'}));
                return;
            }
        }
        if(argv.r != ""){
            var m = o.remote.set(argv.r);
            if(m){
                console.error(boxen(m, {padding: 1, margin: 1, borderStyle: 'double'}));
                return;
            }
        }
        o.show();
    })

    return yargs;
}