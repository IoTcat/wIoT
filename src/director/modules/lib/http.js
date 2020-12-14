module.exports = (params) => {

	const coap = require('coap').createServer();

	let stack = [];

  	let o = {
		receive: (f) => {
			stack.push(f);
		}
	}


	coap.on('request', async (req, res) => {

		stack.
	  console.log(req.payload.toString())
	  res.setOption("Content-Format", "application/json")
	  if(!req.payload.toString()) res.end('{"meg": "legal params"}');

	  let data = JSON.parse(req.payload.toString());
	  await register(data, req)
	  let body = await cache(data);
	  res.end(body);
	  log(req, body)
	})
	 
	// the default CoAP port is 5683
	coap.listen(function() {
	  console.log('CoAP Server Started..')
	})





	return o ;

}