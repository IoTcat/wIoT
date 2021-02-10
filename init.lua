
--set AP mode
wifi.setmode(wifi.SOFTAP)

--config AP
cfg={}
cfg.ssid="myssid"
cfg.pwd="mypassword"
wifi.ap.config(cfg)

 