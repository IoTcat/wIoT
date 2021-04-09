module.exports = wiot => {
	wiot.newModule('breathing', (node, period_s, wire_output) => {
		let w1 = new wiot.wire(0),
		w2 = new wiot.wire(10);
		wiot.operate(node, `math.abs($1%2047-1023)`, wire_output, w2);
		wiot.operate(node, `($1+math.floor(2048*0.01/${period_s}))%2048`, w2, w1);
		wiot.buffer(node, w1, w2, .01, true);
	});
}