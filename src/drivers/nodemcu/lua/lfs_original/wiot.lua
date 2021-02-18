-- WIOT Lua Firmware on NodeMCU
__main = coroutine.create(function(__run)
	--Packages Used: file, sjson, encoder, timer, node, wifi, net, gpio, uart

	--Global Constant
	-----------------
	local CONFIG_PATH = 'config.json';
	local FLAG_PATH = '__system/flag';
	local FUNC_PATH = 'func.json';
	local DB_PREFIX = '__data/';
	local SWAP_PREFIX = '__system/swap/';
	local SIGNAL_LED = 0;

--For Debug Purpose
--collectgarbage("collect")
--print('Global Constant', node.heap())


	--Global Methods (in RAM)
	----------------
	-- Package Methods
	local pack = {
		encode = function(obj)
			local status, json = pcall(sjson.encode, {obj});
			if status then
				return string.sub(json, 2, -2);
			else
				return '';
			end
		end,
		decode = function(str)
			if type(str) ~= 'string' then
				return nil
			end;
			local status, obj = pcall(sjson.decode, '['..str..']');
			if status then
				return obj[1];
			else
				return nil;
			end
		end
	}
	-- File Object Operation
	local fs = {
		read = function(f)--f:filename
				return pack.decode(file.getcontents(f));
		end,
		write = function(f, obj)
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
	local stringSplit = function(str, reps)
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
	local setSignalInterval = function(interval)
		signal_timer:alarm(interval, tmr.ALARM_AUTO, function()
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
	local config = fs.read(CONFIG_PATH);

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
	function swap:set(key, val, prefix)
		return fs.write(prefix..encoder.toBase64(key), val);
	end
	function swap:get(key, prefix)
		return fs.read(prefix..encoder.toBase64(key));
	end
	function swap:del(key, prefix)
		file.remove(prefix..encoder.toBase64(key));
	end
	function swap:list(prefix)
		local fileList = file.list(prefix..'.');
		local keys = {};
		for k, v in pairs(fileList) do
			table.insert(keys, encoder.fromBase64(string.sub(k, #prefix + 1)));
		end
		return keys;
	end
	function swap:clear(prefix)
		for index, key in pairs(self:list(prefix)) do
			self:del(key, prefix);
		end
	end

--For Debug Purpose
--collectgarbage("collect")
--print('SWAP Setup', node.heap())


	--Name Service (NS) Setup
	--------------------
	local ns = setmetatable({}, {
		__index = function(table, key)
			local res = swap:get(key, SWAP_PREFIX..'NS/');
			if res == nil or res.port == nil or res.ip == nil then
				return nil;
			else
				return res;
			end
		end,
		__newindex = function(table, key, val)
				swap:set(key, val, SWAP_PREFIX..'NS/');
		end
	});

--For Debug Purpose
--collectgarbage("collect")
--print('NS Setup', node.heap())


	--MSG Register Init
	-------------------
	--MSG Register Clear
	swap:clear(SWAP_PREFIX..'M/');
	--MSG register (in SWAP)
	local msgReg = setmetatable({}, {
		__index = function(table, key)
			local res = swap:get(key, SWAP_PREFIX..'M/');
			if res == nil then
				return nil;
			else
				return loadstring(encoder.fromBase64(res));
			end
		end,
		__newindex = function(table, key, val)
			if type(val) ~= 'function' then
				swap:del(key, SWAP_PREFIX..'M/');
			else
				swap:set(key, encoder.toBase64(string.dump(val)), SWAP_PREFIX..'M/');
			end
		end
	});
	--MSG Reg Method
	msgReg_run = function(data)
		--decode data
		local data = pack.decode(data);
		--check data
		if type(data) ~= 'table' or type(data.from) ~= 'string' or type(data.name) ~= 'string' or data.to ~= config.nid then
			return nil;
		end;
		--Search mached methods in MSG register
		local method = msgReg[data.name];
		if type(method) == 'function' then
			print(pcall(method, data.from, data.body));
		end
	end

--For Debug Purpose
--collectgarbage("collect")
--print('MSG Register Init', node.heap())


	--UDP Startup
	-------------
	--Start UDP Service
	local udpd = net.createUDPSocket();
	udpd:listen(config.msg.port);
	udpd:on('receive', function(socket, data, port, ip)
		msgReg_run(data);
	end);

--For Debug Purpose
--collectgarbage("collect")
--print('UDP Startup', node.heap())

	--TCP Startup
	-------------
	--Start TCP Service
	local tcpd = net.createConnection(net.TCP, 0);
	local socket = nil;
	tcpd:on('connection', function(sck, data) 
		socket = sck;
		--SIGNAL: TCP OK, delete timer object
		setSignalInterval = nil;
		signal_timer:unregister();
		signal_timer = nil;
		gpio.write(SIGNAL_LED, gpio.HIGH);
	end);
	tcpd:on('disconnection', function(sck, data) 
		socket = nil;
	end);
	tcpd:on('receive', function(sck, data)
		msgReg_run(data);
	end);
	--connect to director
	tmr.create():alarm(3000, tmr.ALARM_AUTO, function()
		if socket == nil then
			tcpd:connect(config.director.port, config.director.ip);
		end
	end)

--For Debug Purpose
--collectgarbage("collect")
--print('TCP Startup', node.heap())


	--MSG Setup
	--------------
	-- MSG Methods
	local msg = {
		send = function(to, name, body, proxy)
			local port_ip = ns[to];
			local package = pack.encode({
				from = config.nid,
				to = to,
				name = name,
				body = body
			});
			if port_ip == nil or proxy == true then
				if socket ~= nil then
					socket:send(package);
					return ture;
				else
					return false;
				end
			end
			udpd:send(port_ip.port, port_ip.ip, package);
			return true;
		end,
		onSend = function(name, method)
			msgReg[name] = method;
		end
	}

--For Debug Purpose
--collectgarbage("collect")
--print('MSG Setup', node.heap())


	--DB Setup
	--------------
	--DB Methods
	local db = {
		set = function(key, val)
			return swap:set(key, val, DB_PREFIX);
		end,
		get = function(key)
			return swap:get(key, DB_PREFIX);
		end,
		del = function(key, prefix)
			swap:del(key, DB_PREFIX);
		end,
		list = function(prefix)
			return swap:list(DB_PREFIX);
		end,
		clear = function()
			swap:clear(DB_PREFIX);
		end
	}

--For Debug Purpose
--collectgarbage("collect")
--print('DB Setup', node.heap())


	--Heartbeat Startup
	-------------------
	local tcpd_heartbeat_timer = tmr.create():alarm(config.director.HeartbeatInterval, tmr.ALARM_AUTO, function()
		if socket then
			socket:send(config.nid..':'..tostring(tmr.time()));
		end
	end);

--For Debug Purpose
--collectgarbage("collect")
--print('Heartbeat Startup', node.heap())


	--System APIs
	-------------
	--getInfo API
	rawset(msgReg, '__getInfo', function(from, body)
		if from == 'director' then
			msg.send('director', '__getInfo', {
				remainHeap = node.heap(),
				remainFS = file.fsinfo(),
				msgPort = config.msg.port,
				HeartbeatInterval = config.director.HeartbeatInterval,
				ns = swap:list(SWAP_PREFIX..'NS/'),
				funcID = func.id
			}, true);
		end
	end);
	--setNS API
	rawset(msgReg, '__setNS', function(from, body)
		if from == 'director' and type(body) == 'table' and type(body.nid) == 'string' then
			if type(body.port) == 'number' and type(body.ip) == 'string' then
				ns[body.nid] = {
					port = body.port,
					ip = body.ip
				}
			else
				ns[body.nid] = nil;
			end
		end
	end);
	--checkNS API
	rawset(msgReg, '__checkNS', function(from, body)
		if  type(body) == 'string' then
			if from == 'director' then
				msg.send(body, '__checkNS', config.nid);
			else
				msg.send('director', '__checkNS', body, true);
			end
		end
	end);
	--setFunc API
	rawset(msgReg, '__setFunc', function(from, body)
		if from == 'director' then
			if type(body.func) == 'table' and type(body.func.id) == 'string' and type(body.func.online) == 'string' then
				fs.write(FUNC_PATH, body.func);
				if type(body.ns) == 'table' then
					swap:clear(SWAP_PREFIX..'NS/');
					for k, v in pairs(body.ns) do
						ns[k] = v;
					end
				end
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

--For Debug Purpose
--collectgarbage("collect")
--print('System APIs', node.heap())


	--FUNC Startup
	--------------
	--Load Func to RAM
	local func = fs.read(FUNC_PATH);
	--Default Mode
	if type(func) ~= 'table' or type(func.id) ~= 'string' or type(func.online) ~= 'string' then
		func = {
			id = 'default',
			online = ''
		}
	end
	--warp running
	--print(func.id)
	local status, errmsg = __run(func.online, db, msg);
	--print(status, errmsg)
	if status then
		tmr.create():alarm(10000, tmr.ALARM_SINGLE, function()
			file.remove(FLAG_PATH);
		end);
	else
		node.restart();
	end
	status, errmsg = nil, nil;

--For Debug Purpose
--collectgarbage("collect")
--print('FUNC Startup', node.heap())


	--SIGNAL: FUNC OK
	setSignalInterval(1000);

end);

--Boot __main env with a sandbox for user program running
coroutine.resume(__main, function(func, db, msg)
	local status, res = pcall(loadstring, 'return function(db, msg) '..func..' end');
	if not status then
		return status, res;
	else
		status, res = pcall(res);
		if not status then
			return status, res;
		else
			return pcall(res, db, msg);
		end
	end
	return 
end);
