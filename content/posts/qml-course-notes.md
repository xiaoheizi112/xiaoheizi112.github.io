+++
title = 'Qt/QML 网易云音乐桌面前端课程学习笔记'
date = '2026-10-02'
tags = ['Qt', 'QML']
draft = false
+++

> 课程来自B站up主：25号底片编程，打卡日期：2025/8/19

## qml项目介绍

- qml基本使用。

![截图](/images/qml-course-notes/image1.png)

![截图](/images/qml-course-notes/image2.png)

![截图](/images/qml-course-notes/image3.png)

## qml属性

- qml常见属性。

![截图](/images/qml-course-notes/image4.png)

## qml基础控件之Item_qml

- 子类继承item基类用法。

![截图](/images/qml-course-notes/image5.png)

![截图](/images/qml-course-notes/image6.png)

![截图](/images/qml-course-notes/image7.png)

## anchors锚布局_qml

- 使用前提一定记得定义各自id。

![截图](/images/qml-course-notes/image8.png)

2025/8/20

## Item&Rectangle

- 通过裁剪显示一个圆边。

![截图](/images/qml-course-notes/image9.png)

![截图](/images/qml-course-notes/image10.png)

## Text_qml教程

- Text文本设置教程。Text的id不能和Text重名。

![截图](/images/qml-course-notes/image11.png)

## TextField_qml教程

- TextField输入框设置教程。

![截图](/images/qml-course-notes/image12.png)

## Image_qml教程

- 图片用Qt source文件保管，复制路径时记得把最前面的冒号“:”去掉。

![截图](/images/qml-course-notes/image13.png)

## 事件系统_qml教程

- 定义键盘按下事件

![截图](/images/qml-course-notes/image14.png)

- 定义鼠标互动事件。其中使用 var 声明的变量可以存储任意类型的数据（数字、字符串、布尔值、对象、数组等），a为字符串，b为整型。“==”号和“===”号的区别，双等号判断松散，三等号判断严格。

![截图](/images/qml-course-notes/image15.png)

2025/8/21

## 拖拽事件_qml教程

- 第一个框：在鼠标交互区域添加交互对象，可进行X轴、Y轴拖动交互。
  第二个框：在交互区域添加拖动被释放事件，当取消拖动时ppp的组件会变成白色。

![截图](/images/qml-course-notes/image16.png)

- DropArea类似MouseArea，用于专门接收拖放区域。在组件内部注意设置拖放激活状态要与鼠标拖动区域进行绑定。

![截图](/images/qml-course-notes/image17.png)

![截图](/images/qml-course-notes/image18.png)

## Button

- 按钮组件设置。

![截图](/images/qml-course-notes/image19.png)

2025/8/23

## DelayButton_qml教程

- 延时按钮组件。

![截图](/images/qml-course-notes/image20.png)

## Switch_qml教程

- 开关组件。

![截图](/images/qml-course-notes/image21.png)

## RadioButton

- 多个单选按钮只能单选，添加按钮组ButtonGroup后可选多个按钮，也可以用Item把按钮放进来合成一个组，但组中的按钮只能单选。

![截图](/images/qml-course-notes/image22.png)

2025/8/24

## Popup_qml教程

- Popup弹出式组件。

![截图](/images/qml-course-notes/image23.png)

2025/8/25

## Dialog

- 对话框组件，可添加多种按钮用于实际操作。

![截图](/images/qml-course-notes/image24.png)

## FileDialog&FolderDialog

- 使用FileDialog（文件对话框）和FolderDialog（文件夹对话框）记得包含相关模块。

![截图](/images/qml-course-notes/image25.png)

![截图](/images/qml-course-notes/image26.png)

![截图](/images/qml-course-notes/image27.png)

## Color&Font&MessageDialog

![截图](/images/qml-course-notes/image28.png)

![截图](/images/qml-course-notes/image29.png)

- 使用MessageDialog时要添加和修改相关数据。

![截图](/images/qml-course-notes/image30.png)

![截图](/images/qml-course-notes/image31.png)

![截图](/images/qml-course-notes/image32.png)

![截图](/images/qml-course-notes/image33.png)

2025/8/26

## State&Transition

- state（状态）以及transition（过渡）的使用技巧。

![截图](/images/qml-course-notes/image34.png)

![截图](/images/qml-course-notes/image35.png)

![截图](/images/qml-course-notes/image36.png)

![截图](/images/qml-course-notes/image37.png)

2025/8/27

## PropertyAnimation_qml教程

- 放在过渡动画中可以实现颜色渐变。

![截图](/images/qml-course-notes/image38.png)

- 放在父对象中，可用于修改该组件的宽度。

![截图](/images/qml-course-notes/image39.png)

- 也可单独拎出来作用其他对象的参数修改，不过需要单独创建按钮来调用它。

![截图](/images/qml-course-notes/image40.png)

![截图](/images/qml-course-notes/image41.png)

## Behavior_qml教程

- 如果动画需要多次修改，则需要定义多个propertyAnimation，用起来非常麻烦，使用bahavior可进行多次修改，操作便捷。

![截图](/images/qml-course-notes/image42.png)

## ParallelAnimation&SequentialAnimation

- 并行动画ParallelAnimation。

![截图](/images/qml-course-notes/image43.png)

- 串行动画SequentialAnimation。

![截图](/images/qml-course-notes/image44.png)

- 脚本动画，一般用于业务当中。

![截图](/images/qml-course-notes/image45.png)

