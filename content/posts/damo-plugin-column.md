+++
title = '大漠专栏'
date = '2026-10-01'
tags = ['易语言']
draft = false
+++

# 绑定大漠（注册）：

1\.运行dmRegGm\.exe输入使用码把本机机器码添加到服务器，这样就能使用注册码进行大漠注册。

2\.使用大漠类库生成工具选择在你想要用的版本大漠的路径生成Output文件夹，打开E文件夹复制obj\.txt的内容到新建的类模块当中，按照读我\.txt的步骤依次执行。

![image\.png](/posts/damo-plugin-column/image_4.png)

3\.把dm\.dll复制到程序目录当中后，主程序写好代码即可运行。

![image\.png](/posts/damo-plugin-column/image_3.png)

# 绑定大漠（免注册）：

1\.延续注册的所有步骤后，打开不注册调用dm\.dll的方法的文件夹，将DmReg\.dll复制到程序目录下，按照说明文件一步步执行操作。

![image\.png](/posts/damo-plugin-column/image_1.png)

![image\.png](/posts/damo-plugin-column/image.png)

## 注意：

免注册只是说能够使用免费大漠功能无需把机器码注册到服务器当中，如果使用VIP功能还是需要进行注册操作。

**DmReg 免注册** = 免注册表，不免 VIP 联网授权（新版付费必须传机器码给大漠服务器），不用 regsvr32 写入系统注册表，只是加载 dll 的方式，和大漠 VIP 授权无关。

**离线免费 / 破解免验证** = 免 VIP 联网，全程不上传机器码到大漠服务器，无 VIP 校验，不用 Reg 注册、不用上传机器码到任何服务器，随便用基础功能；

# 大漠插件绑定测试工具：

## 绑定雷电模拟器：

1\.先捕捉顶层句柄，然后绑定它的子句柄也就是实际操作界面的句柄。

2\.绑定参数设置。

![image\.png](/posts/damo-plugin-column/image_2.png)



