+++
title = 'C++/Qt 网课学习笔记（社长嵌入式）'
date = '2026-10-02'
tags = ['Qt', 'C++']
draft = false
+++

> 课程来自B站up主：社长_嵌入式，开课日期：2025-06-25。

## 2025-06-25 周三

### 1、QT概述

### 2、QT开发环境安装

## 2025-06-27 周五

### 3、QTCreator的基本使用

- 复制行向下：Ctrl+Alt+Down；复制行向上：Ctrl+Alt+Up；切换当前文件：Ctrl+Tab。

### 4、引入CPP及命名空间

- std是标准库的命名空间。

### 5、CPP输入输出

## 2025-06-28 周六

### 6、CPP基本数据类型

### 7、流程控制和函数

- 内联函数（inline）是C++中一种特殊的函数，其定义直接在每个调用点展开。这意味着编译器会尝试将函数调用替换为函数本身的代码，这样可以减少函数调用的开销。

## 2025-06-30 周一

### 8、Lambda表达式引入

- 如果一个函数的名字被当做参数使用了，那这个函数就叫回调函数（Callback）。

## 2025-07-02 周三

### 9、Lambda表达式参数捕获

- 捕获的参数不能在函数内部修改参数值的（例如x++/x=15），只能以可读方式使用（可以x\*y/x+y）。

- 捕获列表输入“=”时，能够捕获所有变量。

- 捕获列表输入“&”时，能够捕获所有变量且相当于引用类似指针，直接进行地址访问，能够修改参数值，可读可写。

### 10、同C语言过一下数组和指针

## 2025-07-03 周四

### 11、综合小练习

## 2025-07-06 周日

### 12.从结构体引入类

- 结构体和类都是抽象表达，而结构体变量和对象都是具体化，如图。

![截图](/images/qt-cpp-course-notes/image1.png)

- std::to_string()——可以直接将整型数转换成长相一样的字符串。打印字符串可以如图表示。

![截图](/images/qt-cpp-course-notes/image2.png)

- 类的权限访问归类如图。

![截图](/images/qt-cpp-course-notes/image3.png)

- 变量类型是否是指针的区别，如图。

![截图](/images/qt-cpp-course-notes/image4.png)

- Shift+Win+S：电脑自带截图；Ctrl+Alt+A：QQ截图（附带长截图）。

- C++中，string和char的区别如图。

![截图](/images/qt-cpp-course-notes/image5.png)

![截图](/images/qt-cpp-course-notes/image6.png)

![截图](/images/qt-cpp-course-notes/image7.png)

![截图](/images/qt-cpp-course-notes/image8.png)

![截图](/images/qt-cpp-course-notes/image9.png)

- strlen和sizeof的区别如图所示。

![截图](/images/qt-cpp-course-notes/image10.png)

![截图](/images/qt-cpp-course-notes/image11.png)

## 2025-07-08 周二

### 13.真正的成员函数

- 普通结构体是需要进行传参的，类是不需要进行传参，可直接使用的。

- 双冒号“::”称为作用域解析运算符。

- 成员函数的实现如图，无需传参。

![截图](/images/qt-cpp-course-notes/image12.png)

### 14.类的组合

- 在 C++中，一个类包含另一个类的对象称为组合，如图。

![截图](/images/qt-cpp-course-notes/image13.png)

![截图](/images/qt-cpp-course-notes/image14.png)

![截图](/images/qt-cpp-course-notes/image15.png)

## 2025-07-10

### 15.银行案例初识权限

- 类内部不写权限，默认是私有权限。

- a -= b 等价于 a = a - b。

## 2025-07-12

### 16.C++引用

- Ctrl+I：对齐代码行。

- 传参时，用引用代替指针可直接对地址直接访问。

![截图](/images/qt-cpp-course-notes/image16.png)

- 返回引用时，同样可以直接访问数组地址修改参数。

![截图](/images/qt-cpp-course-notes/image17.png)

## 2025-07-13

### 17、函数重载和运算符重载

- 函数重载

![截图](/images/qt-cpp-course-notes/image18.png)

- 运算符重载

