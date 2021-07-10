const wiot = require(__dirname + '/wiot-core.js');

/* Primitives */
require(__dirname + '/primitives/adc.js')(wiot)
require(__dirname + '/primitives/bigiot.js')(wiot)
require(__dirname + '/primitives/gpio.js')(wiot)
require(__dirname + '/primitives/http.js')(wiot)
require(__dirname + '/primitives/mail.js')(wiot)
require(__dirname + '/primitives/memobird.js')(wiot)
require(__dirname + '/primitives/print.js')(wiot)
require(__dirname + '/primitives/pwm.js')(wiot)
require(__dirname + '/primitives/redis.js')(wiot)
require(__dirname + '/primitives/sjson_decode.js')(wiot)
require(__dirname + '/primitives/sjson_encode.js')(wiot)
require(__dirname + '/primitives/tcp.js')(wiot)
require(__dirname + '/primitives/udp.js')(wiot)
require(__dirname + '/primitives/webpage.js')(wiot)

/* operators */
require(__dirname + '/operators/if.js')(wiot)
require(__dirname + '/operators/strIndexOf.js')(wiot)
require(__dirname + '/operators/strSubStr.js')(wiot)

/* modules */
require(__dirname + '/modules/breathing.js')(wiot)


module.exports = wiot;
