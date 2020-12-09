--CONFIG
CONFIG = {
	firmware = {
		version = '0.0.1'
	},
	wifi = {
		station = {
			ssid = "yimian-iot",
			pwd = "1234567890.",
			save = true
		}
	},
	coap = {
		server = {
			port = 5683
		}
	},
	w = {
		id = {}
		director = {
			ip = '192.168.3.251'
		},
		heartbeat = {
			interval = 15000
		}
	}
}

--Global Var
cs = nil --coAP Server
cc = nil --coAP Client

--wIoT Toolbox
w = {
	f = {},
	push = function(hash, s)
		w.f[hash] = loadstring(s)
		cs:func('w.f.'..hash)
		return hash
	end,
	pull = function(hash)
		w.f[hash] = nil
		w.refresh()
	end,
	clear = function()
		w.f = nil
		w.refresh()
	end,
	start = function()
		cs = coap.Server()
		cs:listen(CONFIG.coap.server.port)
		w.push('_/info', 'function() local status, json;ok, json = pcall(sjson.encode, CONFIG);return json;end')
		w.push('_/w/f', 'function() local status, json;ok, json = pcall(sjson.encode, w.f);return json;end');
		w.push('_/w/push', 'function() ')
	end,
	stop = function()
		cs:close()
		cs = nil
		collectgarbage("collect")
	end,
	refresh = function()
		w.stop()
		w.start()
		for k, v in pairs(w.f) do
			cs:func('w.f.'..k)
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
			cs = coap.Server()
			cs:listen(CONFIG.coap.server.port)
			cc = coap.Client()
			after(after2)
		end,
		w = function(after)
			
			if after then after()
		end
	},
	randomLetter = function(len)
	    local rt = ""
	    for i = 1, len, 1 do
	        rt = rt..string.char(math.random(97,122))
	    end
	    return rt
	end

}

--Run
func.run = function()
	gpio.write(0, gpio.LOW)
end

--exec Init
func.init.run()