![截图](/images/qt-cpp-course-notes/image19.png)

![截图](/images/qt-cpp-course-notes/image20.png)

### 18、构造函数

- 不带参数的构造函数和带参数的构造函数使用。

![截图](/images/qt-cpp-course-notes/image21.png)

![截图](/images/qt-cpp-course-notes/image22.png)

![截图](/images/qt-cpp-course-notes/image23.png)

## 2025-07-15

### 19、初始化列表构造

- 初始化列表直接在对象的构造过程中初始化成员变量。

![截图](/images/qt-cpp-course-notes/image24.png)

### 20、this关键字

- 选中要注释的行数，Ctrl+/即可完成注释。

- this关键字使用

![截图](/images/qt-cpp-course-notes/image25.png)

### 21、delete关键字

- new开辟动态空间，搭配delete使用

![截图](/images/qt-cpp-course-notes/image26.png)

### 22、构造函数总结及拷贝构造函数的录制计划说明（网课不讲）

### 23、析构函数

- 在对象生命周期结束时被自动调用，用于执行对象销毁前的清理工作。

## 2025-07-17

### 24、静态成员static关键字

- 静态成员变量需要在类外初始化。

- 静态成员变量可以直接通过类名访问。

![截图](/images/qt-cpp-course-notes/image27.png)

## 2025-07-19

### 25、继承

- 继承未标明则默认为私有继承。

### 26、继承份文件实现

- 在分文件内添加函数定义

![截图](/images/qt-cpp-course-notes/image28.png)

- 继承子类生成

![截图](/images/qt-cpp-course-notes/image29.png)

## 2025-07-20

### 27、权限对继承的影响

- 权限和继承的关系图

![截图](/images/qt-cpp-course-notes/image30.png)

![截图](/images/qt-cpp-course-notes/image31.png)

### 28、基类构造函数

- 派生类构造函数受基类构造函数影响。

![截图](/images/qt-cpp-course-notes/image32.png)

### 29、虚函数

- 允许派生类重写该函数，关键字virtual。

![截图](/images/qt-cpp-course-notes/image33.png)

![截图](/images/qt-cpp-course-notes/image34.png)

### 30、多重继承

- 多重继承是一种允许一个类同时继承多个基类的特性。这意味着派生类可以继承多个基类的属性和方法。

![截图](/images/qt-cpp-course-notes/image35.png)

## 2025-07-21

### 31、菱形继承和虚继承

- 菱形继承演示图。

![截图](/images/qt-cpp-course-notes/image36.png)

### 25、多态

- 多态的实现类似于一种遥控器充当多种遥控器的身份操作不同设备的开关。

![截图](/images/qt-cpp-course-notes/image37.png)

- 通过指针调用虚函数或者引用调用虚函数。

![截图](/images/qt-cpp-course-notes/image38.png)

![截图](/images/qt-cpp-course-notes/image39.png)

### 33、抽象类

- 抽象类用于提供共同的基础结构。它不能被实例化，只能作为其他类的基类，确保派生类实现特定的虚函数。

![截图](/images/qt-cpp-course-notes/image40.png)

![截图](/images/qt-cpp-course-notes/image41.png)

![截图](/images/qt-cpp-course-notes/image42.png)

### 34、接口

- 接口类还是抽象类，但更多的是行为方面的。

### 35、记事本项目概述（简单讲解记事本的功能）

### 36、QT工程默认各文件解析

- 界面选择。

![截图](/images/qt-cpp-course-notes/image43.png)

- 创建程序后各个文件各行代码理解。

![截图](/images/qt-cpp-course-notes/image44.png)

![截图](/images/qt-cpp-course-notes/image45.png)

## 2025-07-22

### 37、记事本按键组合布局

### 38、记事本初步布局完成

- 如何排版中间无空隙。

![截图](/images/qt-cpp-course-notes/image46.png)

### 39、实现窗口大小调整的子控件自适应

- 窗口大小自适应。（ui里面要是最大的布局）

![截图](/images/qt-cpp-course-notes/image47.png)

### 40、记事本UI美化stylesheet初探

