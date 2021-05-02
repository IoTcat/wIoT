# wIoT

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FIoTcat%2FwIoT.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FIoTcat%2FwIoT?ref=badge_shield)
![version](https://img.shields.io/npm/v/wiot)
![license](https://img.shields.io/npm/l/wiot)
![download](https://img.shields.io/npm/dt/wiot)

wIoT - A distributed IoT network operating system for NodeJS

## Dependencies

### Firmware
 - [NodeMCU Firmware](https://nodemcu.readthedocs.io/)
 - [NodeMCU - ADC Module](https://github.com/nodemcu/nodemcu-firmware/tree/release/app/modules/adc.c)
 - [NodeMCU - ENCODER Module](https://github.com/nodemcu/nodemcu-firmware/tree/release/app/modules/encoder.c)
 - [NodeMCU - FILE Module](https://github.com/nodemcu/nodemcu-firmware/tree/release/app/modules/file.c)
 - [NodeMCU - GPIO Module](https://github.com/nodemcu/nodemcu-firmware/tree/release/app/modules/gpio.c)
 - [NodeMCU - HTTP Module](https://github.com/nodemcu/nodemcu-firmware/tree/release/app/modules/http.c)
 - [NodeMCU - NET Module](https://github.com/nodemcu/nodemcu-firmware/tree/release/app/modules/net.c)
 - [NodeMCU - NODE Module](https://github.com/nodemcu/nodemcu-firmware/tree/release/app/modules/node.c)
 - [NodeMCU - PWM Module](https://github.com/nodemcu/nodemcu-firmware/tree/release/app/modules/pwm.c)
 - [NodeMCU - SJSON Module](https://github.com/nodemcu/nodemcu-firmware/tree/release/app/modules/sjson.c)
 - [NodeMCU -TMR Module](https://github.com/nodemcu/nodemcu-firmware/tree/release/app/modules/tmr.c)
 - [NodeMCU - WIFI Module](https://github.com/nodemcu/nodemcu-firmware/tree/release/app/modules/wifi.c)
 - [NodeMCU - REDIS Module](https://github.com/nodemcu/nodemcu-firmware/tree/release/lua_modules/redis/redis.lua)
 - [NodeMCU - LFS](https://nodemcu.readthedocs.io/en/release/lfs/)


### CLI
 - [Node.JS](http://nodejs.org/): running env
 - [ora](https://www.npmjs.com/package/ora): terminal spinner
 - [fs](https://www.npmjs.com/package/fs): file system operation
 - [colors](https://www.npmjs.com/package/colors): get color and style in node.js console
 - [boxen](https://www.npmjs.com/package/boxen): Create boxes in the terminal
 - [cli-table](https://www.npmjs.com/package/cli-table): render unicode-aided tables on the command line from node.js scripts
 - [got](https://www.npmjs.com/package/got): Human-friendly and powerful HTTP request library for Node.js
 - [timeago.js](https://www.npmjs.com/package/timeago.js): format datetime with *** time ago statement
 - [inquirer](https://www.npmjs.com/package/inquirer): an easily embeddable and beautiful command line interface for Node.js
 - [md5](https://www.npmjs.com/package/md5): a JavaScript function for hashing messages with MD5
 - [child_process](https://nodejs.org/api/child_process.html): spawn subprocesses  
 - [path](https://nodejs.org/api/path.html): utilities for working with file and directory paths
 - [nodemcu-tool](https://www.npmjs.com/package/nodemcu-tool): Upload/Download Lua files to ESP8266/ESP32 module with NodeMCU firmware
 - [yargs](https://www.npmjs.com/package/yargs): parsing arguments and generating an elegant user interface
 - [esptool-ck](https://github.com/igrr/esptool-ck): create firmware files for the ESP8266 chip and flash the firmware to the chip over serial port

### Director
 - [docker](https://www.docker.com/): Empowering App Development for Developers
 - [Node.JS](http://nodejs.org/): running env
 - [pm2](https://www.npmjs.com/package/pm2): production process manager for Node.js applications with a built-in load balancer
 - [express](https://www.npmjs.com/package/express): Fast, unopinionated, minimalist web framework for nodeJS
 - [log4js](https://www.npmjs.com/package/log4js): logging utility
 - [net](https://nodejs.org/api/net.html): an asynchronous network API for creating stream-based TCP or IPC servers and clients


### Documentation Website
 - Github Pages
 - [Docsify](https://docsify.js.org/#/): Document website
 - [mermaid](https://www.npmjs.com/package/mermaid): Chart generation
 - [docsify-themeable](https://www.npmjs.com/package/docsify-themeable): Docsify theme
 - [docsify-copy-code](https://www.npmjs.com/package/docsify-copy-code): code copy plugin
 - [docsify-tabs](https://www.npmjs.com/package/docsify-tabs): markdown tab support
 - [prismjs](https://www.npmjs.com/package/prismjs): code highlight


### Webpage Plugin
 - [docker](https://www.docker.com/): Empowering App Development for Developers
 - [Node.JS](http://nodejs.org/): running env
 - [pm2](https://www.npmjs.com/package/pm2): production process manager for Node.js applications with a built-in load balancer
 - [express](https://www.npmjs.com/package/express): Fast, unopinionated, minimalist web framework for nodeJS
 - [fs](https://www.npmjs.com/package/fs): file system operation
 - [md5](https://www.npmjs.com/package/md5): a JavaScript function for hashing messages with MD5


## Source Code Structure

### wIoT-dev
Main source code including wiot CLI, director, compiler, and NodeMCU Image.
```
|   .gitignore (git ignore)
|   .gitmodules (git submodules)
|   LICENSE (open-source License)
|   package.json (dependencies record for npm)
|   README.md (readme file)
|   yarn.lock (for dependencies management tool yarn)
|
+---bin
|       wiot (wiot CLI entrance)
|
+---examples
|       bigiot.js (example for 天猫精灵)
|       breath_led.js (example for breathing LED)
|       bus_test.js (example for node cluster cooperation)
|       hource_race_led.js (example for testing interboard communication)
|       http.js (example for sending http request)
|       operate.js (example for testing operate primitives)
|       pwm_operate_adc.js (example for testing pwm and adc)
|       redis.js (example for testing redis database client)
|       tcp.js (example for lunching tcp and udp)
|       webpage.js (example for generating a web page)
|
+---lib
|   \---esptool-ck (for flashing ESP device)
|           esptool-32 
|           esptool-64
|           esptool-arm
|           esptool-osx
|           esptool.exe
|
\---src
    +---cli (wiot CLI)
    |   |   compile.js 
    |   |   config.js
    |   |   help.js
    |   |   init.js
    |   |   ls.js
    |   |   node.js
    |   |   publish.js
    |   |   remove.js
    |   |   restart.js
    |   |   status.js
    |   |   version.js
    |   |   wifi.js
    |   |
    |   \---modules
    |           compile.js (compile command)
    |           error.js (error handler)
    |           getConfig.js (Get configuration of current wiot project)
    |           nidMatch.js (match incomplete nid)
    |           reset.js 
    |           terminal.js (Open terminal of NodeMCU)
    |           upload.js (Upload files to NodeMCU)
    |           winDevList.js (show connected NodeMCU via USB)
    |           winFlash.js (Flash NodeMCU)
    |
    +---compiler
    |   |   index.js (compiler entrance)
    |   |   wiot-core.js (compile-core)
    |   |
    |   +---modules
    |   |       breathing.js
    |   |
    |   +---operators
    |   |       if.js
    |   |       strIndexOf.js
    |   |       strSubStr.js
    |   |
    |   \---primitives
    |           adc.js
    |           bigiot.js
    |           gpio.js
    |           http.js
    |           mail.js
    |           memobird.js
    |           print.js
    |           pwm.js
    |           redis.js
    |           sjson_decode.js
    |           sjson_encode.js
    |           tcp.js
    |           udp.js
    |           webpage.js
    |
    +---director
    |   |   .gitignore
    |   |   Dockerfile (docker configure file)
    |   |   LICENSE
    |   |   package.json
    |   |   pm2.json (pm2 configure file)
    |   |   README.md
    |   |   yarn.lock
    |   |
    |   \---src
    |       |   .gitignore
    |       |   index.js (director entrance)
    |       |
    |       \---modules
    |               api.js (http api for CLI)
    |               log.js (log functions)
    |               node.js (node management)
    |               nodetable.js (data flow management)
    |               ns.js (name service)
    |
    \---drivers
        \---nodemcu
            +---bin
            |       full.bin (full features NodeMCU binary firmware)
            |       min.bin (minimized NodeMCU binary firmware)
            |
            \---lua
                |   lfs.img (wiot LFS image)
                |
                \---lfs (lfs.img source code)
                        bigiot.lua (for 天猫精灵)
                        dummy_strings.lua (optimize LFS)
                        redis.lua (for redis)
                        wiot.lua (wiot core)
                        _init.lua (boot file)

```

### wIoT-page
Source code for documentation website.
```
|   .gitignore
|   .nojekyll
|   CNAME
|   index.html
|   index.md
|   package-lock.json
|   package.json
|   README.md
|   sw.js
|   yarn.lock
|   _404.md
|   _coverpage.md
|   _navbar.md
|   _sidebar.md
|
+---logo
|       favicon.ico
|       full.png
|       full.psd
|       full_small.png
|       full_small.psd
|       logo.png
|       logo.psd
|
\---zh-cn
        logbook.md
        plan.md
        README.md
        sd-iot.md
        _coverpage.md
        _navbar.md
        _sidebar.md
```

### wiot-webpage
Source code for webpage plugin.
```
|   .gitignore
|   Dockerfile
|   footer.html
|   framework.html
|   head.html
|   index.html
|   index.js
|   LICENSE
|   package.json
|   pm2.json (pm2 configuration)
|   README.md
|   yarn.lock
|
\---src
        framework.html (generated page framework)
        index.html (root page for generating key)
        index.js (main script)

```

## Test Procedure 

### Install CLI (Assume on Win 10)

1. Download and install Node.js from [here](https://nodejs.org/en/download/) and adding the binary path (typically `%USERPROFILE%\AppData\Roaming\npm`) into the PATH system env.

2. Run `$ npm i -g wiot` in the command line.

3. Use `$ wiot -v` to check version (typically `v0.3.x`) and use `$ wiot -h` to see the supported commands.


### Create a wIoT Project

1. Use `$ wiot init "myproject"` to create a new wiot project in current folder with the name "myproject".

2. Type `$ cd myproject` to go into the project folder.

3. Use `$ npm i wiot` to install dependencies for this project.


### Manage the Configuaton of Project


1. Use `$ wiot config` to see current configuration.

2. Use `$ wiot config -h` to see how to change the configuation, including project name, director URL, default entrance script.

3. Use `$ wiot wifi set --ssid=your-wifi-ssid --pwd=your-wifi-passowrd` to save a WiFi setting. Repeat this to save multiple WiFi settings. These WiFi settings will be used configure the NodeMCU to let them connect to a WiFi AP. 

4. Use `$ wiot wifi ls` to see all saved wifi settings.

5. You may also use `$ wiot wifi remove -h` to see how to remove a wifi setting.



### Add NodeMCU to Project

1. Connect one NodeMCU-8266 development board to computer via USB.

2. Run `$ wiot node search` to list all connected NodeMCU-8266 development board.

3. Assume that the target NodeMCU-8266 is at port COM3, run `$ wiot node init COM3 -n "myfirstnode"` to initiate the NodeMCU-8266 board with a nickname "myfirstnode". Use `$ wiot node init -h` to see more parameters this command supports. More command for node operation can be found with `$ wiot node -h`.

4. Run `$ wiot ls` to list all nodes.


### Check Node Status

1. Run `$ wiot status` to display the status of all nodes. `$ wiot status [nid]` can be used to show the detailed status of appointed node with its node id (nid). The nid can be found with `$ wiot ls`. Please note that when input a nid, you may only input some part of nid (for example, input `ac` for nid `ac7dg`) and it will be automatically completed.

### Operate Node

1. You may use `$ wiot restart <nid>` to restart a node.

2. You may use `$ wiot remove <nid>` to remove a node.


### Create wIoT Application

1. Create a new file under the root of your wIoT project folder named `index.js`.

2. Open `index.js` and input the following code, which achieves a button-controlled LED. When pressing the FLASH button on the NodeMCU-8266 board, the on-board LED will be on. When release the FLASH button, the LED will be off.

```js
// Require wiot package
const wiot = require('wiot');

// Create a new node in corresponding with a NodeMCU
let node1 = new wiot.node.nodemcu('<input your full nid here>');
// Create a new virtal wire
let wire1 = new wiot.wire();

// Use the virtual wire to onnect the D3 and D4 gpio on board
// achieving when D3 is LOW/HIGH, set D4 to be LOW/HIGH
wiot.gpio(node1, wiot.INPUT, node1.D3, wire1);
wiot.gpio(node1, wiot.OUTPUT, node1.D4, wire1);
```

3. Run `$ wiot compile` to compile the code in `index.js`.

4. Run `$ wiot publish` to push the compiled application to the NodeMCUs.

5. Now you may test the application on your NodeMCU.

6. You may try more examples in the examples folder and even write your own application refer to [API documentation](https://wiot.js.org/). 

> Attention: Grammer check is not available yet, the compiler can only identify some simple errors but can not locate them. Therefore please be careful when writing your application.



### Test Director Locally

By default, the CLI will use the director at `wiot-director.yimian.xyz`, which is running in a Docker container guarded by pm2 on a cloud server in Beijing. As a choice, the director may be deployed locally with the following procedures.

1. Go to `src/director/src/` and run `$ node index.js`.

2. Configure your firewall to allow the incomming and outgoing flow of TCP package on 3001 and 6789 port.

3. Go to your project folder and run `$ wiot config --director=http://127.0.0.1:3001/`.

4. Update all NodeMCUs with `$ wiot node update <port> <nid>` via USB. Please make sure the nid is correct by checking `$ wiot ls`. 

5. Recompile and publish the application.

> Similarly, the director can be deployed with `$ docker run -d -v /src/data/log:<your local log path> --name wiot-director -p 3001:3001 -p 6789:6789 iotcat/wiot-director` or `$ docker run -d -v /src/data/log:<your local log path> --name wiot-director -p 3001:3001 -p 6789:6789 docker.yimian.xyz:4450/wiot-director` for backup. The director can also be deployed on a intranet server with this method to keep the data safe for companies.

### Check Log
The log is maintained by the director. You may modify `/src/director/src/modules/log.js` to determine which kinds of log you want to keep. By default, the log will only be output to the standard output. You may change this to output the log to files. 


### Test CLI Locally

1. In the source code folder, run `$ npm i` to install dependencies.

2. Run `$ node bin/wiot [...parameters]` to use the CLI locally. This is the same as `$ wiot [...parameters]`.



## Q&A

### No wIoT project selected
![No wIoT project selected](https://api.yimian.xyz/img/?path=imgbed/img_99e2e71_524x157_8_null_normal.jpeg)

Solution: Please make sure you are in a wIoT project folder.


### no such file or directory

Solution: Please make sure your node.js is installed properly, especially the environment variable `PATH`.


### Cannot found nid "xxxxx"! Please check your code!

Solution: Please make sure all nid in your index.js is in the list of `$ wiot ls`.


###  Error occors in index.js

Solution: Please check your application in `index.js`, especially the order of the parameters of primitives, modules, and operators. Besides, JavaScript garmmer error may also result in this error.


