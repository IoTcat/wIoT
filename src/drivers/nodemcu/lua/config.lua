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
		id = node.chipid(),
		director = {
			ip = '192.168.3.251',
			port = 5683
		},
		heartbeat = {
			interval = 15000
		}
	}
}