- 按键平时状态：

QPushButton { border-image: url(:/jishiben/c0.png); }

- 按键上鼠标悬停状态：

QPushButton:hover { border-image: url(:/jishiben/c1.png); }

- 按键上鼠标按下状态：

QPushButton:pressed { border-image: url(:/jishiben/c2.png); }

- 如何添加图片生成qrc文件。

![截图](/images/qt-cpp-course-notes/image48.png)

![截图](/images/qt-cpp-course-notes/image49.png)

![截图](/images/qt-cpp-course-notes/image50.png)

![截图](/images/qt-cpp-course-notes/image51.png)

![截图](/images/qt-cpp-course-notes/image52.png)

- 按键添加底图。

![截图](/images/qt-cpp-course-notes/image53.png)

### 41、UI美化遗留问题解决

![截图](/images/qt-cpp-course-notes/image54.png)

- 下面的文字跟着窗口拖动下移动到固定位置

ui-\>widgetBotton-\>setLayout(ui-\>horizontalLayout_3);

![截图](/images/qt-cpp-course-notes/image55.png)

- 也可直接选中区域设置水平布局同样达到效果。

### 42、信号与槽的引用

- 通过界面方式添加信号与槽。

![截图](/images/qt-cpp-course-notes/image56.png)

- 另外一种方式实现添加信号与槽。

![截图](/images/qt-cpp-course-notes/image57.png)

![截图](/images/qt-cpp-course-notes/image58.png)

## 2025-07-24

### 43、信号与槽的四种代码实现方式

- 方法一：自动连接使用UI文件

![截图](/images/qt-cpp-course-notes/image59.png)

![截图](/images/qt-cpp-course-notes/image60.png)

![截图](/images/qt-cpp-course-notes/image61.png)

- 方法二：使用QObject::connect。

![截图](/images/qt-cpp-course-notes/image62.png)

![截图](/images/qt-cpp-course-notes/image63.png)

![截图](/images/qt-cpp-course-notes/image64.png)

![截图](/images/qt-cpp-course-notes/image65.png)

![截图](/images/qt-cpp-course-notes/image66.png)

- 方法三：Lambda表达式。

![截图](/images/qt-cpp-course-notes/image67.png)

- Ctrl+B：构建函数文件。

- 方法四：

![截图](/images/qt-cpp-course-notes/image68.png)

![截图](/images/qt-cpp-course-notes/image69.png)

![截图](/images/qt-cpp-course-notes/image70.png)

## 2025-07-24

### 44、自定义信号与槽

- 自定义信号与槽。

![截图](/images/qt-cpp-course-notes/image71.png)

![截图](/images/qt-cpp-course-notes/image72.png)

![截图](/images/qt-cpp-course-notes/image73.png)

### 45、QFile读取文件

- Alt+Enter：快速添加头文件。

![截图](/images/qt-cpp-course-notes/image74.png)

- QFile的引用。

![截图](/images/qt-cpp-course-notes/image75.png)

![截图](/images/qt-cpp-course-notes/image76.png)

## 2025-07-25

### 46、QFile创建并写入文件

- 创建并写入文件

![截图](/images/qt-cpp-course-notes/image77.png)

### 47、QTextSteam读写文件

- 读取文件：

![截图](/images/qt-cpp-course-notes/image78.png)

- 创建并写入文件：

![截图](/images/qt-cpp-course-notes/image79.png)

### 48、QFlieDialog文件选择框

- 文件选择。

![截图](/images/qt-cpp-course-notes/image80.png)

### 49、QFileDialog选择多个文件

- 选择多个文件：

![截图](/images/qt-cpp-course-notes/image81.png)

![截图](/images/qt-cpp-course-notes/image82.png)

- 其中：

![截图](/images/qt-cpp-course-notes/image83.png)

![截图](/images/qt-cpp-course-notes/image84.png)

### 50、QFileDialog创建文件

- 保存文件。

![截图](/images/qt-cpp-course-notes/image85.png)

### 51、记事本实现打开功能

- Widget可作为背景板。

![截图](/images/qt-cpp-course-notes/image86.png)

