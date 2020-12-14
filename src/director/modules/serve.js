module.exports = (params) => {

	const coap = require('coap').createServer();
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

	//coap server
	coap.on('request', async (req, res) => {
		// no match
		console.log(req.url, req.payload.toString())
		if(!stack.hasOwnProperty(req.url)){
			res.end();
			return;
		}
	  	res.setOption("Content-Format", "application/json")
		res.end(
			stack[req.url]({
				method: 'coap',
				address: req.rsinfo.addrss,
				contentType: req.headers['Content-Type'],
				path: req.url
			}, JSON.parse(req.payload.toString())
			)
		);
	})
	
	coap.listen(function() {
	 	log.info('system', 'CoAP Server started..');
	})


	return o ;

}