2025/8/28

## 线性-锥型-辐射渐变_qml教程

- 渐变，默认垂直渐变。

![截图](/images/qml-course-notes/image46.png)

- 线性渐变。

![截图](/images/qml-course-notes/image47.png)

![截图](/images/qml-course-notes/image48.png)

- 锥形渐变。

![截图](/images/qml-course-notes/image49.png)

![截图](/images/qml-course-notes/image50.png)

- 径向渐变。

![截图](/images/qml-course-notes/image51.png)

![截图](/images/qml-course-notes/image52.png)

## BrightnessContrast_qml教程

- 使用BrightnessContrast组件对图像进行实时处理。

![截图](/images/qml-course-notes/image53.png)

![截图](/images/qml-course-notes/image54.png)

- 创建滑块控制图像亮度。

![截图](/images/qml-course-notes/image55.png)

- 创建滑块控制图片饱和度。

![截图](/images/qml-course-notes/image56.png)

## qml教程__HSL色彩空间调整

- HSL（色调、饱和度、亮度）的应用，其中只展示亮度的滑动控件使用。

![截图](/images/qml-course-notes/image57.png)

![截图](/images/qml-course-notes/image58.png)

- 单独控制饱和度。

![截图](/images/qml-course-notes/image59.png)

- 伽马矫正组件。

![截图](/images/qml-course-notes/image60.png)

- 色相饱和度调整组件，使用方法类似着色器组件。

![截图](/images/qml-course-notes/image61.png)

## qml教程_-Blur

- 多种方式进行图片模糊处理。

![截图](/images/qml-course-notes/image62.png)

![截图](/images/qml-course-notes/image63.png)

![截图](/images/qml-course-notes/image64.png)

![截图](/images/qml-course-notes/image65.png)

![截图](/images/qml-course-notes/image66.png)

![截图](/images/qml-course-notes/image67.png)

其中1-7对应2-8的imge图片模糊。

![截图](/images/qml-course-notes/image68.png)

2025/8/29

## qml教程_-Blend&ColorOverlay

- 图叠加和混合。

![截图](/images/qml-course-notes/image69.png)

![截图](/images/qml-course-notes/image70.png)

## qml教程__DropShadow&InnerShadow

- 投影。

![截图](/images/qml-course-notes/image71.png)

![截图](/images/qml-course-notes/image72.png)

- 内阴影。

![截图](/images/qml-course-notes/image73.png)

![截图](/images/qml-course-notes/image74.png)

## Glow&RectangleGlow

- 发光。

![截图](/images/qml-course-notes/image75.png)

![截图](/images/qml-course-notes/image76.png)

2025/8/31

## qml教程__ListView

- Ctrl+Shift+up：选中文本向上移动。

![截图](/images/qml-course-notes/image77.png)

![截图](/images/qml-course-notes/image78.png)

- 详细请浏览相关代码：D:\Mycode\Qtcode\Music。

2025/9/1

## qml教程_-布局系统

- row行布局和column列布局。

![截图](/images/qml-course-notes/image79.png)

![截图](/images/qml-course-notes/image80.png)

- 网格布局。

![截图](/images/qml-course-notes/image81.png)

- rowlayout和column。

![截图](/images/qml-course-notes/image82.png)

![截图](/images/qml-course-notes/image83.png)

- gridlayout。

![截图](/images/qml-course-notes/image84.png)

## qml教程_-自定义组件

- 添加自定义组件。

![截图](/images/qml-course-notes/image85.png)

![截图](/images/qml-course-notes/image86.png)

![截图](/images/qml-course-notes/image87.png)

![截图](/images/qml-course-notes/image88.png)

设置好后在主函数可直接调用（注意qml文件当中文件名首字母大写）。

![截图](/images/qml-course-notes/image89.png)

- 添加新文件夹里的qml文件如何引用。可通过improt它的地址进行关联。

![截图](/images/qml-course-notes/image90.png)

## C++访问qml控件

![截图](/images/qml-course-notes/image91.png)

- qml触发信号如何连接到C++的槽，在C++当中实现信号与槽，构建类必须要继承QObject。

![截图](/images/qml-course-notes/image92.png)

- C++访问qml控件以及qml的信号与C++的槽的连接。

![截图](/images/qml-course-notes/image93.png)

![截图](/images/qml-course-notes/image94.png)

![截图](/images/qml-course-notes/image95.png)

![截图](/images/qml-course-notes/image96.png)

注意头文件包含

![截图](/images/qml-course-notes/image97.png)

## Qml访问C++类成员属性和方法

- C++的类的数据通过注册添加qml间接访问。

![截图](/images/qml-course-notes/image98.png)

![截图](/images/qml-course-notes/image99.jpeg)

![截图](/images/qml-course-notes/image100.png)

![截图](/images/qml-course-notes/image101.png)

![截图](/images/qml-course-notes/image102.png)

- C++的数据qml直接访问。

![截图](/images/qml-course-notes/image103.png)

2025/9/2

## WorkerScript_qml也能多线程异步处理数据

- 单独写一个js文件。

![截图](/images/qml-course-notes/image104.png)

![截图](/images/qml-course-notes/image105.png)

## 项目制作笔记

- 封装

![截图](/images/qml-course-notes/image106.png)

- width和impliciwidth的区别，一般引用其他控件的宽度时使用后者。

![截图](/images/qml-course-notes/image107.png)

- 子控件是可以访问到父控件以及父控件的兄弟控件。
