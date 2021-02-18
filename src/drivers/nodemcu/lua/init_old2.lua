tmr.create():alarm(5000, tmr.ALARM_SINGLE, function()
print('total', node.heap());
(function(__run)
	--Packages Used: file, sjson, http, httpserver, mqtt, encoder, timer, node, wifi, gpio
collectgarbage("collect")
print('close', node.heap())

	--SYSTEM CONSTANT
	local CONFIG_PATH = 'config.json';
	local DEFAULT_CONFIG = {
		nid = 'default',
		offlineOnly = true,
		signalPin = 0,
		flag_MaxRetryTimes = 200,
		flag_MaxResetTimes = 3,
		func_offline_MaxWaitTime = 60,
		func_online_MaxWaitTime = 60,
		fs_prefix_root = '',
		fs_prefix_system = '__system/',
		fs_prefix_data = '__data/',
		fs_prefix_swap = '__system/swap/',
		fs_filename_nsmap = 'ns.map',
		fs_filename_flag = 'flag',
		fs_filename_func = 'func.json',
		fs_filename_error = 'error',
		wifi_CheckInterval = 1000,
		wifi_config_ssid = '',
		wifi_config_pwd = '',
		wifi_config_save = false,
		http_port = 6789,
		http_api_discover = '/discover',
		mqtt_host = 'mqtt.yimian.xyz',
		mqtt_port = 1883,
		mqtt_user = nil,
		mqtt_password = nil,
		mqtt_tls = false,
		mqtt_keepaliverTimer = 30,
		mqtt_topicPrefix = '/wiot/default/',
		mqtt_ConnectRetryInterval = 2000,
		mqtt_OfflineRetryInterval = 3000,
		mqtt_PostCheckInterval = 100,
		mqtt_PostTimeout = 10
	}
collectgarbage("collect")
print('SYSTEM CONSTANT', node.heap())

	--Init Global Methods
	---------------------
	-- File Object Operation
	local fs = {
		read = function(f)--f:filename
			local status, obj = pcall(sjson.decode, file.getcontents(f));
			if status then
				return obj;
			else
				return {};
			end
		end,
		write = function(f, obj)
			local status, json = pcall(sjson.encode, obj);
			if status then
				return file.putcontents(f, json);
			else
				return false;
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


collectgarbage("collect")
print('Init Global Methods', node.heap())



	--Config Loading
	-----------------
	--load user config
	config = fs.read(CONFIG_PATH);
	--print sth here, otherwise cause error. Amazing.
	print('');
	--merge user and default config
	for k, v in pairs(DEFAULT_CONFIG) do 
		if config[k] == nil then 
			config[k] = v;
		end
	end
	--release resource
	DEFAULT_CONFIG = nil;
collectgarbage("collect")
print('Config Loading', node.heap())


	--SWAP Medthods
	----------------
	local swap = {
		set = function(index, val)
			fs.write(config.fs_prefix_swap..index, {val});
		end,
		get = function(index)
			return fs.read(config.fs_prefix_swap..index)[1];
		end
	}
collectgarbage("collect")
print('SWAP Medthods', node.heap())

--[[
	--CONFIG to SWAP
	----------------
	for k, v in pairs(config) do
		swap.set('C'..k, v);
	end
	config = setmetatable({
		fs_prefix_swap = config.fs_prefix_swap
	}, {
		__index = function(table, key)
			return swap.get('C'..key);
		end
	});

collectgarbage("collect")
print('CONFIG to SWAP', node.heap())
]]
	--Variables in SWAP
	----------------
	var = setmetatable({}, {
		__index = function(table, key)
			return swap.get('V'..key);
		end,
		__newindex = function(table, key, val)
			swap.set('V'..key, val);
		end
	});
collectgarbage("collect")
print('Variables in SWAP', node.heap())

	--Methods in SWAP
	----------------
	f = setmetatable({}, {
		__index = function(table, key)
			return loadstring(encoder.fromBase64(swap.get('F'..key)));
		end,
		__newindex = function(table, key, val)
			swap.set('F'..key, encoder.toBase64(string.dump(val)));
		end
	});
collectgarbage("collect")
print('Methods in SWAP', node.heap())


	--_
	f._restart = function(err)
		if err then
			file.putcontents(config.fs_prefix_system..config.fs_filename_error, tostring(err));
		end
		node.restart();
	end
	f._reset = function()
		file.remove(_.config.v.fs.prefix.system.._.config.v.fs.filename.error);
		file.remove(_.config.v.fs.prefix.system.._.config.v.fs.filename.func);
		file.remove(_.config.v.fs.prefix.system.._.config.v.fs.filename.flag);
		node.restart();
	end


	--flag
	f.flag_load = function()
		local flag = file.getcontents(config.fs_prefix_system..config.fs_filename_flag);
		if flag then 
			var.flag_v = tonumber(flag);
		end
	end
	f.flag_set = function(val)
		var.flag_v = val;
		file.putcontents(config.fs_prefix_system..config.fs_filename_flag, tostring(val));
	end
	f.flag_ward = function(func)
		func();
		f.flag_set(var, config, -1);
	end

	--signal
	f.signal_init = function()
		gpio.mode(config.signalPin, gpio.OUTPUT);
		signal_v = tmr.create();
	end
	f.signal_set = function(interval_ms)
		signal_v:alarm(interval_ms, tmr.ALARM_AUTO, function()
			if gpio.read(config.signalPin) == gpio.HIGH then
				gpio.write(config.signalPin, gpio.LOW);
			else
				gpio.write(config.signalPin, gpio.HIGH);
			end
		end);
	end
	f.signal_destroy = function()
		gpio.write(config.signalPin, gpio.HIGH);
		signal_v:unregister();
		signal_v = nil;
	end

	--timer
	f.timer_setTimeout = function(func, time_ms)
		return tmr.create():alarm(time_ms, tmr.ALARM_SINGLE, func);
	end

	f.timer_setInterval = function(func, time_ms)
		return tmr.create():alarm(time_ms, tmr.ALARM_AUTO, func);
	end

	--mqtt
	f.mqtt_getTopic = function(s)
		return _.config.v.mqtt.topicPrefix.._.config.v.nid..'/'..s;
	end
	f.mqtt_start = function()
		mqtt_v:connect(
			config.mqtt_host, 
			config.mqtt_port, 
			config.mqtt_tls,
			function(client)
				client:subscribe(f.mqtt_getTopic('msg/#'));
				client:subscribe(f.mqtt_getTopic('ctl/#'));
				client:publish(f.mqtt_getTopic('status'), 'online', 0, 0);
			end,
			function(client, reason)
				f.timer_setTimeout(f.mqtt_start, config.mqtt_ConnectRetryInterval);
			end
		);
	end





collectgarbage("collect")
print('Methods in SWAP', node.heap())




	--Environment Loading & Checking
	----------------------
	--Flag Checking
	f.flag_load();
	if var.flag_v == nil then
		f.flag_set(0);
	end
	--User Func Checking
	local func = fs.read(config.fs_prefix_system..config.fs_filename_func);
	if func and func.id and func.offline and func.online then
		var.func_id = func.id;
		var.func_offline = func.offline;
		var.func_online = func.online;
	end
	func = nil;

collectgarbage("collect")
print('Environment Loading & Checking', node.heap())


	--System Preparation
	--------------------
	--Signal Start
	f.signal_init();
	collectgarbage("collect")
print('System Preparation', node.heap())
	f.signal_set(1500);
	collectgarbage("collect")
print('System Preparation', node.heap())
	--Decide System Mode
	f.flag_set(var.flag_v + 1);
	collectgarbage("collect")
print('System Preparation', node.heap())
	if var.flag_v >= config.flag_MaxRetryTimes and var.flag_v <= config.flag_MaxRetryTimes + config.flag_MaxResetTimes  then
		f._reset();
	elseif var.flag_v > config.flag_MaxRetryTimes + config.flag_MaxResetTimes then
		--safe mode
		--Signal set
		f.signal_set(3000);
		do return end;
	end

collectgarbage("collect")
print('System Preparation', node.heap())



	--OFFLINE System Launch
	-----------------------
	--Signal set
	f.signal_set(800);
	--Run user offline func
	f.flag_ward(function()
		tmr.softwd(config.func_offline_MaxWaitTime); --start watchdog
		if not __run(var.func_offline) then --enable DB and disable MSG
			f._restart('Offline Func Startup Fail..');
		end
		tmr.softwd(-1); --disable watchdog
	end);
collectgarbage("collect")
print('OFFLINE System Launch', node.heap())


end)(function(func)
	return pcall(loadstring(func));
end);
end);
