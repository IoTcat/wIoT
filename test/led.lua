--设置控制针脚
LED_PIN = 0
--设置针脚模式
gpio.mode(LED_PIN, gpio.OUTPUT)

--设置计时器0每0.5秒执行一次程序
print("hey ther") 
mytimer = tmr.create()
mytimer:register(1000, tmr.ALARM_AUTO, function() 
    print("hey there") 
    if gpio.read(LED_PIN) == 0 then
   		 gpio.write(LED_PIN, gpio.HIGH)
   	else
   		gpio.write(LED_PIN, gpio.LOW)
   	end
end)
mytimer:start()

