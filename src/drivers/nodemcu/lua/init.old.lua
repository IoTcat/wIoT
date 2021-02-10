--Global Var
CONFIG = {}
udp = nil --UDP Server
key = nil --Encrypt Key
G = {} --Var Zone

--wIoT Toolbox
w = {
	f = {},
	waitList = {},
	send = function(ip, port, fid, body, cb)
		local sid = func.randomLetter(8)
		local o = {
			fid = fid,
			sid = sid,
			id = CONFIG.w.id,
			body = body
		}
		local status, msg = pcall(sjson.encode, o)
		udp:send(port, ip, msg)
		if cb == nil then return ;end
		w.waitList[sid] = false
		local resTimer = tmr.create()
		local retryTimer = tmr.create()
		local retryTimes = CONFIG.w.maxRetryTimes
		resTimer:register(CONFIG.w.scanInterval, tmr.ALARM_AUTO, function()
		    if func.tableKeyExist(w.waitList, sid) and w.waitList[sid] ~= false then
		        cb(w.waitList[sid])
		        w.waitList[sid] = nil
		    	resTimer:unregister()
		    	retryTimer:unregister()
		    	collectgarbage("collect")
		    end
		end)
		retryTimer:register(CONFIG.w.retryInterval, tmr.ALARM_AUTO, function()
		    if retryTimes > 0 and func.tableKeyExist(w.waitList, sid) and w.waitList[sid] == false then
		    	udp:send(port, ip, msg)
		    	retryTimes = retryTimes - 1
		    else
		    	retryTimer:unregister()
		    	collectgarbage("collect")
		    end
		end)
		resTimer:start()
		retryTimer:start()
	end,
	receive = function(s, data, port, ip) 
		print(data)
		local status, msg = pcall(sjson.decode, data)
		if not status then return end
		if not func.tableKeyExist(msg, 'sid') or not func.tableKeyExist(msg, 'body') then return end
		--respond mode
		print(msg.fid)
		if not func.tableKeyExist(msg, 'fid') then
			if func.tableKeyExist(w.waitList, msg.sid) then
				w.waitList[msg.sid] = msg.body
			end
			return
		end
		print(msg.fid)
		--request mode
		if not func.tableKeyExist(w.f, msg.fid) then return end
		local res = w.f[msg.fid](msg.body, {port = port, ip = ip, socket = s, sid = msg.sid, fid = msg.fid});
		print(msg.fid)
		local resObj = {
			sid = msg.sid,
			id = CONFIG.w.id,
			body = res
		}
		status, res = pcall(sjson.encode, resObj)
		print(res)
		s:send(port, ip, res)
	end,
	heartbeat = function()
		local o = {
			version = CONFIG.firmware.version,
			id = CONFIG.w.id,
			ip = wifi.sta.getip(),
			port = CONFIG.udp.server.port,
		}
		--request
		print(sjson.encode(o))
		udp:send(CONFIG.w.director.port, CONFIG.w.director.ip, sjson.encode(o))
	end,
	_push = function(hash, s)
		w.f[hash] = function(r)
			if hash == 'construct' or hash == 'destruct' then
				print(s)
				loadstring('print("hhhhhhh")')()
				loadstring(s)()
				return
			end
			local status, msg = pcall(loadstring('return '..s)(), r)
			local data = {
				status = status,
				data = msg
			}
			return data
		end
		return hash
	end,
	push = function(hash, s)
		w._push(hash, s)
		func.jsonfPush('func.json', hash, s)
		return hash
	end,
	pull = function(hash)
		w.f[hash] = nil
		func.jsonfPull('func.json', hash)
		w.refresh()
	end,
	clear = function()
		func.jsonfClear('func.json')
		w.refresh()
	end,
	start = function()
		print('w starting...')
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
				print(k)
				w.push(k, v)
			end
		end
		if func.tableKeyExist(w.f, 'construct') then
			w.f:construct()
		end
	end,
	stop = function()
		if func.tableKeyExist(w.f, 'destruct') then
			w.f:destruct()
		end
		w.f = {}
		collectgarbage("collect")
	end,
	refresh = function()
		pcall(w.stop)
		pcall(w.start)
	end
}

--Functions
func = {
	init = {
		run = function()
			if file.exists("__running") then
				file.rename("__running", "__stopped")
			else
				func.jsonfClear('func.json')
			end
			collectgarbage("collect")
			w.start()
			collectgarbage("collect")
			func.init.wifi(func.init.udp, func.init.w, func.run)
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
		udp = function (after, after2)
			udp = net.createUDPSocket()
			udp:listen(CONFIG.udp.server.port)
			udp:on("receive", w.receive)
			after(after2)
		end,
		w = function(after)
			w.heartbeat()
			local heartbeat = tmr.create()
			heartbeat:register(CONFIG.w.heartbeat.interval, tmr.ALARM_AUTO, function()
				w.heartbeat()
				file.rename("__stopped", "__running")
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