- 添加颜色添加背景色。

![截图](/images/qt-cpp-course-notes/image87.png)

- 文本框。

![截图](/images/qt-cpp-course-notes/image88.png)

- 如果布局缩成一团，可以改高度试试。

- 代码解析：

打开选择文件框。

![截图](/images/qt-cpp-course-notes/image89.png)

清除之前剩余内容，以只读形式打开文件，创建文本流并设置UTF-8编码。

![截图](/images/qt-cpp-course-notes/image90.png)

![截图](/images/qt-cpp-course-notes/image91.png)

### 52、记事本实现保存新建文件的功能

- 代码解析：

![截图](/images/qt-cpp-course-notes/image92.png)

- 共享成员数据

![截图](/images/qt-cpp-course-notes/image93.png)

![截图](/images/qt-cpp-course-notes/image94.png)

### 53、记事本实现关闭按键

- 代码解析：

![截图](/images/qt-cpp-course-notes/image95.png)

### 54、字符编码问题引入

- ANSI和UTF-8不同编码文件会出现乱码现象。

## 2025-07-26

### 55、QComboBox组件

- QComboBox组件实现选择编码ui功能。

![截图](/images/qt-cpp-course-notes/image96.png)

![截图](/images/qt-cpp-course-notes/image97.png)

- 代码实现。

![截图](/images/qt-cpp-course-notes/image98.png)

![截图](/images/qt-cpp-course-notes/image99.png)

![截图](/images/qt-cpp-course-notes/image100.png)

### 56、记事本优化打开各种类型的编码文件

- 拷贝项目时记得不光要改文件夹名字，还要改内部.pro文件和.pro.user文件。再次打开时可通过载入项目选项打开拷贝过后的项目。

![截图](/images/qt-cpp-course-notes/image101.png)

- 实现文本框内编码类型选择的转换。

![截图](/images/qt-cpp-course-notes/image102.png)

![截图](/images/qt-cpp-course-notes/image103.png)

### 57、记事本支持光标行列值显示

- 工具-\>选项-\>文本编辑器，可修改文件编码。

![截图](/images/qt-cpp-course-notes/image104.png)

- 实现获取行列信息。

![截图](/images/qt-cpp-course-notes/image105.png)

![截图](/images/qt-cpp-course-notes/image106.png)

### 58、记事本添加打开文件的提示

- 文本框的显示提示。

![截图](/images/qt-cpp-course-notes/image107.png)

- 显示文件路径。

![截图](/images/qt-cpp-course-notes/image108.png)

![截图](/images/qt-cpp-course-notes/image109.png)

### 59、C++补充知识-模块

- 类模版。

![截图](/images/qt-cpp-course-notes/image110.png)

- 函数模版。

![截图](/images/qt-cpp-course-notes/image111.png)

### 60、QList容器简介

- QList 是一个容器类，它在内部实现上类似于一个数组，但也提供了一些链表的特性。

### 61、记事本实现当前行高亮功能

- 设置当前行高亮。

![截图](/images/qt-cpp-course-notes/image112.png)

### 62、记事本优化保存文件的逻辑

- 权限更改。

![截图](/images/qt-cpp-course-notes/image113.png)

- 判断文件是否打开。

![截图](/images/qt-cpp-course-notes/image114.png)

### 63、记事本关闭按键功能优化

- 新增弹窗效果。

![截图](/images/qt-cpp-course-notes/image115.png)

![截图](/images/qt-cpp-course-notes/image116.png)

![截图](/images/qt-cpp-course-notes/image117.png)

- 实现三个选项各自功能。

![截图](/images/qt-cpp-course-notes/image118.png)

### 64、记事本添加快捷键功能

- 创建打开和保存的快捷键。

![截图](/images/qt-cpp-course-notes/image119.png)

![截图](/images/qt-cpp-course-notes/image120.png)

### 65、记事本快捷键放大缩小字体

- 实现放大和缩小的快捷键功能。

![截图](/images/qt-cpp-course-notes/image121.png)

![截图](/images/qt-cpp-course-notes/image122.png)

![截图](/images/qt-cpp-course-notes/image123.png)

