--CONFIG
dofile('config.lua')

--Global Var
cs = nil --coAP Server
cc = nil --coAP Client

--wIoT Toolbox
w = {
	f = {},
	_push = function(hash, s)
		w.f[hash] = function(r)
			local status, msg = pcall(loadstring('return '..s)(), r)
			return sjson.encode({
				status = status,
				msg = msg
			})
		end
		_G["_"..hash] = w.f[hash]
		cs:func('_'..hash, coap.JSON)

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
			cs:func('_'..k, coap.JSON)
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
			w.start()
			--cc:post(coap.CON, 'coap://'..CONFIG.w.director.ip..CONFIG.w.director.port..'/reg', '{"version": "'..CONFIG.firmware.version..'", "id": "'..CONFIG.w.id..'", "ip": "'..wifi.sta.getip()..'", "port": '..CONFIG.coap.server.port..'}')
			local heartbeat = tmr.create()
			heartbeat:register(CONFIG.w.heartbeat.interval, tmr.ALARM_AUTO, function()
				--cc:post(coap.CON, 'coap://'..CONFIG.w.director.ip..CONFIG.w.director.port..'/heartbeat', '{"id": "'..CONFIG.w.id..'", , "ip": "'..wifi.sta.getip()..'"}')
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
	end
}

--Run
func.run = function()
	--run content
	gpio.write(0, gpio.LOW)
end



--exec Init
func.init.run()