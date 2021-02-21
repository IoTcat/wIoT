module.exports = (params) => {

	const udps = require('dgram').createSocket('udp4');
	const log = require(__dirname + '/lib/log.js')();

	// format: path => (info{method, address, contentType, path}, data{})
	// return: res.end
	let stack = {};

  	let o = {
		add: (path, f) => {
			stack[path] = f;
		},
		del: (path) => {
			delete stack[path];
		},
		list: () => stack
	}

	//udp server
	udps.bind(5678);

	udps.on('listening', function () {
	    log.info('system', 'udp4 server started on 5678..');
	})
	 
	//接收消息
	udps.on('message', function (msg, rinfo) {
	    let strmsg = msg.toString();
	    let res = stack['/']({
			method: 'udp',
			address: rinfo.address,
			contentType: '',
			path: '/'
		}, JSON.parse(strmsg)
		)
	    if(res) udps.send(res, 0, res.length, rinfo.port, rinfo.address);
	})
	//错误处理
	udps.on('error', function (err) {
	    log.error('system', 'udp error :: \n' + err);
	    udps.close();
	})
	return o ;

}