![截图](/images/qt-cpp-course-notes/image124.png)

### 66、QT事件概念引入

- 事件（event）是由系统或者 Qt 本身在不同的场景下发出的。当用户按下/移动鼠标、敲下键盘，或者是 窗口关闭/大小发生变化/隐藏或显示都会发出一个相应的事件。一些事件在对用户操作做出响应时发出， 如鼠标/键盘事件等；另一些事件则是由系统自动发出，如计时器事件。

- 事件分发过程。

![截图](/images/qt-cpp-course-notes/image125.png)

## 2025-07-27

### 67、重写窗口各类默认事件

- Alt+Enter：也能直接添加函数定义。

- 各个事件的实现：

![截图](/images/qt-cpp-course-notes/image126.png)

![截图](/images/qt-cpp-course-notes/image127.png)

![截图](/images/qt-cpp-course-notes/image128.png)

![截图](/images/qt-cpp-course-notes/image129.png)

![截图](/images/qt-cpp-course-notes/image130.png)

### 68、用事件自定义出一个按键

- 自定义按键类头文件声明。

![截图](/images/qt-cpp-course-notes/image131.png)

![截图](/images/qt-cpp-course-notes/image132.png)

- 可通过右击图片复制图片路径。

![截图](/images/qt-cpp-course-notes/image133.png)

- 按键自定义函数设置

![截图](/images/qt-cpp-course-notes/image134.png)

![截图](/images/qt-cpp-course-notes/image135.png)

![截图](/images/qt-cpp-course-notes/image136.png)

- 选择Widget作为按键使用，通过提升选用按键类实现按键定义功能。

![截图](/images/qt-cpp-course-notes/image137.png)

![截图](/images/qt-cpp-course-notes/image138.png)

### 69、使用自定义按键的信号与槽

- 自定义按键的信号与槽。

![截图](/images/qt-cpp-course-notes/image139.png)

![截图](/images/qt-cpp-course-notes/image140.png)

![截图](/images/qt-cpp-course-notes/image141.png)

### 70、事件重写实现滚轮放大缩小字体

- 创建QTextEdit的子类。

![截图](/images/qt-cpp-course-notes/image142.png)

- 事件设计。

![截图](/images/qt-cpp-course-notes/image143.png)

![截图](/images/qt-cpp-course-notes/image144.png)

![截图](/images/qt-cpp-course-notes/image145.png)

![截图](/images/qt-cpp-course-notes/image146.png)

### 71、事件过滤器的方式实现滚轮按键放大

- 事件过滤器（Event Filter）：可以让你在事件达到目标对象之前进行拦截和处理。这是一种强大的机制，允许你在不同对象间共享事件处理逻辑或在父对象中集中处理特定事件。

- 事件派发 -\> 事件过滤-\>事件分发-\>事件处理。

- 事件过滤器方式实现滚轮放大缩小。

![截图](/images/qt-cpp-course-notes/image147.png)

![截图](/images/qt-cpp-course-notes/image148.png)

![截图](/images/qt-cpp-course-notes/image149.png)

### 72、记事本项目总结

## 2025-08-07

### 73、串口调试助手界面01

- 组框+文本编辑器+栅格布局

![截图](/images/qt-cpp-course-notes/image150.png)

![截图](/images/qt-cpp-course-notes/image151.png)

![截图](/images/qt-cpp-course-notes/image152.png)

![截图](/images/qt-cpp-course-notes/image153.png)

- 勾选框+线性文本框+按钮

![截图](/images/qt-cpp-course-notes/image154.png)

![截图](/images/qt-cpp-course-notes/image155.png)

![截图](/images/qt-cpp-course-notes/image156.png)

![截图](/images/qt-cpp-course-notes/image157.png)

- 改布局空间比例

![截图](/images/qt-cpp-course-notes/image158.png)

- 在 Qt Designer 中，如果删除了一个名为pushButton的按钮后，新建按钮无法使用相同名称，这是因为 Qt Designer 会自动维护对象名称的唯一性，即使原对象已删除，有时也会保留名称记录。可以直接退出重进即可解决。

