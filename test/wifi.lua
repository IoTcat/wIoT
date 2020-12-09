print('Setting up WIFI...')
wifi.setmode(wifi.STATION)

station_cfg={}
station_cfg.ssid="yimian-iot"
station_cfg.pwd="1234567890."
station_cfg.save=true
wifi.sta.config(station_cfg)
wifi.sta.connect()


mytime = tmr.create()
mytime:register(5000, tmr.ALARM_SINGLE, function() print("hey there") end)
mytime:start()

tmp = 0

mytimer = tmr.create()
mytimer:register(1000, tmr.ALARM_AUTO, function()
	print('Setting up WIFI...')
    if wifi.sta.getip() == nil then
        print('Waiting for IP ...')
        loadstring("tmp=tmp+1 print(tmp)")()
    else
        print('IP is ' .. wifi.sta.getip())
    	mytimer:unregister()
    	dofile('mqtt.lua')
    end
end)
mytimer:start()

