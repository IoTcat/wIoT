module.exports = (yargs) => {
	const request = require('request');
	const ora = require('ora');
	const fs = require('fs');

	yargs = yargs
	.command('push', "mksec push".green + " Push new words to remote..", yargs => yargs, async argv => {
		let s = fs.readFileSync(argv._[1], 'utf-8');
		let b = new Buffer(s).toString('base64');
        ban = new ora(`Pushing...`).start();
        request('http://192.168.3.251:3000/?body='+b, (err)=>{
            if(err){
                ban.fail('fail');
            }else{
                ban.succeed('success');
            }
        });
	})



	return yargs;
}