### 74、串口调试助手页面完结

- 调整上下布局间距

![截图](/images/qt-cpp-course-notes/image159.png)

## 2025-08-08

### 75、串口助手添加参数选项

![截图](/images/qt-cpp-course-notes/image160.png)

- 查看QSerialPort的Public type可看到很多串口枚举。

![截图](/images/qt-cpp-course-notes/image161.png)

### 76、串口调试助手自动检测串口号

- QSerialPortInfo，检测串口号。

![截图](/images/qt-cpp-course-notes/image162.png)

![截图](/images/qt-cpp-course-notes/image163.png)

### 77、串口调试助手打开串口

- 首先创建一个串口通信对象，接着将ui界面的数据获取到串口里面。

![截图](/images/qt-cpp-course-notes/image164.png)

![截图](/images/qt-cpp-course-notes/image165.png)

![截图](/images/qt-cpp-course-notes/image166.png)

![截图](/images/qt-cpp-course-notes/image167.png)

![截图](/images/qt-cpp-course-notes/image168.png)

![截图](/images/qt-cpp-course-notes/image169.png)

### 78、串口调试助手实现自收自发功能

- 创建信号与槽函数，实现自收自发。

![截图](/images/qt-cpp-course-notes/image170.png)

![截图](/images/qt-cpp-course-notes/image171.png)

### 79、串口助手发送状态更新（截止，没有串口暂时看不到运行效果，以后再做程序为73-1）

### 147、天气预报项目概述

## 2025-08-09

### 148、天气预报界面-中部

- stylesheet当中指令border-radius: 10px;添加到样式表为边框圆弧化。

![截图](/images/qt-cpp-course-notes/image172.png)

- 更改Widget比例。

![截图](/images/qt-cpp-course-notes/image173.png)

- label可选择图片。图片装不下可勾选scaledContents。

![截图](/images/qt-cpp-course-notes/image174.png)

![截图](/images/qt-cpp-course-notes/image175.png)

- 更改字体位置（靠左还是靠右，还是居中）。

![截图](/images/qt-cpp-course-notes/image176.png)

- Ctrl+鼠标左键拖动：即可完成复制粘贴。

![截图](/images/qt-cpp-course-notes/image177.png)

- 改大可以使图片紧凑（包含上、下、左和右）。

![截图](/images/qt-cpp-course-notes/image178.png)

![截图](/images/qt-cpp-course-notes/image179.png)

- 调整中间间隙。

![截图](/images/qt-cpp-course-notes/image180.png)

![截图](/images/qt-cpp-course-notes/image181.png)

- 调整上下间隙。

![截图](/images/qt-cpp-course-notes/image182.png)

![截图](/images/qt-cpp-course-notes/image183.png)

### 149、天气预报界面-上部

### 150、天气预报界面-下部-空气-湿度

### 151、天气预报界面-下部

- 边框圆角设置（注意：使用边角时必须包含全框圆角代码）。

![截图](/images/qt-cpp-course-notes/image184.png)

![截图](/images/qt-cpp-course-notes/image185.png)

### 152、天气预报界面完成

- 固定尺寸和去边框代码。

![截图](/images/qt-cpp-course-notes/image186.png)

## 2025-08-10

### 153、天气预报重写鼠标右键事件-退出功能

- 创建菜单用于退出。

![截图](/images/qt-cpp-course-notes/image187.png)

![截图](/images/qt-cpp-course-notes/image188.png)

![截图](/images/qt-cpp-course-notes/image189.png)

### 154、天气预报重写鼠标移动事件-移动窗口

- 计算偏移量用于定位鼠标移动位置。

![截图](/images/qt-cpp-course-notes/image190.png)

### 155、天气预报-天气数据来源方案

### 156、网络通信协议基本概念

### 157、天气预报-QtHttp编程-天气原始数据获得

- 请求之前记得在工程文件添加network和头文件。

![截图](/images/qt-cpp-course-notes/image191.png)

\#include \<QCoreApplication\>

\#include \<QNetworkAccessManager\>

\#include \<QNetworkRequest\>

