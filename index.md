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


## Historical review and outlook
The study of paleontology tells us that for billions of years, biological systems have evolved from a cell-free form at the beginning to a single-cell form, to a multicellular form, and even a social form among multicellular organisms. This series of evolutions has made the stability and robustness of biological systems stronger and stronger. It can be used in more complex and dangerous environments (at the beginning of submarine volcanoes [with ref], to all oceans, to land, and then immediately. The space and other planets that will arrive) better meet the needs of nature for survival and reproduction. From this, we can get some inspirations as follows.

We were surprised to find that multicellular organisms seem to be a nearly perfect distributed system, with the cohesion [with ref] and transparency [with ref] common to distributed systems. In this system, each cell is a relatively independent individual, capable of autonomously completing a series of life behaviors, but with a high degree of division of labor, and the central unified management of resource scheduling, such as eating behavior and energy distribution through the blood circulation system [informal ref] etc. At the same time, multicellular biological systems are highly modularized and black boxed, as we humans experience in daily life. Through psychological research, we know that we have perception, and perception comes from the synthesis and processing of multiple organs [textbook ref]. This synthesis and processing process is often considered to be automated and not subject to our cognitive management and regulation. Our cognition senses and operates the body through the "interface" provided by the body, and if the body does not provide an "interface" to the cognitive part of the brain, our cognition will not be able to actively use the corresponding functions (such as heart rate, hormone regulation, etc.) [Textbook ref]. It can be found that the human body system has a rigorous and ingenious authority management, resource management and many other designs.

The study of theoretical physics tells us that the expression of the laws of the universe is often very concise. For example, Maxwell's equation describing electromagnetic force is a classic example. From this, we can realize that phenomena at different levels of the universe can often have similar characteristics. For example, the solar system and the higher-order Milky Way are all in a disk structure (due to the conservation of angular momentum). [Have ref] Therefore, we not only think about whether we can learn from the realization methods of multi-cell biological systems when analyzing and designing human society, so as to "become ingenious". For example, the Human Brain Project, which has participated in many countries, is dedicated to better insight into the principles of the brain, to develop new treatments for brain diseases, and to establish a new and revolutionary information and communication technology based on it. [Has ref]

Intuitively, there are two main factors that affect the theoretical upper limit of the performance of a distributed computing system: node performance and communication efficiency between nodes. [Ref not found] From the perspective of anthropological research, the invention and development of language seem to be closely related to the rapid occupation and expansion of the ecological niche by humans for hundreds of thousands of years. [Informal ref] The rapid development of Internet technology based on optical quantum communication since the end of the last century seems to have pushed human society into the second major development. These two important inventions seem to have improved the communication efficiency between human individuals to varying degrees. [Sociology: Management: The individual potential is not fully explored; the idea refers to the social form described by Riman psycho-pass] From this we can guess that the main bottleneck of the current development of human society is still the communication efficiency between nodes. Any technology that can significantly improve the communication efficiency of human society has the potential to promote the evolution of human society.

I have been thinking, as a small multicellular organism in the evolution of human beings, organisms, and even the universe, what can I do for it? Where is my ecological niche? Some scholars pointed out that the earth is showing some intelligent characteristics (ie the global brain). On the earth, with the help of the communication network with the Internet as the core, people and people, people and machines, and machines and machines are connected together and exchange information with each other to form a particularly huge intelligent system. [There are ref] This process seems to have many similarities with the formation of multicellular biological systems: humans and machines have a high degree of division of labor, each performing its own duties.

With the advent of the Internet of Things era, the way humans interact with the environment will undergo revolutionary changes. The environment seems to be transformed to be more intelligent during this period. The implementation of the transformation will mean the installation of a series of networked sensors and controllers to the environment. I personally tend to divide the development of the Internet of Things into three stages. In the initial stage of the Internet of Things, it seems that humans still need to interact with the Internet of Things machines and environments through specific interfaces, such as smartphones. In the near future, the development of the Internet of Things will enter the second stage. At this stage, the number of interaction scenarios through mobile phones and other interfaces will gradually decrease, while at the same time the ways humans interact directly with the surrounding environment (such as gestures, voice, etc.) will increase. Even, all functions of smart phones will eventually be completely replaced by smart environments (3D holographic projection, physical location-based audio broadcasting services, etc.). At this stage, technologies such as mixed reality MR will show their skills. The application and popularization of brain-computer interface technology will advance the Internet of Things to the third stage. At this stage, most of the sensors and controllers in the smart environment will in some way pretend that the human brain can recognize and control the sensation and perceptual form, and provide the human brain with perception and operation permissions through the brain-computer interface. At this time, for everyone who uses a brain-computer interface to access the Internet of Things, they can perceive and control sensors and controllers all over the world and the universe just like feeling and controlling hands and feet.

