module.exports = (yargs) => {
    var o = {
        init: async (argv) => new Promise(async resolve => {
            ban = new ora(`Creating new wIoT project...`).start();
            let path = './';
            if(argv._.length > 2){
                path = argv._[2];
                if(path.substring(-1) != '/' && path.substring(-1) != '\\'){
                    path += '/';
                }
            }
            fs.mkdir(path + argv._[1], function(err){
               if (err) {
                    ban.fail('Creating failure!!');
                    console.error(err);
                    resolve();
               }
               o.copyFolder(__dirname + '/../../dist', path + argv._[1], function(err){
                  if (err) {
                        ban.fail('Creating failure!!');
                        console.error(err);
                        resolve();
                   }
                   ban.success('Initiate successfully!!');
                   resolve()
               })
            });
        }),
        copyFolder: function(srcDir, tarDir, cb) {
          fs.readdir(srcDir, function(err, files) {
            var count = 0
            var checkEnd = function() {
              ++count == files.length && cb && cb()
            }

            if (err) {
              checkEnd()
              return
            }

            files.forEach(function(file) {
              var srcPath = path.join(srcDir, file)
              var tarPath = path.join(tarDir, file)

              fs.stat(srcPath, function(err, stats) {
                if (stats.isDirectory()) {
                  console.log('mkdir', tarPath)
                  fs.mkdir(tarPath, function(err) {
                    if (err) {
                      console.log(err)
                      return
                    }

                    copyFolder(srcPath, tarPath, checkEnd)
                  })
                } else {
                  copyFile(srcPath, tarPath, checkEnd)
                }
              })
            })
            files.length === 0 && cb && cb()
          })
        }
    }

    const ora = require('ora');
    const fs = require('fs');
    const path = require('path');


    yargs = yargs
    .command('init', "wiot init <ProjectName> [path]".green + " Create and initiate a new wIoT Project folder", yargs => yargs, async argv => {
        await o.init(argv);
    })


    return yargs;
}
