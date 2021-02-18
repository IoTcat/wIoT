tmr.delay(3000000);
print('total'..node.heap());
(function(__run)
	--Packages Used: file, sjson, http, httpserver, mqtt, encoder, timer, node, wifi, gpio
print('close'..node.heap())

	--Global Methods
	---------------
	-- File Object Operation
	local f = {};
	--f
	f.read = function(f)--f:filename
		local status, obj = pcall(sjson.decode, file.getcontents(f));
		if status then
			return obj;
		else
			return {};
		end
	end
	f.write = function(f, obj)
		local status, json = pcall(sjson.encode, obj);
		if status then
			return file.putcontents(f, json);
		else
			return false;
		end
	end
	--split string
	local stringSplit = function(str, reps)
	    local resultStrList = {}
	    string.gsub(str,'[^'..reps..']+', function (w)
	        table.insert(resultStrList,w);
	    end);
	    return resultStrList;
	end

	--Method Declaration
	--------------------
	_ = {
		_ = {
			restart = nil,
			reset = nil
		},
		init = {
			http = nil,
			mqtt = nil,
			onlineFunc = nil
		},
		config = {
			v = nil,
			path = 'config.json',
			default = {
				nid = 'default',
				offlineOnly = true,
				signalPin = 0,
				flag = {
					MaxRetryTimes = 2,
					MaxResetTimes = 3
				},
				func = {
					offline = {
						MaxWaitTime = 60
					},
					online = {
						MaxWaitTime = 60
					}
				},
				fs = {
					prefix = {
						root = '',
						system = '__system/',
						data = '__data/',
						swap = '__system/swap/'
					},
					filename = {
						nsmap = 'ns.map',
						flag = 'flag',
						func = 'func.json',
						error = 'error.json'
					}
				},
				wifi = {
					CheckInterval = 1000,
					config = {
						ssid = '',
						pwd = '',
						save = false
					}
				},
				http = {
					port = 6789,
					api = {
						discover = '/discover'
					}
				},
				mqtt = {
					host = 'mqtt.yimian.xyz',
					port = 1883,
					user = nil,
					password = nil,
					tls = false,
					keepaliveTimer = 30,
					topicPrefix = '/wiot/default/',
					ConnectRetryInterval = 2000,
					OfflineRetryInterval = 3000,
					PostCheckInterval = 100,
					PostTimeout = 10
				}
			}
		},
		flag = {
			v = nil,
			set = nil,
			load = nil
		},
		func = {
			id = nil,
			offline = nil,
			online = nil
		},
		table = {
			merge = nil
		},
		timer = {
			setTimeout = nil,
			setInterval = nil
		},
		signal = {
			init = nil,
			set = nil,
			destroy = nil,
			v = nil
		},
		http = {
			v = nil
		},
		mqtt = {
			getTopic = nil,
			v = nil
		},
		f = {
			read = nil,
			write = nil
		},
		ns = {
			set = nil,
			get = nil,
			render = nil,
			exist = nil,
			check = nil,
			verify = nil
		},
		package = {
			pack = nil,
			depack = nil,
			set = nil,
			get = nil
		},
		db = {
			public = {
				keys = nil,
				get = nil,
				set = nil,
				del = nil,
				clear = nil
			},
			toIndex = nil,
			fromIndex = nil,
			getFileName = nil
		},
		msg = {
			reg = {
				send = {},
				post = {} 
			},
			postWaitList = {},
			public = {
				post = nil,
				send = nil,
				onPost = nil,
				onSend = nil
			},
			mpost = nil,
			msend = nil,
			dpost = nil,
			dsend = nil
		},
		api = {
			http = {
				discover = nil,
				msg = nil
			},
			mqtt = {
				msg = nil,
				heartbeat = nil,
				ns = nil,
				func = nil,
				restart = nil
			}
		}
	};

print('_.all'..node.heap())
print(_.config.default.nid);


	local CONFIG_DEFAULT = {
			nid = 'default',
			offlineOnly = true,
			signalPin = 0,
			flag = {
				MaxRetryTimes = 2,
				MaxResetTimes = 3
			},
			func = {
				offline = {
					MaxWaitTime = 60
				},
				online = {
					MaxWaitTime = 60
				}
			},
			fs = {
				prefix = {
					root = '',
					system = '__system/',
					data = '__data/',
					swap = '__system/swap/'
				},
				filename = {
					nsmap = 'ns.map',
					flag = 'flag',
					func = 'func.json',
					error = 'error.json'
				}
			},
			wifi = {
				CheckInterval = 1000,
				config = {
					ssid = '',
					pwd = '',
					save = false
				}
			},
			http = {
				port = 6789,
				api = {
					discover = '/discover'
				}
			},
			mqtt = {
				host = 'mqtt.yimian.xyz',
				port = 1883,
				user = nil,
				password = nil,
				tls = false,
				keepaliveTimer = 30,
				topicPrefix = '/wiot/default/',
				ConnectRetryInterval = 2000,
				OfflineRetryInterval = 3000,
				PostCheckInterval = 100,
				PostTimeout = 10
			}
		}


	--Merge config
	----------------------
	--Methods preparation
	-- merge two tables
	tableMerge = function(a, b)
        for k, v in pairs(b) do
        	if type(v) == 'table' and type(a[k] or false) == 'table' then
        		a[k] = tableMerge(a[k], v);
        	else
        		a[k] = v;
        	end
        end
	    return a;
	end
print('merge.p'..node.heap())
	--Exec
	_.config.v = _.config.default;
	_.config.v = tableMerge(_.config.v, f.read(_.config.path));
print('merge.e'..node.heap())
	--Release Resources
	tableMerge = nil;
	fRead = nil;
	collectgarbage("collect");
print(_.config.v.wifi.config.ssid)
print(_.config.v.mqtt.host)
print('merge.r'..node.heap())


	--Load SWAP
	-----------
	--Methods Preparation
	Load_ToSwap = function(obj, s)
		print('swap.p'..node.heap()..s)
		for k, v in pairs(_) do
			s = s..'_'..encoder.toBase64(k);
			if type(v) == 'table' then
				Load_ToSwap(v, s);
			else
				file.putcontents(_.config.v.fs.prefix.swap..s, v);
			end
		end
	end
print('swap.p'..node.heap())
	-- Exec
	Load_ToSwap(_.config.v, encoder.toBase64('config')..'_'..encoder.toBase64('v'));
	local SWAP_PREFIX = _.config.v.fs.prefix.swap;
print('swap.e'..node.heap())
	--Release Resources
	Load_ToSwap = nil;
	_ = nil;
print('swap.r'..node.heap())
	--Global APIs
	_ = setmetaltable({}, {
		__index = function(table, key)
			local arr = stringSplit(key, '_');
			local s = '';
			for v in arr do 
				s = s..'_'..encoder.toBase64(v);
			end
			return file.getcontents(SWAP_PREFIX..s);
		end,
		__newindex = function(table, key, val)
			local arr = stringSplit(key, '_');
			local s = '';
			for v in arr do 
				s = s..'_'..encoder.toBase64(v);
			end
			if type(val) == 'function' then
				val = string.dump(val);
			end
			file.putcontents(SWAP_PREFIX..s, val);
		end
	});
print('swap.a'..node.heap())
	print(_.config_v_nid);


	--package loaded
	----------------
	local httpserver = dofile('httpserver.lua');


	--Method Defination
	-------------------
	--_
	_._.restart = function(err)
		if err then
			file.putcontents(_.config.v.fs.prefix.system.._.config.v.fs.filename.error, tostring(err));
		end
		node.restart();
	end
	_._.reset = function()
		file.remove(_.config.v.fs.prefix.system.._.config.v.fs.filename.error);
		file.remove(_.config.v.fs.prefix.system.._.config.v.fs.filename.func);
		file.remove(_.config.v.fs.prefix.system.._.config.v.fs.filename.flag);
		node.restart();
	end

	--flag
	_.flag.load = function()
		_.flag.v = tonumber(file.getcontents(_.config.v.fs.prefix.system.._.config.v.fs.filename.flag));
	end
	_.flag.set = function(val)
		_.config.flag.v = val;
		file.putcontents(_.config.v.fs.prefix.system.._.config.v.fs.filename.flag, tostring(val));
	end
	_.flag.ward = function(f)
		f();
		_.flag.set(-1);
	end
	--table

	--timer
	_.timer.setTimeout = function(f, time_ms)
		return tmr.create():alarm(time_ms, tmr.ALARM_SINGLE, f);
	end
	_.timer.setInterval = function(f, time_ms)
		return tmr.create():alarm(time_ms, tmr.ALARM_AUTO, function(timer)
			f(function(delay_time_ms)
				if delay_time_ms < 0 then
					timer:unregister();
				else
					timer:stop();
					_.timer.setTimeout(function()
						timer:start();
					end, delay_time_ms);
				end
			end)
		end);
	end

	--signal
	_.signal.init = function()
		gpio.mode(_.config.v.signalPin, gpio.OUTPUT);
		_.signal.v = tmr.create();
	end
	_.signal.set = function(interval_ms)
		_.signal.v:alarm(interval_ms, tmr.ALARM_AUTO, function()
			if gpio.read(_.config.v.signalPin) == gpio.HIGH then
				gpio.write(_.config.v.signalPin, gpio.LOW);
			else
				gpio.write(_.config.v.signalPin, gpio.HIGH);
			end
		end);
	end
	_.signal.destroy = function()
		gpio.write(_.config.v.signalPin, gpio.HIGH);
		_.signal.v:unregister();
		_.signal.v = nil;
	end

	--mqtt
	_.mqtt.getTopic = function(s)
		return _.config.v.mqtt.topicPrefix.._.config.v.nid..'/'..s;
	end
	_.mqtt.start = function()
		_.mqtt.v:connect(
			_.config.v.mqtt.host, 
			_.config.v.mqtt.port, 
			_.config.v.mqtt.tls,
			function(client)
				client:subscribe(_.mqtt.getTopic('msg/#'));
				client:subscribe(_.mqtt.getTopic('ctl/#'));
				client:publish(_.mqtt.getTopic('status'), 'online', 0, 0);
			end,
			function(client, reason)
				_.timer.setTimeout(_.mqtt.start, _.config.v.mqtt.ConnectRetryInterval);
			end
		);
	end



	--ns
	_.ns.set = function(obj)
		return _.f.write(_.config.v.fs.prefix.system.._.config.v.fs.filename.nsmap, obj);
	end
	_.ns.get = function()
		return _.f.read(_.config.v.fs.prefix.system.._.config.v.fs.filename.nsmap);
	end
	_.ns.render = function(nid)
		for k, v in pairs(_.ns.get()) do
			if k == nid and v then
				return v;
			end
		end
		return nid;
	end
	_.ns.exist = function(nid)
		if _.ns.render(nid) == nid then
			return false;
		else
			return true;
		end
	end
	_.ns.check = function(nid, ip, cb)--cb:bool status
		http.post('http://'..ip.._.config.v.http.api.discover, nil, '', function(code, data)
			if code ~= 200 or data ~= nid then
				cb(false);
			else
				cb(true);
			end
		end);
	end
	_.ns.verify = function()
		local ns = _.ns.get();
		for k, v in pairs(ns) do
			_.ns.check(k, v, function(status)
				if not status then
					ns[k] = false;
					_.ns.set(ns);
				end
			end)
		end
	end

	--package
	_.package.pack = function(o)
		local status, json = pcall(sjson.encode, o);
		if status then
			return json;
		else
			return nil;
		end
	end
	_.package.depack = function(s)
		local status, obj = pcall(json.decode, s);
		if status then
			return obj;
		else
			return {};
		end
	end
	_.package.set = function(to, body, mode)--to:nid, body:obj
		local o = {
			from = _.config.v.nid,
			to = to,
			mode = mode,
			body = body
		}
		return _.package.pack(o);
	end
	_.package.get = function(pack)--string package
		local status, obj = pcall(json.decode, pack);
		if status and obj.from and obj.mode then
			return obj.from, obj.body, obj.mode;
		else
			return nil, nil, nil;
		end
	end

	--db
	_.db.toIndex = function(key)
		return encoder.toBase64(key);
	end
	_.db.fromIndex = function(index)
		return encoder.fromBase64(index);
	end
	_.db.getFileName = function(key)
		return _.config.v.fs.prefix.data.._.db.toIndex(key);
	end
	_.db.public.keys = function() --list all keys with size
		local o = {};
		for k, v in pairs(file.list(_.config.v.fs.prefix.data..'.')) do
			o[_.db.fromIndex(k)] = v;
		end
		return o;
	end
	_.db.public.get = function(key)
		return _.f.read();
	end
	_.db.public.set = function(key, obj)
		return _.f.write(_.db.getFileName(key), obj);
	end
	_.db.public.del = function(key)
		local fileName = _.db.getFileName(key);
		file.remove(fileName);
		return not file.exists(fileName);
	end
	_.db.public.clear = function()
		local flag = true;
		for k, v in pairs(_.db.public.keys()) do
			flag = flag and _.db.public.del(k);
		end
		return flag;
	end

	--msg
	_.msg.dpost = function(to, name, body, cb)--return (bool status, data)
		if _.ns.exist(to) then
			http.post(
				'http://'.._.ns.render(to)..'/msg/'..encoder.toBase64(name),
				'Content-Type: application/json\r\n',
				_.package.set(to, body, 'post'),
				function(code, res)
					if code ~= 200 then
						cb(false);
					else
						cb(true, _.package.get(res));
					end
				end
			);
		else
			cb(false);
		end
	end
	_.msg.dsend = function(to, name, body)
		if _.ns.exist(to) then
			http.post(
				'http://'.._.ns.render(to)..'/msg/'..encoder.toBase64(name),
				'Content-Type: application/json\r\n',
				_.package.set(to, body, 'send'),
				function(code, res) end
			);
		end
	end
	_.msg.mpost = function(to, name, body, cb)
		_.msg.postWaitList[encoder.toBase64(name)..to] = false;
		local PostBeginAt = tmr.time();
		_.timer.setInterval(function(delay)
			if _.msg.postWaitList[encoder.toBase64(name)..to] ~= false then
				cb(true, _.msg.postWaitList[encoder.toBase64(name)..to]);
				_.msg.postWaitList[encoder.toBase64(name)..to] = nil;
				delay(-1);
			else
				if PostBeginAt < tmr.time() - _.config.v.mqtt.PostTimeout then
					cb(false);
					_.msg.postWaitList[encoder.toBase64(name)..to] = nil;
					delay(-1);
				end
			end
		end, _.config.v.mqtt.PostCheckInterval);
		_.mqtt.v:publish(
			_.config.v.mqtt.topicPrefix..to..'/'..encoder.toBase64(name),
			_.package.set(to, body, 'post'),
			1,
			0
		);
	end
	_.msg.msend = function(to, name, body)
		_.mqtt.v:publish(
			_.config.v.mqtt.topicPrefix..to..'/'..encoder.toBase64(name),
			_.package.set(to, body, 'send'),
			0,
			0
		);
	end
	_.msg.public.onSend = function(name, f)--f:return (body, from)
		_.msg.reg.send[encoder.toBase64(name)] = f;
	end
	_.msg.public.onPost = function(name, f)--f:return body, from, reply(reply_body)
		_.msg.reg.post[encoder.toBase64(name)] = f;
	end
	_.msg.public.send = function(to, name, body)
		if _.ns.exist(to) then
			_.msg.dsend(to, name, body);
		else
			_.msg.msend(to, name, body);
		end
	end
	_.msg.public.post = function(to, name, body, cb)
		if _.ns.exist(to) then
			_.msg.dpost(to, name, body, cb);
		else
			_.msg.mpost(to, name, body, cb);
		end
	end

	--api
	_.api.http.discover = function(res)
		res.finish(_.config.v.nid, 200);
	end
	_.api.http.msg = function(name, req, res)
		local data = '';
		req.ondata = function(req, chunk)
			if chunk ~= nil then
				data = data..chunk;
			else
				local from, body, mode = _.package.get(data);
				if mode == 'send' then
					res.finish();
					for k, v in pairs(_.msg.reg.send) do
						if k == name then
							v(body, from);
							return;
						end
					end
				elseif mode == 'post' then
					for k, v in pairs(_.msg.reg.post) do
						if k == name then
							v(body, from, function(reply_body)
								res.finish(_.package.set(from, reply_body, 'reply'));
							end);
							return;
						end
					end
					res.finish(nil, 404);
				end
			end
		end
	end
	_.api.mqtt.msg = function(name, data)
		local from, body, mode = _.package.get(data);
		if mode == 'send' then
			for k, v in pairs(_.msg.reg.send) do
				if k == name then
					v(body, from);
					return;
				end
			end
		elseif mode == 'post' then
			for k, v in pairs(_.msg.reg.post) do
				if k == name then
					v(body, from, function(reply_body)
						_.mqtt.v:publish(_.config.v.mqtt.topicPrefix..from..'/msg/'..name.._.config.v.nid, _.package.set(from, reply_body, 'reply'), 1, 0);
					end);
					return;
				end
			end
		elseif mode == 'reply' then
			for k, v in pairs(_.msg.postWaitList) do
				if k == name then
					_.msg.postWaitList[k] = body;
					return;
				end
			end
		end
	end
	_.api.mqtt.heartbeat = function()
		local o = {
			nid = _.config.v.nid,
			uptime = tmr.time(),
			heap = node.heap(),
			funcID = _.func.id,
			ip = wifi.sta.getip(),
			ns = _.ns.get()
		}
		_.mqtt.v:publish(_.mqtt.getTopic('heartbeat'), _.package.pack(o), 0, 0);
	end
	_.api.mqtt.ns = function(data)
		local obj = _.package.depack(data);
		_.ns.set(obj);
	end
	_.api.mqtt.func = function(data)
		local obj = _.package.depack(data);
		_.f.write(_.config.v.fs.prefix.system.._.config.v.fs.filename.func, obj);
		_._.restart();
	end
	_.api.mqtt.restart = function()
		_._.restart();
	end


	--Environment Loading & Checking
	----------------------
	--Flag Checking
	_.flag.load();
	if _.flag.v == nil then
		_.flag.set(0);
	end

	--User Func Checking
	local func = _.f.read(_.config.v.fs.prefix.system.._.config.v.fs.filename.func);
	if func and func.id and func.offline and func.online then
		_.func.id = func.id;
		_.func.offline = func.offline;
		_.func.online = func.online;
	end
	func = nil;

	--System Preparation
	--------------------
	--Signal Start
	_.signal.init();
	_.signal.set(1500);
	--Decide System Mode
	_.flag.set(_.flag.v + 1);
	if _.flag.v >= _.config.v.flag.MaxRetryTimes and _.flag.v <= _.config.v.flag.MaxRetryTimes + _.config.v.flag.MaxResetTimes  then
		_._.reset();
	elseif _.flag.v > _.config.v.flag.MaxRetryTimes + _.config.v.flag.MaxResetTimes then
		--safe mode
		--Signal set
		_.signal.set(3000);
		do return end;
	end

	--OFFLINE System Launch
	-----------------------
	--Signal set
	_.signal.set(800);
	--Run user offline func
	_.flag.ward(function()
		tmr.softwd(_.config.v.func.offline.MaxWaitTime); --start watchdog
		if not __run(_.func.offline, _.timer, _.db.public, nil) then --enable DB and disable MSG
			_._.restart('Offline Func Startup Fail..');
		end
		tmr.softwd(-1); --disable watchdog
	end);

	--Network Modules Init
	----------------------
	--If OFFLINEONLY is configed, do not start network 
	if _.config.v.offlineOnly == true then
		return;
	end
	--Signal set
	_.signal.set(200);
	--Connect to wifi AP
	wifi.setmode(wifi.STATION);
	wifi.sta.sethostname('WIOT-'.._.config.v.nid);
	wifi.sta.config(_.config.v.wifi.config);
	_.timer.setInterval(function(delay)
		if wifi.sta.getip() ~= nil then
			delay(-1);
			_.init.http();
			_.init.mqtt();
		end
	end, _.config.v.wifi.CheckInterval);

	--http module
	_.init.http = function()
		_.http.v = httpserver.createServer(_.config.v.http.port, function(req, res)
			local path = string.split(req.url, '/');
			if path[2] == 'discover' then
				_.api.http.discover(res);
			elseif path[2] == 'msg' and path[3] then
				_.api.http.msg(path[3], req, res);
			else
				res.finish('', 500);
			end
		end);
	end

	--mqtt module
	_.init.mqtt = function()
		_.mqtt.v = mqtt.Client(_.config.v.nid, _.config.v.mqtt.keepaliveTimer, _.config.v.mqtt.user, _.config.v.mqtt.password);
		_.mqtt.v:lwt(_.mqtt.getTopic('status'), 'offline', 0, 0);
		_.mqtt.v:on('offline', function()
			_.timer.setTimeout(_.mqtt.start, _.config.v.mqtt.OfflineRetryInterval);
		end);
		_.mqtt.v:on('message', function(client, topic, data)
			local path = string.split(string.split(topic, _.config.v.mqtt.topicPrefix), '/');
			if path[1] == 'ctl' then
				if path[2] == 'heartbeat' then
					_.api.mqtt.heartbeat();
				elseif path[2] == 'ns' then
					_.api.mqtt.ns(data);
				elseif path[2] == 'func' then
					_.api.mqtt.func(data);
				elseif path[2] == 'restart' then
					_.api.mqtt.restart();
				end
			elseif path[1] == 'msg' and path[2] then
				_.api.mqtt.msg(path[2], data);
			end
 		end);
	end

	--ONLINE System Launch
	----------------------
	--Run user offline func
	_.init.onlineFunc = function()
		_.flag.ward(function()
			tmr.softwd(_.config.v.func.online.MaxWaitTime); --start watchdog
			if not __run(_.func.online, _.timer, _.db.public, _.msg.public) then --enable DB and MSG
				_._.restart('online Func Startup Fail..');
			end
			tmr.softwd(-1); --disable watchdog
			_.signal.destroy(); --destroy signal
		end);
	end

	
end)(function(func, timer, db, msg)
	return pcall(loadstring(func));
end);