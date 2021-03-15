local F = function(DEVICEID, APIKEY, ctl_wire_obj)
  local INPUTID = "36"
  local host = "www.bigiot.net"
  local port = 8181
  local isConnect = false
  local cu = net.createConnection(net.TCP)
  cu:on('receive', function(cu, c) 
    print(c)
    isConnect = true
    local r = sjson.decode(c)
    if r.M == 'say' then
      ctl_wire_obj.reg = r.C;
    end
  end)
  cu:on('disconnection',function(scu)
    cu = nil
    isConnect = false
    __tmr1:stop()
    tmr.create():alarm(5000, tmr.ALARM_SINGLE, function()cu:connect(port, host);end)
  end)
  cu:connect(port, host)
  cu:on('connection',function(scu)
    local ok, s = pcall(sjson.encode, {M="checkin",ID=DEVICEID,K=APIKEY})
    if ok then
      print(s)
    else
      print("failed to encode!")
    end
    if isConnect then
      cu:send(s.."\n")
    end
    __tmr1 = tmr.create();
    __tmr1:alarm(60000, tmr.ALARM_AUTO, function()
      if isConnect then
        cu:send(s.."\n")
      end
    end)
  end)
end

return F;