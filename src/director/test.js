const express = require('express')

	const app = express()
	const port = 5001;

	app.get('/', (req, res) => {
	  	res.send('Hello World!')
        console.log(req.query)
	})

	app.listen(port, () => {
	})


