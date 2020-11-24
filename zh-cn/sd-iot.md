# 第二轮wIoT设计

## 原因

在第一轮的wIoT原型中，我们支持了用户对NodeMCU进行最简单远程编程的能力，例如实现心跳LED，跨设备协同实现的光敏灯。但是，在这个原型中，所有的控制都是由树莓派上的wIoT Cloud完成的，这就在很大程度上浪费了NodeMCU上面的计算资源，并且对网络造成相当的负担。例如，一个简单呼吸灯的实现，将消耗大量的通信资源。此外，由于所有的通信和控制都经过wIoT Cloud，这就造成整个系统相当脆弱，一旦wIoT Cloud宕机，所有NodeMCU节点将受影响。


## 目标

第二轮wIoT原型的设计，将致力于提高NodeMCU上计算资源的利用率，尽可能减少各NodeMCU节点与wIoT Cloud的通信。


## 设计


在这一个设计中，与上一个版本中的所有控制功能都在树莓派上完全不一样，这里所有的控制都在NodeMCU板子上。而树莓派上**只剩下向NodeMCU上传控制器脚本和连接表，以及监控**的功能，而几乎不参与NodeMCU集群的正常运行。

为了便于解释，我将按照用户的操作顺序来进行解释。假设当前系统刚配置好并初始化完毕，且没有上传任何用户程序。

在最初，用户通过CLI上传其编写的程序上传到树莓派（director）。树莓派会分析出各NodeMCU上的控制器脚本和连接表，并将它们下载到各个NodeMCU上。如下图的红虚线。


![拓扑](https://api.yimian.xyz/img/?path=imgbed/img_b8437e9_1357x812_8_null_normal.jpeg)


此后，NodeMCU集群开始根据刚被下载的控制器脚本生成控制器实例。并且根据下载的连接表将pin口与控制器进行连接，跨板子的连接将自动通过CoAP进行。



![](https://api.yimian.xyz/img/?path=imgbed/img_3a36f4a_1404x1004_8_null_normal.jpeg)

上图是用户眼中的NodeMCU集群，用户的主要任务是编写conrtoller，和编写连接表。一个NodeMCU中可以存在多个controllers。controllers之间以及controllers和pin口的连接将按照连接表来建立。controllers之间的链接也可以跨板子建立，这时板子之间的CoAP通信将被自动建立。



## 潜在价值

1. 通过部署多个directors, 负载均衡，容错
2. 分布式部署，容错
3. NodeMCU集群以类似SDN的方式进行统一的管理，这意味着其具备部分SDN的优势，如简化配置，快速修复故障等

## 缺陷

1. 降低了NodeMCU上资源利用效率
2. 只有一部分NodeMCU上的功能被支持