(Brain-computer interface is a very forward-looking technology. The application and popularization of this technology will revolutionize the mode of interaction between humans, humans and machines, and humans and the environment. Unfortunately, we are currently Little is known about the human brain, and the development of this technology is still difficult, and it is expected that it will still be limited to the treatment of brain diseases for decades. However, its prospects are still worth looking forward to.)

## Classic IoT operating system

### Hongmeng OS

Hongmeng's philosophy is hardware mutual assistance and resource sharing. He is a distributed IoT operating system project led by Huawei. Facing the whole scene, multiple devices. Functions include distributed soft bus, distributed equipment virtualization, distributed data management, distributed task scheduling, one-time development, multi-terminal deployment, unified OS, flexible deployment, etc.

Disadvantages: It has strong binding with Huawei equipment and is not friendly to the community. The current support for traditional open source hardware is not good.

### Fuchsia system
Developed by Google for mixed reality MR. Microkernel. Google’s future-oriented strategic layout. The ultimate goal of Flutter.

Disadvantages: Due to well-known reasons, domestic support is not expected to be good. But its design with 3D position coordinates as the center of gravity is very worth learning.

### Amazon FreeRTOS
The operating system of the microcontroller, which makes small, low-power edge devices easy to program, deploy, secure, connect and manage.

Disadvantages: heavily dependent on AWS.

### Windows IoT Core
Hope that one Windows can adapt to all devices and screens. And provide a consistent experience for users and developers.

Disadvantages: Cannot adapt to low-power scenarios. Rely heavily on Microsoft products.


### Contiki

It is an open source, highly portable, network-supported multitasking operating system suitable for embedded systems with memory.

Disadvantages: not automate the networking part

### RT-thread
Embedded real-time multi-threaded operating system. RT-thread includes relatively complete middleware components such as file system and graphics library, and a software platform with low power consumption, security, communication protocol support and cloud connection capabilities.

Disadvantages: It only provides protocol support, and developers still need to write communication methods on each node by themselves, which makes it difficult to achieve unified scheduling management.


### In summary

I found that most IoT operating systems either manage too much, like Hongmeng. Either it is a transformation from an embedded system, which does not support the networking part. The main contradiction in the field of the Internet of Things is that everyone has their own set and lacks a unified standard. A’s equipment cannot be connected to B, and B’s equipment cannot be connected to A. Each uses its own protocol and talks about IoT. . It's better to try to use the community as a base to provide a paradigm that connects everything, a flexible platform. There, various physical and virtual objects (sensors, equipment, people, products on the assembly line, web pages, weather, etc.) will be gathered together. Whether the user originally used Huawei's HiLink or Microsoft's system, they can easily access it.

## wIoT vision
The goal of wIoT is to find its own niche in the first, second, and third stages of the development of the Internet of Things to meet the needs of the Internet of Things construction and operation that may be required at all stages.

wIoT hopes to create a model similar to a multicellular biological blood circulation system, similar to blood vessel functions, and provide a flexible and customized IoT service paradigm that runs on the edge.

## wIoT function design

 - For the community
 - Binding with geographic 3D coordinates
 - Dynamic and static combination
 - Flexible drive interface
 - Flexible service interface
 - Unified public management
 - Authority management/security

## wIoT design concept

 - Small but fine
 - Rich tools
 - High scalability
 - Everything is a device (Things)
 - Classification


## wIoT architecture

?> If you have time after reading, you can look at the analysis above

