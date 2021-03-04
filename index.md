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
wiot.buffer(wire_output, wire_input, node[, delay_s = 0[, isSyncAtInit = false]])
```
### Parameters

 - `wire_output`: The wire object as the output.
 - `wire_input`: The wire object as the input.
 - `node`: The node object to run the buffer.
 - `delay_s`: (Optional) The peroid for the changed input data to hold in seconds.
 - `isSyncAtInit`: (Optional) Whether to synchronize the two wire at system startup.

### Returns
`primitive object`

### Example
```js
let node1 = new wiot.node.nodemcu('abcde');

let wire1 = new wiot.wire();
let wire2 = new wiot.wire(15); //Initizlize as 15

wiot.buffer(wire2, wire1, node1, 3); //when wire1 changes and hold for 3 seconds,
									// the wire2 will be updated with the data in wire1
```


## Operate

Operate is used to determine the relationship among wires.

### Syntax

```js
wiot.operate(expression, node, wire_output, ...wires_input)
```
### Parameters

 - `expression`: The expression between the output wire and the input wires. The first wire_input will be `$0`, the second wire_input will be `$1`...
 - `node`: The node object to run the operate.
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

wiot.operate('$0+$1', node1, wire1, wire2, wire3); //wire1=wire2+wire3
													// After startup, the wire1 will be 16
```



# NodeMCU Primitives

## gpio

Method to operate the PINs on NodeMCU board.

### Syntax

```js
wiot.gpio(mode, pin, wire, node)
```
### Parameters

 - `mode`: Determine the mode of PIN. `wiot.INPUT` or `wiot.OUTPUT`.
 - `pin`: Which PIN to use. e.g. `node.D3`
 - `wire`: The wire object as the output/input.
 - `node`: The node object to run the gpio.



### Returns
`primitive object`

### Example
```js
let node1 = new wiot.node.nodemcu('abcde');

let wire1 = new wiot.wire();

//when D3 is LOW/HIGH, set D4 to be LOW/HIGH
wiot.gpio(wiot.INPUT, node1.D3, wire1, node1);
wiot.gpio(wiot.OUTPUT, node1.D4, wire1, node1);
```


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