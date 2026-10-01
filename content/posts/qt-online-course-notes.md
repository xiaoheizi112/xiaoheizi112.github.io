+++
title = '大丙学编程 Qt 网课学习笔记'
date = '2026-10-01'
tags = ['Qt']
draft = false
+++

对照视频学习，笔记总结的很全面，适合用于复习和巩固：

https://subingwen\.cn/qt/

# 笔记补充

## 机器视觉和计算机视觉的区别：

**机器视觉 ≈ 计算机视觉 \+ 工业场景 \+ 实时控制**，前者更偏**工程应用**，后者更偏**算法技术**。

## 什么是IDE：

IDE 就是专门用来写软件、做开发的一体化工具。

## 什么是软件开发：

软件开发就是用代码创造软件，去解决实际问题。

## 为什么Qt需要添加两个环境变量：

- 一个让系统找到 Qt 编译工具，包含项目构建工具cmake和qmake、编译器工具gcc和g\+\+、调试工具gdb。

- 一个让程序运行时找到 Qt 依赖库。

## CMake/qmake、GCC/G\+\+、GDB 核心区别：

- **CMake / qmake**：**项目构建工具**（负责：把一堆源码→生成编译脚本 / Makefile）。

- **gcc / g\+\+**：**编译器**（负责：把源码→可执行程序 / 库），gcc编译C语言，g\+\+编译C\+\+。

- **gdb**：**调试工具**（负责：程序跑崩 / 逻辑错时，找 bug）。

## 模态与非模态两种显示方式：

用于设置打开窗口的方式。

`.show()`：显示的是非模态窗口，好几个窗口可以中途连续切换。（非模态 = 模式自由）

`.exec()`：显示的是模态窗口，必须叉掉此窗口才能切换到其他窗口，类似于强制广告弹窗。（模态 = 模式锁定）

## QMainWindow：

菜单栏和状态栏只能有一个，工具栏可以添加多个。

## 窗口坐标：

子窗口的坐标系都是基于自己对应的父窗口的坐标原点进行偏移得来的。

## Qt对象树：

Qt 对象树：**父对象自动管理子对象生命周期，父析构时子对象会自动删除，不用手动 delete。**

## char\*和string和QByteArray之间的关系：

**`char*`**：最原始、最底层的**C 风格字符串指针**（裸奔）

**`std::string`**：C\+\+ 对 `char*` 的**安全封装**（带管理、不裸奔）

**`QByteArray`**：Qt 对 `char*` 的**Qt 版封装**（专门给 Qt 用，功能更强）

## QString和QByteArray的关系：

**QString** = 把各种原始编码转化为UTF8大家所看得懂的文本格式。

**QByteArray **= 存原始字节数据（二进制 / 字节流），可以存任意编码。

QBtyeArray是对char\*做了一层浅层次的包装，而QString是对QBtyeArray做了一层更加深层次的包装。

### 转换关系：

- QString和QByteArray之间可以互相转换。

- char\*可以直接转换为QString，但QString不能直接转换为char\*，QString需要通过QBtyeArray进行中转才能转化为char\*。

#### 为什么QString不能直接转化为char\*，而char\*能够直接转化为QString？

*char → QString*\*：Qt 主动兼容，帮你转，所以可以直接用。

**QString → char**\*：编码不同、有安全风险，**必须手动指定编码 \+ 通过 QByteArray 中转。**

### 计算长度：

- `QString`计算长度是计算对象中的字符串长度，1个汉字1个字节。

- `QBtyeArray`计算长度是计算字符串所占字节数，1个汉字3个字节。

## QDate：

### QDate获取当前日期：

`// 获取当前日期 `

`QDate currentDate = QDate::currentDate();`

`// 输出示例：2026-03-16`

`qDebug() << "当前日期：" << currentDate.toString("yyyy-MM-dd");`

## QTime：

封装的是毫秒。

### QTime获取当前时间：

`// 获取当前系统时间 `

`QTime currentTime = QTime::currentTime();`

`// 输出：14:23:45`

`qDebug() << "当前时间：" << currentTime.toString("HH:mm:ss");`

## QDatetime：

### QDatetime获取当前日期时间：

`// 获取当前 日期+时间 `

`QDateTime now = QDateTime::currentDateTime();`

`// 输出：2026-03-16 21:30:45`

`qDebug() << "当前日期时间：" << now.toString("yyyy-MM-dd HH:mm:ss");`

## QTimer：

### QTimer的两种构造函数的常用形式：

`time = new QTimer(this);`

`time = new QTimer;`

### 用的时候到底需不需要加this？

- 日常开发优先推荐加 this，利用 Qt 对象树自动管理内存，减少手动释放的麻烦和内存泄漏风险。

- 只有在明确需要独立生命周期时，才考虑省略 this，并记得在合适时机手动删除定时器对象。

### C\+\+当中，添加生命周期怎么判断是在堆栈上的

- **栈上对象**：**直接声明变量**，没有 `new`，没有 `*`。

- **堆上对象**：**用 ****`new`**** 创建**，一定是**指针 / 智能指针**接收。

## QDialog：

### 学习 QDialog 的**信号与槽**到底有什么用？

- 让对话框里的按钮真正生效，比如：确定、取消、应用、保存。

- 主窗口能知道用户点了什么，主窗口可以根据结果执行不同逻辑：

1. 点确定 → `accept()`。

2. 点取消 → `reject()`。

- 对话框 ↔ 主窗口 互相传数据这是最常用、最重要的功能！比如：

1. 登录窗口把账号密码传给主窗口。

2. 设置窗口把参数传给主窗口。

3. 子窗口把选择的文件路径传给主窗口。

## 什么是API函数，什么是成员函数：

- **成员函数**：属于某个类 / 对象的函数，必须用对象调用。

- **API函数**：系统 / 库提供给你直接用的公共函数，不属于你的类。就是别人写好，给你直接调用的功能函数。

## Public Functions（普通公共函数）和Static Public Members（静态公共成员函数）的区别：

- Public Functions = 必须用【对象】调用，可以访问成员变量，主要用于操作对象本身。

`QPushButton btn;      // 必须创建对象 `

`btn.setText("按钮");  // 普通公共函数`

- Static Public Members = 直接用【类名】调用，不需要对象，不能访问成员变量，主要用于工具功能、全局功能。

`QMessageBox::information(this, "提示", "内容");  // 静态公共函数，不用创建对象`

## 如何实现登录界面布局效果：

将2个Label和2个LineEdit放在同一个Widget里面，在通过栅格布局Widget实现布局效果。

![image\.png](/posts/qt-online-course-notes/image.png)



