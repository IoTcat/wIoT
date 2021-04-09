module.exports = wiot => {
	wiot.newOperator('if', (condition, ifTrue, ifFalse) => {
		return `((${condition})and{${ifTrue}}or{${ifFalse}})[1]`;
	});
}