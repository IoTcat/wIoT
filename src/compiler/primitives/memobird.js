module.exports = wiot => {
	wiot.newPrimitive('memobird', (node, AppKey, UserID, memobirdID, wire_en, wire_body) => ({
		node: node,
		ak: AppKey,
		uid: UserID,
		memobirdID: memobirdID,
		input: [wire_en, wire_body]
	}), (o, method) => {
		let node = o.node;
		node.trigger(o.input[0], `if ${o.input[0].reg}==1 then http.request('http://api.yimian.xyz/gugu/?ak=${o.ak}&userID=${o.uid}&memobirdID=${o.memobirdID}&body='..tostring(${o.input[1].reg}),'GET','','',function(c,d)end);end;`);
	});
}