When designing the architecture of wIoT, we couldn't help thinking whether there is a more concise model to realize the Internet of Everything. Is it inappropriate to blindly impose the design thinking of computer systems on the design of IoT systems? What is the essence of the Internet of Things? What is the nature of networking?



### Thing model

In this model, we assume that everything in the world can be abstracted into a simple supply and demand model as follows.

!> The following diagram may be deformed on the mobile end, the vertical lines should be aligned

```Thing_Model
             | |
demand ---> | Thing | ---> supply
             | |
```

The first assumption of this model is that all the interactive behaviors of each thing can be abstracted into a series of demand and supply. For example, the lights in the corridor can be simply abstracted as `demand: electricity; supply: light`. Of course, supply and demand can be described in more detail through a tree structure, such as `demand: electricity{voltage: 220V, power: 20W}; supply: light{color: yellow, PWM: supported}`. For another example, a person, or even every product on the assembly line, can be abstracted in a similar way.

The second assumption of this model is that all demand and supply can be classified and managed using a tree structure.

The third assumption of this model is that there is a certain correspondence between demand and supply, and the process of finding the optimal correspondence can be automated by computer.


Through this model, we found that the essence of the interconnection of everything is, to some extent, equivalent to the establishment of the relationship between supply and demand. What wIoT can do is **automate the process of establishing the supply and demand relationship between things**.

### Layered architecture