\#include \<QNetworkReply\>

\#include \<QObject\>

\#include \<QDebug\>

- void ***mouseMoveEvent***(QMouseEvent \*event) override;

当中override是什么意思？

![截图](/images/qt-cpp-course-notes/image192.png)

![截图](/images/qt-cpp-course-notes/image193.png)

- http协议请求与响应代码编写。

![截图](/images/qt-cpp-course-notes/image194.png)

![截图](/images/qt-cpp-course-notes/image195.png)

## 2025-08-13

### 158、天气预报-QtHttp编程-处理网络请求失败

- 网络请求失败（404）直接弹窗报错。

![截图](/images/qt-cpp-course-notes/image196.png)

![截图](/images/qt-cpp-course-notes/image197.png)

### 159、JSON概述

- JSON本质就是一个字符串。

### 160、JSON数据封装生成一个文件

- 封装数据写入文件当中。

![截图](/images/qt-cpp-course-notes/image198.png)

![截图](/images/qt-cpp-course-notes/image199.png)

### 161、JSON数据封装加强理解和应用

- 添加更多数组。

![截图](/images/qt-cpp-course-notes/image200.png)

### 162、JSON数据解析

- 解析数据。

![截图](/images/qt-cpp-course-notes/image201.png)

![截图](/images/qt-cpp-course-notes/image202.png)

![截图](/images/qt-cpp-course-notes/image203.png)

![截图](/images/qt-cpp-course-notes/image204.png)

### 163、JSON数据解析-对象数组

- 对于对象里有数组的数据解析。

![截图](/images/qt-cpp-course-notes/image205.png)

### 164、天气预报-刷新当天的天气数据

- 解析并读取天气数据。

![截图](/images/qt-cpp-course-notes/image206.png)

![截图](/images/qt-cpp-course-notes/image207.png)

### 165、天气预报-支持不同城市天气

- 获取城市编码，再将编码添加到网址后面，通过槽函数实现搜索不同城市天气功能。

![截图](/images/qt-cpp-course-notes/image208.png)

![截图](/images/qt-cpp-course-notes/image209.png)

![截图](/images/qt-cpp-course-notes/image210.png)

### 166、天气预报-QMap解决天气bug

- 引用QMap保存数据只需查找一次库即可。

![截图](/images/qt-cpp-course-notes/image211.png)

![截图](/images/qt-cpp-course-notes/image212.png)

### 167-天气预报-支持天气图标刷新

- 创建qmap保存文件地址，然后解析获取地址。

>

![截图](/images/qt-cpp-course-notes/image213.png)

>

![截图](/images/qt-cpp-course-notes/image214.png)

>

![截图](/images/qt-cpp-course-notes/image215.png)

### 168、天气预报-获取7天天气数据

- 创建day类用于存储json数据，再通过解析读取到ui当中。

![截图](/images/qt-cpp-course-notes/image216.png)

![截图](/images/qt-cpp-course-notes/image217.png)

![截图](/images/qt-cpp-course-notes/image218.png)

### 169、天气预报-更新七天天气UI显示

- 创建数组保存数据，通过遍历ui读取数据。

![截图](/images/qt-cpp-course-notes/image219.png)

![截图](/images/qt-cpp-course-notes/image220.png)

![截图](/images/qt-cpp-course-notes/image221.png)

### 170、天气预报-优化上节课显示不好的地方

- 天气转换。

![截图](/images/qt-cpp-course-notes/image222.png)

- 空气质量不同时，图片颜色与之相对应。

![截图](/images/qt-cpp-course-notes/image223.png)

- 消掉最前面的2025年份，显示简略化，只显示后面的月份和日期。

![截图](/images/qt-cpp-course-notes/image224.png)

## 2025-08-15

### 171、用事件过滤器在子控件上绘图

### 172、天气预报-绘制7天高低温曲线图

### 173、天气预报-最终版本

## 2025-09-25

### 110、服务端建立连接

- 注意pro文件添加network。

![截图](/images/qt-cpp-course-notes/image225.png)

- Windows系统连接服务端指令：telnet 服务器地址 端口
