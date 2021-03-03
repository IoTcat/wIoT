-- WIOT Lua Firmware on NodeMCU
__main = coroutine.create(function(__run)
	--Packages Used: file, sjson, encoder, timer, node, wifi, net, gpio, uart

	--Global Constant
	-----------------
	local CONFIG_PATH = 'config.json';
	local FLAG_PATH = '__system/flag';
	local ERROR_PATH = '__system/error';
	local FUNC_PATH = 'func.json';
	local DB_PREFIX = '__data/';
	local SWAP_PREFIX = '__system/swap/';
	local SIGNAL_LED = 0;
	local UDP_INTERVAL = 10;

--For Debug Purpose
--collectgarbage("collect")
--print('Global Constant', node.heap())


	--Global Methods (in RAM)
	----------------
	-- Package Methods
	local pack = {
		--encode any type other than function into string
		encode = function(obj) --(any data) => string packedString
			local status, json = pcall(sjson.encode, {obj});
			if status then
				--if encode is success
				return string.sub(json, 2, -2);
			else
				--if the encode is fail
				return '';
			end
		end,
		--decode the string into the original type data
		decode = function(str) --(string packedString) => any data
			if type(str) ~= 'string' then
				return nil
			end;
			local status, obj = pcall(sjson.decode, '['..str..']');
			if status then
				--if decode is success
				return obj[1];
			else
				--if decode is fail
				return nil;
			end
		end
	}
	-- File Object Operation
	local fs = {
		--read a multi-type data from a file
		read = function(f) --(string filename) => any filedata
			return pack.decode(file.getcontents(f));
		end,
		--write any type data other than function into a file
		write = function(f, obj) --(string filename, any data) => bool status
			local res = pack.encode(obj);
			if res == '' then
				return false;
			else
				while(file.getcontents(f) ~= res) do
					file.putcontents(f, res);
				end
				return true;
			end
		end
	}
	--split string
	--split the string with reps and return a table with
	--all elemets. e.g. ('abcdabcd', 'a') => {'bcd', 'bcd'}
	local stringSplit = function(str, reps) --(string string, string separator) => table splitedString
	    local resultStrList = {}
	    string.gsub(str,'[^'..reps..']+', function (w)
	        table.insert(resultStrList,w);
	    end);
	    return resultStrList;
	end

--For Debug Purpose
--collectgarbage("collect")
--print('Global Methods (in RAM)', node.heap())


	-- Signal LED Begin
	-------------------
	--Mode Init
	gpio.mode(SIGNAL_LED, gpio.OUTPUT);
	local signal_timer = tmr.create();
	--Control Methods
	local setSignalInterval = function(interval) --(number interval) => nil
		signal_timer:alarm(interval, tmr.ALARM_AUTO, function()
			--reverse the SIGNAL led output, 0->1, 1->0
			if gpio.read(SIGNAL_LED) == gpio.HIGH then
				gpio.write(SIGNAL_LED, gpio.LOW);
			else
				gpio.write(SIGNAL_LED, gpio.HIGH);
			end
		end);
	end
	--SIGNAL: Start
	setSignalInterval(200);

--For Debug Purpose
--collectgarbage("collect")
--print('Signal LED Begin', node.heap())


	--Load Config (Assume config file is
	--             exist and good)
	-------------
	--load config
	local config = fs.read(CONFIG_PATH);
	--Load Func to RAM
	local func = fs.read(FUNC_PATH);
	--Default Mode
	if type(func) ~= 'table' or type(func.id) ~= 'string' or type(func.online) ~= 'string' then
		func = {
			id = 'default',
			online = ''
		}
	end

--For Debug Purpose	
--collectgarbage("collect")
--print('Load Config', node.heap())

	--Check Flag (Assume flag is at FLAG_PATH in SPIFF)
	--(flag represent the number of startup failures before)
	------------
	--Load Flag
	local flag = file.getcontents(FLAG_PATH);
	if flag == nil then
		flag = 0;
	else
		flag = tonumber(flag) + 1;
	end
	--Update Flag Record in SPIFF
	file.putcontents(FLAG_PATH, tostring(flag));
	--Failures > 2 Times
	if flag > 2 then 
		--remove func file to run in DEFAULT mode
		file.remove(FUNC_PATH);
	end
	--Release Resource
	flag = nil;

--For Debug Purpose
--collectgarbage("collect")
--print('Check Flag', node.heap())


	--WiFi Setup
	------------
	--Set Mode to STA
	wifi.setmode(wifi.STATION);
	--Set HostName to WIOT-<nid>
	wifi.sta.sethostname('WIOT-'..config.nid);
	--Configure the WiFi
	wifi.sta.config(config.wifi);
	--Connect to AP
	tmr.create():alarm(1000, tmr.ALARM_AUTO, function(timer)
		--print('Setting WiFi');
		if wifi.sta.getip() ~= nil then --When WiFi is Ready
			--print('WiFi OK');
			--Release Timer Resources
			timer:unregister();
			--Resume Main Process
			coroutine.resume(__main);
		end
	end);
	--Suspend Main Process Until WiFi is ready
	coroutine.yield();

--For Debug Purpose
--collectgarbage("collect")
--print('WiFi Setup', node.heap())


	--SIGNAL: WiFi OK
	setSignalInterval(600);


	--SWAP Setup (SWAP is a part of space in FLASH
	--			  specifically storage some low-frequency
	--			  usage data and methods)
	--------------
	-- SWAP Method
	local swap = {}
	function swap:set(key, val, prefix) --(string key, any data, string prefix) => bool status
		return fs.write(prefix..encoder.toBase64(key), val);
	end
	function swap:get(key, prefix) --(string key, string prefix) => any data
		return fs.read(prefix..encoder.toBase64(key));
	end
	function swap:del(key, prefix) --(string key, string prefix) => nil
		file.remove(prefix..encoder.toBase64(key));
	end
	--list a table of all keys with the prefix
	function swap:list(prefix)  --(string prefix) => table ['key']
		local fileList = file.list(prefix..'.');
		local keys = {};
		for k, v in pairs(fileList) do
			--push key to keys table
			table.insert(keys, encoder.fromBase64(string.sub(k, #prefix + 1)));
		end
		return keys;
	end
	--delete all key-value with the prefix
	function swap:clear(prefix)  --(string prefix) => nil
		for index, key in pairs(self:list(prefix)) do
			self:del(key, prefix);
		end
	end

--For Debug Purpose
--collectgarbage("collect")
--print('SWAP Setup', node.heap())


	--Name Service (NS) Setup  (NS service provide Methods
	--							to convert nid into UDP ip and port
	--							so the direct connection to the corresponding
	--							node can be established )
	--------------------
	local ns = setmetatable({}, {
		--read method
		__index = function(table, key)
			--search key in SWAP
			local res = swap:get(key, SWAP_PREFIX..'NS/');
			if res == nil or res.port == nil or res.ip == nil then
				--if no such key or wrong format, return nil
				return nil;
			else
				--if good, return the ns table
				return res;
			end
		end,
		--assign method
		__newindex = function(table, key, val)
				--storage the ns key-value into SWAP
				if val == nil then
					swap:del(key, SWAP_PREFIX..'NS/');
				else
					swap:set(key, val, SWAP_PREFIX..'NS/');
				end
		end
	});

--For Debug Purpose
--collectgarbage("collect")
--print('NS Setup', node.heap())


	--MSG Register Init ( MSG register storages the user-defined
	--						methods to handle the income message
	--						from inter-board and server-client communication)
	-------------------
	--MSG Register Clear
	swap:clear(SWAP_PREFIX..'M/');
	--MSG register (in SWAP)
	local msgReg = setmetatable({}, {
		--read method
		__index = function(table, key)
			--search key in SWAP
			local res = swap:get(key, SWAP_PREFIX..'M/');
			if res == nil then
				--if no such key, return nil
				return nil;
			else
				--if has such key, return the method
				return loadstring(encoder.fromBase64(res));
			end
		end,
		--assign method
		__newindex = function(table, key, val)
			if type(val) ~= 'function' then
				--if value is not a function, then delete the corresponding key in SWAP
				swap:del(key, SWAP_PREFIX..'M/');
			else
				--if value is a function, then save it in SWAP
				swap:set(key, encoder.toBase64(string.dump(val)), SWAP_PREFIX..'M/');
			end
		end
	});
	--msgLongMsgReceive
	local cache_longData = nil;
	local cache_flag = nil;
	--MSG Reg Method
	msgReg_run = function(data) --(string incomingData) => nil
		if string.sub(data, 1, 1) == '^' then
			cache_flag = string.sub(data, 2, 2);
			cache_longData = string.sub(data, 3);
			return;
		elseif string.sub(data, 1, 1) == '&' and string.sub(data, 2, 2) == cache_flag then
			cache_longData = cache_longData..string.sub(data, 3);
			return;
		elseif string.sub(data, 1, 1) == '$' and string.sub(data, 2, 2) == cache_flag then
			data = cache_longData..string.sub(data, 3);
			cache_longData = nil;
			cache_flag = nil;
		end

		--decode data
		local data = pack.decode(data);
		--check data
		if type(data) ~= 'table' or type(data.from) ~= 'string' or type(data.name) ~= 'string' or data.to ~= config.nid then
			return nil;
		end
		--Search mached methods in MSG register
		local method = msgReg[data.name];
		if type(method) == 'function' then
			print(pcall(method, data.from, data.body));
		end
	end

--For Debug Purpose
--collectgarbage("collect")
--print('MSG Register Init', node.heap())


	--UDP Startup ( Start up a udp server
	--				for inter-board communication)
	-------------
	--Start UDP Service
	--create a udp server
	local udpd = net.createUDPSocket();
	udpd:listen(config.msg.port);
	--Set the socket status variable to false as a signal of disconnect
	local usocket = {
		queue = {},
		lock = false,
		timer = tmr.create()
	};
	local usocket_sent = function()
		udpd:send(usocket.queue[1].port, usocket.queue[1].ip, usocket.queue[1].str);
		table.remove(usocket.queue, 1);
		if #usocket.queue > 0 then
			usocket.timer:start();
		else
			usocket.lock = false;
		end
	end
	usocket.timer:register(UDP_INTERVAL, tmr.ALARM_SEMI, usocket_sent);
	--Send message in queue
	function usocket:send(port, ip, str)
		table.insert(usocket.queue, {
			port = port,
			ip = ip,
			str = str
		});
		if #usocket.queue > 0 and usocket.lock == false then
			usocket.lock = true;
			usocket.timer:start();
		end
	end

	--when message comming
	udpd:on('receive', function(socket, data, port, ip)
		--send message to msg register
		msgReg_run(data);
	end);

--For Debug Purpose
--collectgarbage("collect")
--print('UDP Startup', node.heap())


	--TCP Startup ( Start up a tcp client
	--				to communication with
	--				the director )
	-------------
	--Start TCP Service
	local tcpd = net.createConnection(net.TCP, 0);
	--Set the socket status variable to false as a signal of disconnect
	local socket = {
		queue = {},
		lock = false
	};
	local isOffline = true;
	--Send message in queue
	function socket:send(str)
		table.insert(socket.queue, str);
		if #socket.queue > 0 and socket.sck ~= nil and socket.lock == false then
			socket.sck:send(socket.queue[1]);
			socket.lock = true;
		end
	end
	--when tcp is connected
	tcpd:on('connection', function(sck, data)
		--set socket variable to alive socket object
		socket.sck = sck;
		socket.lock = false;
		--send node info to director
		socket:send(pack.encode({
			nid = config.nid,
			funcID = func.id,
			ip = wifi.sta.getip(),
			port = config.msg.port,
			HeartbeatInterval = config.director.HeartbeatInterval,
			uptime = tmr.time(),
			error = file.getcontents(ERROR_PATH)
		}));
		file.remove(ERROR_PATH);
		--SIGNAL: TCP OK, release timer object
		signal_timer:unregister();
		if func.id == 'default' then
			--if no user Func, signal led on
			gpio.write(SIGNAL_LED, gpio.LOW);
		else
			--if runs user Func, signal led off
			gpio.write(SIGNAL_LED, gpio.HIGH);
		end
	end);
	--when tcp is disconnect or a connect try timeout
	tcpd:on('disconnection', function(sck, data)
		--set socket variable to nil as a signal of disconnect
		socket.sck = nil;
		socket.lock = true;
		--reconnect after 1s
		tmr.create():alarm(1000, tmr.ALARM_SINGLE, function()
			tcpd:connect(config.director.port, config.director.hostname);
		end)
		--SIGNAL: TCP BAD
		setSignalInterval(1000);
	end);
	--when tcp sent
	tcpd:on('sent', function(sck)
		table.remove(socket.queue, 1);
		if #socket.queue > 0 and socket.sck ~= nil then
			sck:send(socket.queue[1]);
			socket.lock = true;
		else
			socket.lock = false;
		end
	end);
	--when tcp incomming message
	tcpd:on('receive', function(sck, data)
		--send message to msg register
		msgReg_run(data);
	end);
	--connect to director with 1000 delay
	tmr.create():alarm(1000, tmr.ALARM_SINGLE, function()
		tcpd:connect(config.director.port, config.director.hostname);
	end)

--For Debug Purpose
--collectgarbage("collect")
--print('TCP Startup', node.heap())


	--MSG Setup ( MSG module is exposed to user
	--			  program runtime environment.
	--			  It provide inter-board communication
	--			  APIs that user' program can easily
	--			  use)
	--------------
	-- MSG Methods
	local msg = {
		send = function(to, name, body, proxy)
			--query target nid in ns
			local port_ip = ns[to];
			if type(proxy) == 'table' and proxy.ip and proxy.port then
				port_ip = proxy;
			end
			--pack the msg body
			local package = pack.encode({
				from = config.nid,
				to = to,
				name = name,
				body = body
			});
			--If no ns record or the proxy params is true, 
			--send via tcp to director
			if port_ip == nil or proxy == true then
				if socket.sck ~= nil then
					--if tcp is alive
					socket:send(package);
					return true;
				else
					--if tcp is dead
					return false;
				end
			end
			--if have ns record, send via udp to target device directly
			usocket:send(port_ip.port, port_ip.ip, package);
			return true;
		end,
		onSend = function(name, method)
			--register a new method to msg register
			msgReg[name] = method;
		end
	}

--For Debug Purpose
--collectgarbage("collect")
--print('MSG Setup', node.heap())


	--DB Setup (DB Module is exposed to user program
	--			runtimg environment. It provide a mini
	--			local key-value database basing on Flash
	--			file system)
	--------------
	--DB Methods
	local db = {
		set = function(key, val) ---(string key, any data) => bool status
			return swap:set(key, val, DB_PREFIX);
		end,
		get = function(key) --(string key) => any data
			return swap:get(key, DB_PREFIX);
		end,
		del = function(key) --(string key) => nil
			swap:del(key, DB_PREFIX);
		end,
		list = function() --() => table ['key']
			return swap:list(DB_PREFIX);
		end,
		clear = function() -- () => nil
			swap:clear(DB_PREFIX);
		end
	}

--For Debug Purpose
--collectgarbage("collect")
--print('DB Setup', node.heap())



	--System APIs (System APIs provide a set of system-level APIs
	--				for the director so it can operate this device)
	-------------
	--getInfo API
	--getInfo method
	local __getInfo = function()
		local nsList = {};
		for k, v in pairs(swap:list(SWAP_PREFIX..'NS/')) do
			nsList[v] = swap:get(v, SWAP_PREFIX..'NS/');
		end
		--Send info package to director
		msg.send('director', '__getInfo', {
			funcID = func.id,
			ip = wifi.sta.getip(),
			port = config.msg.port,
			HeartbeatInterval = config.director.HeartbeatInterval,
			ns = nsList
		}, true);
	end
	rawset(msgReg, '__getInfo', function(from, body)
		if from == 'director' then
			__getInfo();
		end
	end);
	--setNS API
	rawset(msgReg, '__setNS', function(from, body)
		if from == 'director' and type(body) == 'table' then 
			if type(body.nid) == 'string' then
				if type(body.port) == 'number' and type(body.ip) == 'string' then
					--if request body is legal, update local ns
					ns[body.nid] = {
						port = body.port,
						ip = body.ip
					}
				else
					--if request body is legal but no content, del corresponding local ns
					ns[body.nid] = nil;
				end
			else
				--if have ns in request body, then update local ns list
				swap:clear(SWAP_PREFIX..'NS/');
				for k, v in pairs(body) do
					ns[k] = v;
				end
			end
			__getInfo();
		end
	end);
	--checkNS API
	rawset(msgReg, '__checkNS', function(from, body)
		if  type(body) == 'table' and type(body.from) == 'string' and type(body.to) == 'string' and type(body.port) == 'number' and type(body.ip) == 'string' then
			if from == 'director' then
				--if query from director, send to peer via udp
				msg.send(body.to, '__checkNS', body, body);
			else
				--if query from peer, send to director via tcp
				msg.send('director', '__checkNS', body, true);
			end
		end
	end);
	--setFunc API
	rawset(msgReg, '__setFunc', function(from, body)
		if from == 'director' then
			if type(body.func) == 'table' and type(body.func.id) == 'string' and type(body.func.online) == 'string' then
				--if the request body is legal, update local FUNC
				fs.write(FUNC_PATH, body.func);
				--if have ns in request body, then update local ns list
				if type(body.ns) == 'table' then
					swap:clear(SWAP_PREFIX..'NS/');
					for k, v in pairs(body.ns) do
						ns[k] = v;
					end
				end
				db.clear();
				--restart the system to run new Func
				node.restart();
			end
		end
	end);
	--restart API
	msgReg['__restart'] = function(from, body)
		if from == 'director' then
			node.restart();
		end
	end
	--restart API
	msgReg['__reset'] = function(from, body)
		if from == 'director' then
			node.restart();
		end
	end

--For Debug Purpose
--collectgarbage("collect")
--print('System APIs', node.heap())


	--Heartbeat Startup (Heartbeat Service keep the TCP channel
	--					to the director alive to against NAT
	--					timeout.)
	-------------------
	local tcpd_heartbeat_timer = tmr.create():alarm(config.director.HeartbeatInterval, tmr.ALARM_AUTO, function()
		if socket.sck then
			--socket send
			socket:send(pack.encode({
				uptime = tmr.time(),
				heap = node.heap(), --remain RAM
				spiff = file.fsinfo() --remain Flash storage
			}));
		--online
		if isOffline then
			tmr.create():alarm(300, tmr.ALARM_SINGLE, function() 
				__getInfo();
			end);
		end
		isOffline = nil;
		end
	end);

--For Debug Purpose
--collectgarbage("collect")
--print('Heartbeat Startup', node.heap())

	--FUNC Startup (Run the user's program
	--				in sandbox)
	--------------
	--warp running
	local status, errmsg = __run(func.online, db, msg);
	--print(status, errmsg)
	if status then
		--prerecord errormsg
		file.putcontents(ERROR_PATH, 'Unknown Error occurs before 10s after func up');
		--flag watchdog, handle unknown error
		tmr.create():alarm(10000, tmr.ALARM_SINGLE, function()
			--the startup of user program is successful 
			file.remove(FLAG_PATH);
			--remove the prerecord errormsg
			file.remove(ERROR_PATH);
		end);
	else
		--record error
		file.putcontents(ERROR_PATH, errmsg);
		--user program startup fail, restart system
		node.restart();
	end
	--release resources
	status, errmsg = nil, nil;

--For Debug Purpose
--collectgarbage("collect")
--print('FUNC Startup', node.heap())


	--SIGNAL: FUNC OK
	setSignalInterval(1000);

end);

--Boot __main process with a sandbox for user program running
coroutine.resume(__main, function(func, db, msg) --This is a sandbox env for user's program
												-- (function userProgram, module db, module msg) => bool status, string errMessage
	--handle string to code error
	local status, res = pcall(loadstring, 'return function(db, msg) '..func..' end');
	if not status then
		return status, res;
	else
		--handle syntax error
		status, res = pcall(res);
		if not status then
			return status, res;
		else
			--handle permission error
			return pcall(res, db, msg);
		end
	end
	return 
end);
