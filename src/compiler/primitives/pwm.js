module.exports = wiot => {
	wiot.newPrimitive('pwm', (node, pin, wire_duty, wire_clock) => ({
		node: node,
		pin: pin,
		input: [wire_duty, wire_clock]
	}), (o, method) => {
		let node = o.node;
		node.prepare(`pwm.setup(${o.pin},${o.input[1].reg},${o.input[0].reg});`);
		node.prepare(`pwm.setduty(${o.pin},${o.input[0].reg});`);
		node.trigger(o.input[0], `pwm.setduty(${o.pin},${o.input[0].reg});`);
		node.trigger(o.input[1], `pwm.setclock(${o.pin},${o.input[1].reg});`);
	});
}