![wIoT layered architecture diagram](https://api.yimian.xyz/img/?path=imgbed/img_d2098f8_2084x1235_8_null_normal.jpeg)

As shown in the figure above, following the idea that everything is a device (Things), the hierarchical architecture of wIoT is designed as a spherical structure.

#### System Kernel
The inside of the sphere is the core of the system, responsible for generating the optimal demand and supply matching for each thing. Since things at the system level are designed to be dynamic, the generation, management andDestruction is also performed by the kernel. In addition, the kernel will also perform system functions such as logging and rights management.

#### Things

In the wIoT system, the responsibility of the things part is to virtualize a variety of objects on various levels of reality, and encapsulate the demand and supply of each thing into a form that can be recognized by the kernel in accordance with the specifications. The thing object will be generated by the kernel according to the template on demand. The template contains the following structures.

!> The design of template-thing should be simplified, which will be considered in detail in the future


```template

  Real/Virtual Things
-------------------------
Driver | Driver | Driver
-------------------------
        Program
-------------------------
   Supply | Demand
-------------------------
      wIoT Kernal


```

In the template, first, a lot of drivers are connected with real or virtual things. The role of the driver is to map things to nodeJS interfaces. For example, a human template may require a common description of multiple drivers, such as a mobile phone driver connected to a portable device, a smart watch driver, etc., so that human supply and demand can be mapped to Wiot through these portable devices.

Developers use the interfaces provided by many drivers to summarize the demand and supply of this thing, and provide them to the kernel management in accordance with the format.

wIoT provides a global driver manager based on npm. Developers can develop and publish their own driver to the driver manager for everyone to use.

For every thing, the wIoT kernel itself is also a thing, which can be called by the corresponding driver.

The wIoT systems can call each other through the driver. For example, a template can be written on wIoT system A to selectively map the overall supply demand of wIoT system B to wIoT system A.

### Topology

![wIoT topology architecture diagram](https://api.yimian.xyz/img/?path=imgbed/img_7f8c071_903x529_8_null_normal.jpeg)

As shown in the figure, the wiot kernel runs on the edge computing node (edge ​​computing/fog computing) and interacts with various things. Developers use the wiot-cli tool to perform development, operation and maintenance and other operations on the PC.

## Classic scene

### Dynamic people scene

!> There are some unclear design details in this scene, for reference only

In this scenario, suppose there is a hall with sensors, lamps and other facilities. Use wiot to realize that people walk around, lights follow, and the brightness/color of the lights conform to the person's habits.

!> The following is the swim lane diagram, the mobile terminal may be deformed, the vertical lines should be aligned

```

Client Location Register Service
|------------>|
| location |
| |
|<------------|
| Edge server |
| ip
|
| wIoT Edge Server
|------------------>|
| Client Template |-->Generate Client Thing
| |<--Indoor Location service
| |-->Customized Light service
|<------------------|
| Service Status |
| |
| |
| |
| |
|------------------>|
| Heartbeat |
| |
| |
|------------------>|
| Bye |--Client Thing destroyed
| |
|
```

The user terminal device queries the Location Register Service (similar to DNS query) for the wIoT edge server in this area according to its own location information. After that, the user terminal device initiates a request to the edge server, and sends the description template of its owner to the edge server. After receiving the template, the wIoT server will instantiate it as a thing, and then use other things such as indoor positioning services to track it to meet its positioning requirements. And according to the demand of this Clinet Thing, it dynamically matches the demand and supply of the surrounding light objects in real time.

The user terminal will periodically send heartbeats to the wIoT server to ensure survival. When the location service/heartbeat is interrupted/the user actively disconnects, the wIoT server will destroy the user thing and refresh the supply and demand relationship between things.


### Vehicle traveling scene

!> There are some unclear design details in this scene, for reference only

In this scenario, smart vehicles using the wIoT core travel on the road with sensors and wIoT nodes (nodes using the wIoT core). Realize the automatic connection and matching of the vehicle and the surrounding vehicles, the vehicle and the sensors in the environment. In the environment, traffic lights, street lights and other scenes are supplied on demand according to the car’s template.


!> The following is the swim lane diagram, the mobile terminal may be deformed, the vertical lines should be aligned

```

Car Location Register Service
|------------>|
| location |
| |
|<------------|
| Edge server |
| ip
|
| wIoT Edge Server A
|------------------>|
| Car Template |-->Generate Car Thing
| |
| |
|<------------------|
| Service Status |
| |
| |
| |
| |
|------------------>|
| Heartbeat |
| |
| |
|------------------>|
| Bye |--Car Thing destroyed
| |
|
|
| Location Register Service
|------------>|
| location |
| |
|<------------|
| Edge server |
| ip
|
|
| wIoT Edge Server B
|------------------>|
| Car Template |-->Generate Car Thing
| |
| |
|<------------------|
| Service Status |
| |
| |
| |
| |
|------------------>|
| Heartbeat |
| |
| |
|------------------>|
| Bye |--Car Thing destroyed
| |
|
```

The above is a simple model of the car's interaction with the environment during its travel. Car queries nearby wIoT edge servers through Location Register Service according to its own location. The car establishes contact with the edge server and heartbeats regularly. At this time, the environment will provide customized services according to the car's template. After the car leaves the geofence of this wIoT node, the car will disconnect, query and connect to the next wIoT edge server.


!> The following is the swim lane diagram, the mobile terminal may be deformed, the vertical lines should be aligned

```

Car Location Register Service
|------------>|
| location |
| |
|<------------|
| Edge server |
| ip
|
| Car A
|------------------>|
| Car Template |-->Generate Car Thing
| |
| |
|<------------------|
| Service Status |
| |
| |
| |
| |
|------------------>|
| Heartbeat |
| |
| |
|------------------>|
| Bye |--Car Thing destroyed
| |
|
```

Using a similar method can also achieve the interaction between vehicles as shown above.

### Factory assembly line scene

!> There are many unclear design details in this scene, for reference only

In this scenario, suppose there is a factory assembly line, and the products on the assembly line are processed products.

When the wIoT node senses the entry of a new product through the sensor thing, it will generate the product thing through the product template, track the product through the positioning service, and update its information in the product thing in real time. When the product passes through the processing slot, the product thing matches the supply and demand with the processing slot, and the processing is completed. Commodities go through the entire assembly line, and their things in wIoT will be deleted.


### Interstellar spaceship scene

!> There are a lot of unclear design details in this scene, for reference only

In this scenario, two spaceships that are accelerating interstellar travel pass by. When they meet, the two ships coordinate supply and demand through wIoT.
.........
For example, spaceship A has more apples, and spaceship B has more pears. People in spaceship A want to eat pears, and people in spaceship B want to eat apples. (You only want things you can’t get>\_<)(The reason why the spacecraft knows what the people on board want is because all the people on the spacecraft have a virtualized thing in wIoT. In this thing, dynamically (Detecting and recording all these needs) When the spacecraft meet, the automated facilities on the two ships will automatically exchange materials to achieve optimal resource allocation.