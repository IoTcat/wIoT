# wIoT


[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FIoTcat%2FwIoT.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FIoTcat%2FwIoT?ref=badge_shield)
![version](https://img.shields.io/npm/v/wiot)
![language](https://img.shields.io/github/languages/top/iotcat/wiot)
![license](https://img.shields.io/npm/l/wiot)
![download](https://img.shields.io/npm/dt/wiot)
![contributors](https://img.shields.io/github/contributors/iotcat/wiot)
![last commit](https://img.shields.io/github/last-commit/iotcat/wiot)

[![github star](https://img.shields.io/github/stars/iotcat/wiot?style=social)](https://github.com/iotcat/wiot)
[![github forks](https://img.shields.io/github/forks/iotcat/wiot?style=social)](https://github.com/IoTcat/wIoT/)
[![gitHub watchers](https://img.shields.io/github/watchers/iotcat/wiot?style=social)](https://github.com/IoTcat/wIoT/)

> An awesome project.



# System Primitives

## Wire

Generate a new wire, which can transport and persist data.

### Syntax

```js
new wiot.wire([default_value = 0[, isPersist = false]])
```
### Parameters

 - `default_value`: (Optional) The default value of this wire when initializing.
 - `isPersist`: (Optional) Persist the data in Flash so after restart the data can be recovered from Flash.

### Returns
`wire Object`: wire object that serves as a parameter of other primitives.

### Example
```js
let wire1 = new wiot.wire();
let wire2 = new wiot.wire(15); //Initizlize as 15
let wire3 = new wiot.wire(15, true); //Persist in Flash
```


## Buffer

Buffer is used to connected two wires. Only when the data in input wire has been changed and held for a peroid, the new data can be synchronized to the output wire.

### Syntax

```js
wiot.buffer(node, wire_output, wire_input[, delay_s = 0[, isSyncAtInit = false]])
```
### Parameters
 - `node`: The node object to run the buffer.
 - `wire_output`: The wire object as the output.
 - `wire_input`: The wire object as the input.
 - `delay_s`: (Optional) The peroid for the changed input data to hold in seconds.
 - `isSyncAtInit`: (Optional) Whether to synchronize the two wire at system startup.

### Returns
`primitive object`

### Example
```js
let node1 = new wiot.node.nodemcu('abcde');

let wire1 = new wiot.wire();
let wire2 = new wiot.wire(15); //Initizlize as 15

wiot.buffer(node1, wire2, wire1, 3); //when wire1 changes and hold for 3 seconds,
									// the wire2 will be updated with the data in wire1
```


## Operate

Operate is used to determine the relationship among wires.

### Syntax

```js
wiot.operate(node, expression, wire_output, ...wires_input)
```
### Parameters

 - `node`: The node object to run the operate.
 - `expression`: The expression between the output wire and the input wires. The first wire_input will be `$0`, the second wire_input will be `$1`...
 - `wire_output`: The wire object as the output.
 - `wires_input`: The wire objects as the inputs.


### Returns
`primitive object`

### Example
```js
let node1 = new wiot.node.nodemcu('abcde');

let wire1 = new wiot.wire();
let wire2 = new wiot.wire(15);
let wire3 = new wiot.wire(1);

wiot.operate(node1, '$0+$1', wire1, wire2, wire3); //wire1=wire2+wire3
													// After startup, the wire1 will be 16
```



# NodeMCU Primitives

## gpio

Method to operate the PINs on NodeMCU board.

### Syntax

```js
wiot.gpio(node, mode, pin, wire)
```
### Parameters

 - `node`: The node object to run the gpio.
 - `mode`: Determine the mode of PIN. `wiot.INPUT` or `wiot.OUTPUT`.
 - `pin`: Which PIN to use. e.g. `node.D3`
 - `wire`: The wire object as the output/input.



### Returns
`primitive object`

### Example
```js
let node1 = new wiot.node.nodemcu('abcde');

let wire1 = new wiot.wire();

//when D3 is LOW/HIGH, set D4 to be LOW/HIGH
wiot.gpio(node1, wiot.INPUT, node1.D3, wire1);
wiot.gpio(node1, wiot.OUTPUT, node1.D4, wire1);
```

## adc

Method to get the input voltage of the Analog Pin (D0).

### Syntax

```js
wiot.adc(node, wire_output)
```
### Parameters

 - `node`: The node object to run.
 - `wire_output`: The wire object as the output.



### Returns
`primitive object`

### Example
```js
let node1 = new wiot.node.nodemcu('abcde');

let wire1 = new wiot.wire();

wiot.adc(node1, wire1);
```

## pwm

Method to launch a PWM pulse on appointed PIN.

### Syntax

```js
wiot.pwm(node, pin, wire_duty, wire_clock)
```
### Parameters

 - `node`: The node object to run.
 - `pin`: Which PIN to use. e.g. `node.D3`
 - `wire_duty`: The wire object to control the duty.
 - `wire_clock`: The wire object to control the clock frequency.

### Returns
`primitive object`

## print

Print a message via UART.

### Syntax

```js
wiot.print(node, ...wires_input)
```
### Parameters

 - `node`: The node object to run.
 - `wires_input`: The wire object to need to be print to console when changed.


### Returns
`primitive object`

## sjson_encode

Convert a Lua table into JSON format string.

### Syntax

```js
wiot.sjson_encode(node, wire_output, wire_input)
```
### Parameters

 - `node`: The node object to run.
 - `wire_output`: The wire object that will receive the encoded JSON string.
 - `wire_input`: The wire object of the input Lua table.

### Returns
`primitive object`

## sjson_decode

Convert a JSON format string into Lua table.

### Syntax

```js
wiot.sjson_decode(node, wire_output, wire_input)
```
### Parameters

 - `node`: The node object to run.
 - `wire_output`: The wire object that will receive the decoded Lua table.
 - `wire_input`: The wire object of the input JSON string.

### Returns
`primitive object`

## udp

Setup a UDP server.

### Syntax

```js
wiot.udp(node, wire_res_ip, wire_res_port, wire_res_data, wire_send_ip, wire_send_port, wire_send_data[, localport = parseInt(Math.random()*20000)+10000])
```
### Parameters

 - `node`: The node object to run.
 - `wire_res_ip`: The wire object that identify the IP of the bind.
 - `wire_res_port`: The wire object of the port to listen to.
 - `wire_res_data`: The wire object that will receive the incoming data.
 - `wire_send_ip`: The wire object of the ip of target.
 - `wire_send_port`: The wire object of the port of target.
 - `wire_send_data`: The wire object of the data to be sent.
 - `localport`: The local UDP server port.


### Returns
`primitive object`


## tcp

Setup a TCP server.

### Syntax

```js
wiot.tcp(node, host, port, wire_res_data, wire_send_data)
```
### Parameters

 - `node`: The node object to run.
 - `host`: The wire object that identify the IP of the server.
 - `port`: The wire object of the port to listen to.
 - `wire_res_data`: The wire object that will receive the incoming data.
 - `wire_send_data`: The wire object of the data to be sent.


### Returns
`primitive object`


## http

HTTP request.

### Syntax

```js
wiot.http(node, wire_statusCode, wire_res, wire_url[, wire_body = new wiot.wire(`''`)[, header = 'nil'[, method = 'GET']]])
```
### Parameters

 - `node`: The node object to run.
 - `wire_statusCode`: The wire object of the status code.
 - `wire_res`: The wire object of the received data.
 - `wire_url`: The wire object of the request URL.
 - `wire_body`: The wire object of the body of the sent data.
 - `header`: The header of HTTP request.
 - `method`: The HTTP method. e.g. GET, POST, HEADER, REQUEST, DELETE, PUT


### Returns
`primitive object`

## bigiot

Connect to bigiot. Can be used to connect 天猫精灵 and 小爱同学.
### Syntax

```js
wiot.bigiot(node, DeviceID, APIkey, wire_output, wire_trigger)
```
### Parameters

 - `node`: The node object to run.
 - `DeviceID`: Device ID of the device on bigiot.
 - `APIkey`: API key of the bigiot application.
 - `wire_output`: The wire of the data sent to bigiot.
 - `wire_trigger`: The wire to trigger a request.



### Returns
`primitive object`



## mail

Send a email.
### Syntax

```js
wiot.mail(node, wire_en, wire_to, wire_subject, wire_body[, from = 'wiot'])
```
### Parameters

 - `node`: The node object to run.
 - `wire_en`: The wire to trigger a mail sending.
 - `wire_to`: The wire of the target email address.
 - `wire_subject`: The wire of the subject.
 - `wire_body`: The wire of the email body.
 - `from`: The title of sender.


### Returns
`primitive object`

## memobird

Print using memobird.

### Syntax

```js
wiot.memobird(node, AppKey, UserID, memobirdID, wire_en, wire_body)
```
### Parameters

 - `node`: The node object to run.
 - `AppKey`: The application key from memobird.
 - `UserID`: The user ID of memobird account.
 - `memobirdID`: The ID of the memobird.
 - `wire_en`: The wire of the trigger.
 - `wire_body`: The wire of the body of the printed data.


### Returns
`primitive object`

## redis

Connect to Redis.

### Syntax

```js
wiot.redis(node, host, channel, wire_res, wire_send[, port = 6379])
```
### Parameters

 - `node`: The node object to run.
 - `host`: The host of Redis server.
 - `channel`: The channel to join.
 - `wire_res`: The wire object to put the received data.
 - `wire_send`: The wire of the sent data.
 - `port`: The port of the Redis server.


### Returns
`primitive object`

## webpage

Generate and launch a web page.

### Syntax

```js
wiot.webpage(node, key, template[, wires_output_map = {}[, wires_input_map = {}[, interval_s = 0.4[, host = 'http://wiot-webpage.yimian.xyz/']]]])
```
### Parameters

 - `node`: The node object to run.
 - `key`: The access key of the webpage application.
 - `template`: The template of the webpage.
 - `wire_output_map`: The output map of the webpage.
 - `wire_input_map`: The input map of the webpage.
 - `interval_s`: The interval to check the status (AJAX) in seconds.
 - `host`: The host of the webpage server.


### Returns
`primitive object`


# Operators

## if

Method to achieve a IF function in the `wiot.operate`'s expression.

### Syntax

```js
wiot.if(condition, ifYes, ifNo)
```
### Parameters

 - `condition`: The condition to determine which of the following expression to be used.
 - `ifYes`: The expression to be used when the condition is true.
 - `ifNo`: The expression to be used when the condition is not true.



### Returns
`String Expression`

### Example
```js
//Button controller breathing LED

let w = new wiot.wire(0),
	w1 = new wiot.wire(10),
	w2 = new wiot.wire(),
	w3 = new wiot.wire();

let node =  new wiot.node.nodemcu('abcde');

wiot.gpio(wiot.INPUT, node.D3, w3, node);
wiot.pwm(node.D4, w2, new wiot.wire(500), node);


wiot.operate(wiot.if(`$1==1`, `math.abs($0%2047-1023)`, `1023`), node, w2, w, w3);
wiot.operate('($0+10)%2048', node, w, w1);
wiot.buffer(w1, w, node, .001, true);

```


# Modules


## breathing

This will generate a breathing signal.

### Syntax

```js
wiot.breathing(node, period_s, wire_output)
```
### Parameters

 - `node`: The node object to run.
 - `period_s`: The period of breathing in seconds.
 - `wire_output`: The output wire.

### Returns
`primitive object`

