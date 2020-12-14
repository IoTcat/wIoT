--Global Var
CONFIG = {}
cs = nil --coAP Server
cc = nil --coAP Client
key = nil --Encrypt Key
heartbeatFunc = {} --heartbeat Functions
heartbeatCache = {} --heartbeat Cache

--wIoT Toolbox
w = {
	f = {},
	heartbeat = function()
		local o = {
			version = CONFIG.firmware.version,
			id = CONFIG.w.id,
			ip = wifi.sta.getip(),
			port = CONFIG.coap.server.port,
			payload = {}
		}
		--add list to o
		local obj = {};
		for k, v in pairs(w.f) do 
			obj[k] = encoder.toHex(crypto.hash([[md5]],string.dump(v)));
		end
		o.func = obj;
		--add payload
		o.payload = heartbeatCache;
		heartbeatCache = {};
		--request
		local res = cc:post(coap.CON, 'coap://'..CONFIG.w.director.ip..':'..CONFIG.w.director.port..'/', sjson.encode(o))
		print(res)
		if res == nil then return end
		--response
		local resObj = sjson.decode(res);
		for sid, v in pairs(resObj) do
			for cmd, msg in pairs(v) do
				if func.tableKeyExist(heartbeatFunc, cmd) then
					heartbeatCache[sid] = heartbeatFunc[cmd](msg)
				end
			end
		end

	end,
	_push = function(hash, s)
		w.f[hash] = function(r)
			local status, msg = pcall(loadstring('return '..s)(), r)
			local data = sjson.encode({
				status = status,
				msg = msg
			})
			local res = func.encrypt(data, key)
			key = nil
			return res
		end
		_G["_"..hash] = w.f[hash]
		cs:func('_'..hash)

		return hash
	end,
	push = function(hash, s)
		w._push(hash, s)
		func.jsonfPush('func.json', hash, s)
		return hash
	end,
	pull = function(hash)
		w.f[hash] = nil
		_G["_"..hash] = nil
		func.jsonfPull('func.json', hash)
		w.refresh()
	end,
	clear = function()
		for k, v in pairs(w.f) do
			loadstring('_'..k..'=nil')
		end
		w.f = {}
		func.jsonfClear('func.json')
		w.refresh()
	end,
	start = function()
		print('w starting...')
		cs = coap.Server()
		cs:listen(CONFIG.coap.server.port)
		local usr = func.jsonfRead('func.json')
		if next(usr) ~= nil then
			print('in usr')
			for k, v in pairs(usr) do
				print(k)
				w._push(k, v)
			end
		else
			print('in systemd')
			local systemd = func.jsonfRead('FUNC.json')
			for k, v in pairs(systemd) do
				w.push(k, v)
			end
		end
	end,
	stop = function()
		cs:close()
		cs = nil
		w.f = {}
		collectgarbage("collect")
	end,
	refresh = function()
		w.stop()
		w.start()
		for k, v in pairs(w.f) do
			cs:func('_'..k)
		end
	end
}

--Functions
func = {
	init = {
		run = function()
			func.init.wifi(func.init.coap, func.init.w, func.run)
		end,
		wifi = function(after, after2, after3)
			print('Setting up WIFI...')
			wifi.setmode(wifi.STATION)
			wifi.sta.config(CONFIG.wifi.station)
			wifi.sta.connect()
			local wifiInit = tmr.create()
			wifiInit:register(1000, tmr.ALARM_AUTO, function()
			    if wifi.sta.getip() == nil then
			        print('Waiting for IP ...')
			    else
			        print('IP is ' .. wifi.sta.getip())
			    	wifiInit:unregister()
			    	after(after2, after3)
			    end
			end)
			wifiInit:start()
		end,
		coap = function (after, after2)
			cc = coap.Client()
			after(after2)
		end,
		w = function(after)
			for k, v in pairs(func.jsonfRead('heartbeatFunc.json')) do
				heartbeatFunc[k] = function(r)
					local status, msg = pcall(loadstring('return '..v)(), r)
					local data = sjson.encode({
						status = status,
						msg = msg
					})
					return data
				end
			end
			w.start()
			w.heartbeat()
			local heartbeat = tmr.create()
			heartbeat:register(CONFIG.w.heartbeat.interval, tmr.ALARM_AUTO, function()
				w.heartbeat()
			end);
			heartbeat:start()
			if after then after() end
		end
	},
	randomLetter = function(len)
	    local rt = ""
	    for i = 1, len, 1 do
	        rt = rt..string.char(math.random(97,122))
	    end
	    return rt
	end,
	jsonfRead = function(f)
		if file.open(f) then
  			local status, obj = pcall(sjson.decode, file.read())
  			file.close()
  			if status then
  				return obj
  			else
  				return {}
  			end
		end
		return {}
	end,
	jsonfWrite = function(f, obj)
		if file.open(f, 'w+') then
  			local status, json = pcall(sjson.encode, obj)
  			if status then
  				 file.write(json)
  			else
  				file.write("{}")
  			end
  			file.close()
		end
	end,
	jsonfPush = function(f, hash, s)
		local obj = func.jsonfRead(f)
		obj[hash] = s
		func.jsonfWrite(f, obj)
	end,
	jsonfPull = function(f, hash)
		func.jsonfPush(f, hash, nil)
	end,
	jsonfClear = function(f)
		func.jsonfWrite(f, {})
	end,
	encrypt = function(s, kay)
		if key == nil then return s;end
		local msg = encoder.toHex(crypto.encrypt("AES-ECB", key, s..func.randomLetter(4)))
		return msg..string.sub(encoder.toHex(crypto.hmac("sha1", msg, key)), 1, 8)
	end,
	decrypt = function(s, kay)
		if key == nil then return s;end
		local msg, hmac = string.sub(s, 1, string.len(s)-8), string.sub(s, string.len(s)-7, 8)
		if string.sub(encoder.toHex(crypto.hmac("sha1", msg, key)), 1, 8) ~= hmac then return nil; end
		local raw = crypto.decrypt("AES-ECB", key, encoder.fromHex(msg))
		return string.sub(raw, 1, string.len(raw) - 4)
	end,
	tableKeyExist = function(obj, key)
    	for k, v in pairs(obj) do
        	if k == key then
            	return true
            end
        end
        return false
	end
}

--Run
func.run = function()
	--run content
	gpio.write(0, gpio.LOW)
end

--Load CONFIG
CONFIG = func.jsonfRead('config.json')

--exec Init
func.init.run()