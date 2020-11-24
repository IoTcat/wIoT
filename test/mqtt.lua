
m = mqtt.Client("clientid", 120)


m:lwt("/lwt", "offline", 0, 0)

m:on("connect", function(client) print ("connected") end)
m:on("connfail", function(client, reason) print ("connection failed", reason) end)
m:on("offline", function(client) print ("offline") end)


idd = 'n1';

-- pwm control
local function pwmCtl(pin, duty)
  pwm.setduty(pin, duty)
end

for i=1,4 do
	pwm.setup(i, 1000, 0)
	pwm.start(i)
end

m:on("message", function(client, topic, data)
  print(topic .. ":" )
  if data ~= nil then
    print(data)
  end
  if topic == '/t/'..idd..'/D0' then
  	--mytimer:stop()
  	if data == '0' then
  		gpio.write(0, gpio.LOW)
  		print('D0 low')
  	else
  		gpio.write(0, gpio.HIGH)
  		print('D0 high')
  	end
  else
  	print(string.sub(topic, -2, -2))
  	if string.sub(topic, -2, -2) == 'D' then
  		if tonumber(string.sub(topic, -1)) >0 and tonumber(string.sub(topic, -1)) <= 12 then
  			print(tonumber(string.sub(topic, -1)))
  		pwmCtl(tonumber(string.sub(topic, -1)), tonumber(data))
  		end
  	end
  end
end)

m:on("overflow", function(client, topic, data)
  print(topic .. " partial overflowed message: " .. data )
end)

m:connect("192.168.3.4", 1883, false, function(client)
  print("connected")
  client:subscribe("/t/"..idd.."/#", 0, function(client) print("subscribe success") end)
  client:publish("/t/"..idd, "hello", 0, 0, function(client) print("sent") end)

  for i=5,8 do
    gpio.mode(i,gpio.INT)
    gpio.trig(i, "up", function()  client:publish("/t/"..idd.."/D"..i, gpio.read(i), 0, 0, function(client) print(i.." high") end) end)
  end

end,
function(client, reason)
  print("failed reason: " .. reason)
end)
