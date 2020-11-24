#!/bin/bash
.\lib\esptool-ck\esptool.exe -cp COM3 -cd nodemcu -ca 0x00000 -cf .\bin\test.bin
