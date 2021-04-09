module.exports = wiot => {
	wiot.newOperator('strIndexOf', (str, segment) => {
		return `string.find(${str},${segment})`;
	});
}