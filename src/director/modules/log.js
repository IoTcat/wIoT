module.exports = (node, nodetable) => {

	const LOG_PATH = __dirname + '/../data/log/';


	const log4js = require('log4js');


	log4js.configure({
	  appenders: {
	    flow: {type: 'file', filename: LOG_PATH + 'flow.log'},
	    access: {type: 'file', filename: LOG_PATH + 'access.log'},
	    event: {type: 'file', filename: LOG_PATH + 'event.log'},
	    nslog: {type: 'file', filename: LOG_PATH + 'ns.log'},
	    weblog: {type: 'file', filename: LOG_PATH + 'web.log'},
	    console: { type: 'console' }
	  },
	  categories: {
	  	flow: {appenders: ['flow', 'console'], level: 'info' },
	    access: { appenders: ['access'], level: 'info' },
	    event: {appenders: ['event', 'console'], level: 'info' },
	    nslog: {appenders: ['nslog', 'console'], level: 'info' },
	    weblog: {appenders: ['weblog', 'console'], level: 'info' },
	    default: { appenders: ['console'], level: 'info' }
	  }
	});

	return log4js;
}