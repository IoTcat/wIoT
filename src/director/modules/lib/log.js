module.exports = (params) => {



  	let o = {
		info: (id, body) => {
			console.log(id+': '+body)
		},
		error: (id, body) => {
			console.error(id+' eee: '+body)
		},
		get: (id) => {
			return '';
		}
	}

	return o ;

}