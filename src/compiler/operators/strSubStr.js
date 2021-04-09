module.exports = wiot => {
	wiot.newOperator('strSubStr', (str, pos, length) => {
		return `string.sub(${str},${pos}${length?`,${length}`:``})`;
	});
}