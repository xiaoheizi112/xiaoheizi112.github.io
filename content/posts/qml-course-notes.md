+++
title = 'Qt/QML 网易云音乐桌面前端课程学习笔记'
date = '2026-10-02'
tags = ['Qt', 'QML']
draft = false
description = "跟着网易云音乐桌面端课程学 QML：从基本语法到完整做一个音乐播放器前端的全过程笔记。"
images = ["images/og/qml-course-notes.png"]
+++

> 课程来自B站up主：25号底片编程，打卡日期：2025/8/19

## qml项目介绍

- qml基本使用。

```qml
// 定义一个顶级窗口组件，是所有界面元素的容器
Window {
    // 设置窗口是否可见，true表示可见
    visible: true
    // 设置窗口宽度为640像素
    width: 640
    // 设置窗口高度为480像素
    height: 480
    // 设置窗口标题，qsTr()用于支持国际化翻译
    title: qsTr("Hello World")
    // 设置窗口背景颜色为灰色
    color: "gray"
```

```qml
// 定义第一个矩形组件
Rectangle{
    // 给当前矩形指定一个唯一标识id，用于被其他组件引用
    id:aaa
    // 设置矩形宽度为100像素
    width: 100
    // 设置矩形高度为100像素
    height:100
    // 设置矩形填充颜色为红色
    color: "red"

    // 设置矩形边框颜色为黄色
    border.color: "yellow"
    // 设置矩形边框宽度为5像素
    border.width:5
    // 设置矩形边角的圆角半径为10像素（值越大角越圆）
    radius:10
}
```

```qml
// 定义第二个矩形组件
    Rectangle{
        // 设置矩形的x坐标（水平位置）为200像素（从窗口左侧边缘开始计算）
        x:200
        // 设置矩形宽度为100像素
        width:100
        // 设置矩形高度为100像素
        height:100
        // 填充颜色绑定到第一个矩形(aaa)的颜色，会随aaa的颜色变化而变化
        color:aaa.color

        // 边框颜色绑定到第一个矩形(aaa)的边框颜色
        border.color: aaa.border.color
        // 边框宽度绑定到第一个矩形(aaa)的边框宽度
        border.width: aaa.border.width
```

## qml属性

- qml常见属性。

```qml
    // 1．默认属性：无需显式指定属性名即可赋值
    // 当给该组件添加子元素且未指定属性时，会自动赋值给此属性
    default property color aaaColor: "pink"//int,real,double,string,list...

    // 2．只读属性：声明后无法在运行时修改
    // 尝试修改会导致错误（如下方注释掉的代码）
    readonly property color aaaColor2: "cyan"

    // 3．必需属性：必须显式赋值，否则会报错
//    required property int b
//    b:4

    // 4．组件完成加载时执行的代码块
    Component.onCompleted: {
//    qDebug()<<"123";
//    cout<<"123";
        // QML中打印日志的正确方式
        console.log("123");

        // 可以修改普通属性和默认属性
        aaa.aaaColor = "#333333"  // 这里会修改默认属性值

        // 不能修改只读属性（已注释，否则会报错）
        // aaa.aaaColor2 = "#444444"
    }
```

## qml基础控件之Item_qml

- 子类继承item基类用法。

```qml
scale : real
smooth : bool
state : string
states : list<State>
transform : list<Transform>
transformOrigin : enumeration
transitions : list<Transition>
visible : bool
visibleChildren : list<Item>
width : real
x : real
y : real
z : real
```

```qml
Rectangle{
    width:100
    height:100
    color:"red"

    x:100
    y:100
    //z:控制元素的堆叠顺序
    //z值越大越靠上层，z值越小越靠底层
    z:101
}
```

```qml
Rectangle{
    width:100
    height:100
    color:"cyan"

    x:150
    y:100
    z:102

    //visible:true正常显示，false隐藏
    visible:true
    //scale:控制元素缩放比例
    scale:1.5
    //旋转角度
    //rotation:45
    //透明度0到1区间
    opacity: 0.5
    //clip:true:开启裁剪功能，子元素超出父元素范围的部分会被隐藏
    clip:true
    Rectangle{
        width:50
        height:50
        color:"yellow"

        x:-10
    }
}
```

## anchors锚布局_qml

- 使用前提一定记得定义各自id。

```qml
    Rectangle{
        id:bbb
        width:100
        height:100
        color:"cyan"
//      //bbb 填充于aaa
//      anchors.fill:aaa
//      //垂直居中对齐
//      anchors.verticalCenter: aaa.verticalCenter
//      //水平居中对齐
//      anchors.horizontalCenter: aaa.horizontalCenter
//      //bbb居中于aaa
//      anchors.centerIn: aaa

//      // bbb的左对齐aaa的右
//      anchors.left: aaa.right
//      // bbb的上对齐aaa的上
//      anchors.top: aaa.top
//      //左边距为20像素
//      anchors.leftMargin: 20
//      //右对齐谁
//      anchors.right:
//      //右边边距
//      anchors.rightMargin:
//      //下对齐谁
//      anchors.bottom:
```

2025/8/20

## Item&Rectangle

- 通过裁剪显示一个圆边。

```qml
//显示一个圆边
Item {
    width:100
    height:100
    //在父类居中
    anchors.centerIn: parent
    clip:true

    Rectangle{
        width:100
        height:100
        color:"red"
        radius:20

        x:20
        y:20
    }
}
```

![Qt/QML 网易云音乐桌面前端课程学习笔记 配图 10](/posts/qml-course-notes/image10.webp)

## Text_qml教程

- Text文本设置教程。Text的id不能和Text重名。

```qml
Text {
    id: text
    width:150
    //内容
    text: "aaa bbb cc100000c ddd eeeeeeeeeeeeeee"
    //字体
    font.family: "黑体"
    //字号
    font.pixelSize: 30
    color:"red"
    //换行（换行、省略功能二选一）
    wrapMode:
        //不换行
        //Text.NoWrap
        //间隔完整单词换行
        //Text.WordWrap
        //见底直接换行
        Text.WrapAnywhere
    //省略（换行、省略功能二选一）
    elide:
        //左省略
        //Text.ElideLeft
        //中间省略
        Text.ElideMiddle
        //右省略
        //Text.ElideRight
}
```

## TextField_qml教程

- TextField输入框设置教程。

```qml
// 定义一个文本输入框组件
TextField{
    width:300
    height:50
    font.family: "黑体"
    font.pixelSize: 40
    // 设置输入框为空时显示的提示文本
    placeholderText:"请输入密码"
    // 设置输入模式为密码模式（输入内容会被隐藏为圆点或星号）
    echoMode: TextInput.Password
    // 允许通过鼠标选择输入框内的文本
    selectByMouse: true
    // 限制最大输入长度为5个字符
    maximumLength: 5
    // 设置输入框内文本水平居中对齐
    horizontalAlignment: Text.AlignHCenter

    // 自定义输入框的背景样式
    background: Rectangle{
        // 背景矩形填充整个输入框区域
        anchors.fill:parent
        color: "yellow"
        border.color: "red"
        border.width: 1
        radius: 20
    }
}
```

## Image_qml教程

- 图片用Qt source文件保管，复制路径时记得把最前面的冒号“:”去掉。

```qml
// 定义一个图片组件
Image {
    // 将图片在父容器中居中显示(水平和垂直方向都居中)
    anchors.centerIn: parent
    // 设置图片的路径和文件名(注意复制路径后要把“:”去掉)
    source:"/image/ZhongXue.png"
}
```

## 事件系统_qml教程

- 定义键盘按下事件

```qml
//事件系统
//鼠标事件、键盘事件
Rectangle{
    id:aaa
    width:100
    height:100
    color:"cyan"
    // 设置矩形可以获取焦点，用于接收键盘事件
    focus: true

    // 定义键盘按下事件
    Keys.onPressed: {
        // 当按下的是A键时
        if(event.key === Qt.Key_A){
            console.log("AAAAAAAAAA")
        }
    }
```

- 定义鼠标互动事件。其中使用 var 声明的变量可以存储任意类型的数据（数字、字符串、布尔值、对象、数组等），a为字符串，b为整型。“==”号和“===”号的区别，双等号判断松散，三等号判断严格。

```qml
// 在矩形内部添加一个鼠标交互区域
MouseArea{
    // 鼠标区域填充整个父组件 (即矩形aaa)
    anchors.fill:parent
    // 启用鼠标悬停检测
    hoverEnabled: true

    // 定义鼠标点击事件的处理逻辑
    onClicked: {
        // 声明字符串变量a并赋值为"1"
        var a = "1"
        // 声明数字变量b并赋值为1
        var b = 1

        // 在控制台输出变量a、b的值，
        //以及它们的松散相等 (==)和严格相等 (===)的比较结果
        console.log(a,b,a == b,a === b)

        // 点击时将矩形颜色改为黄色
        aaa.color = "yellow"

    }

    // 鼠标进入矩形区域
    onEntered: {
        aaa.color = "blue"
    }

    // 鼠标离开矩形区域
    onExited: {
        aaa.color = "black"
    }

    // 定义鼠标滚轮事件
    onWheel: {
        // 当滚轮向前滚动时 (y为正值)
        if(wheel.angleDelta.y>0)
        {
            console.log("鼠标向前滑动")
        }
        // 当滚轮向后滚动时 (y为负值)
        if(wheel.angleDelta.y<0)
        {
            console.log("鼠标向后滑动")
        }
    }
```

2025/8/21

## 拖拽事件_qml教程

- 第一个框：在鼠标交互区域添加交互对象，可进行X轴、Y轴拖动交互。
  第二个框：在交互区域添加拖动被释放事件，当取消拖动时ppp的组件会变成白色。

```qml
//  在矩形内部添加一个鼠标交互区域
MouseArea{

    id:area
    drag.target: aaa
    //X轴方向拖动
    //drag.axis: Drag.XAxis
    //Y轴方向拖动
    //drag.axis: Drag.YAxis
    //随意方向拖动
    drag.axis: Drag.XAndYAxis


    //  鼠标区域填充整个父组件(即矩形aaa)
    anchors.fill:parent
    //  启用鼠标悬停检测
    hoverEnabled: true

    //  定义鼠标点击事件的处理逻辑
    onClicked: { ...}

    //  鼠标进入矩形区域
    onEntered: { ...}

    //  鼠标离开矩形区域
    onExited: { ...}

    //  定义鼠标滚轮事件
    onWheel: { ...}
    //拖动元素被释放（完成拖放或取消拖动）时触发
    onReleased: ppp.color = "white"
}
```

> 图注：红框标出两组语句——上方红框为 drag.target 与 drag.axis 的拖动方向配置（含被注释的 Drag.XAxis、Drag.YAxis 写法），下方红框为 onReleased 语句及其触发时机注释。

- DropArea类似MouseArea，用于专门接收拖放区域。在组件内部注意设置拖放激活状态要与鼠标拖动区域进行绑定。

```qml
// 定义一个DropArea组件，用于接收拖放操作
DropArea{
    width: 300
    height: 300
    x:200

    Rectangle{
        id:ppp
        anchors.fill:parent
    }

    // 当拖放操作进入DropArea时触发的事件处理函数
    onEntered: {
        // 当有元素被拖入时，将内部的Rectangle颜色设置为粉色
        ppp.color = "pink"
    }
}
```

```qml
//  将当前元素的拖动激活状态与另一个拖动区域的状态绑定
Drag.active: area.drag.active
```

## Button

- 按钮组件设置。

```qml
//按钮组件，用于创造按钮控件
Button{
    width: 100
    height:50
    text: "按钮"
    anchors.centerIn: parent
    // 设置按钮图标的资源路径
    icon.source: "/image/BaoXue.png"
    //文字在图片下方
    display: AbstractButton.TextUnderIcon
    // 按钮被点击，onClicked = onPressed+onPressAndHold
    onClicked: console.log ("按钮被按下")
    // 按钮点击被取消
    onCanceled: console.log ("按钮被按下取消了")
    // 按钮被按下（尚未释放）
    onPressed: console.log ("按钮按下了  22222222222")
    // 按钮被长按（按下并保持一段时间）
    onPressAndHold: console.log ("按钮松着不动")
}
```

2025/8/23

## DelayButton_qml教程

- 延时按钮组件。

```qml
// 延时按钮组件，按住时会显示进度条动画，使用默认宽高
DelayButton {
    // 设置延时时间为2000毫秒（2秒）
    delay: 2000

    // 进度变化时的回调函数
    onProgressChanged: {
        // 打印当前进度值
        console.log("进度", progress)
    }

    // 延时结束（激活）时的回调函数
    onActivated: {
        // 打印超时信息
        console.log("time out........")
    }
}
```

## Switch_qml教程

- 开关组件。

```qml
//  开关组件
Switch {
    x: 100

    // 当开关位置改变时触发的信号处理函数
    onPositionChanged: {
        // 打印当前位置值（范围通常在0.0到1.0之间，0表示关闭位置，1表示打开位置）
        console.log("position", position)
    }

    // 当开关视觉位置改变时触发的信号处理函数
    onVisualPositionChanged: {
        // 打印当前视觉位置值（考虑动画等视觉效果的位置，可能与实际位置有差异）
        console.log("visualposition", visualPosition)
    }

    // 当开关的选中状态改变时触发的信号处理函数
    onCheckedChanged: {
        // 打印当前选中状态（true表示打开，false表示关闭）
        console.log("check", checked)
    }
}
```

## RadioButton

- 多个单选按钮只能单选，添加按钮组ButtonGroup后可选多个按钮，也可以用Item把按钮放进来合成一个组，但组中的按钮只能单选。

```qml
// 按钮组，用于管理多个单选按钮的状态
ButtonGroup {
    id: group
    // 设置为非独占模式，允许同时选中多个单选按钮
    exclusive: false
}

// 第一个单选按钮
RadioButton {
    y: 100
    // 将此单选按钮加入到上面定义的按钮组中
    ButtonGroup.group: group
    // 选中状态改变时的处理函数
    onCheckedChanged: {
        // 如果被选中则打印"被选中了"，否则打印"取消选中"
        checked ? console.log("被选中了") : console.log("取消选中")
    }
}
```

2025/8/24

## Popup_qml教程

- Popup弹出式组件。

```qml
//Popup:弹出式组件，通常用于实现弹窗、下拉菜单、提示框等交互效果，
//会在特定触发条件（如点击、hover 等）下显示，
//可包含文本、表单、菜单等内容，完成交互后会隐藏。
Popup{
    Popup {
        id:pop
        width:600
        height:300
        // 设置为模态窗口，即弹出时阻止其他交互
        modal: true
        // 设置关闭策略为不自动关闭
        closePolicy:Popup.NoAutoClose
        // 锚布局只能居中布局，不能左对齐右对齐
        anchors.centerIn: parent
        // 定义 Popup 的背景样式
        background: Rectangle {
            anchors.fill:parent
            color: "red"
        }
        // 当 Popup 关闭时触发的事件处理函数
        onClosed: {
            console.log ("close..............")
        }
        // 当 Popup 打开时触发的事件处理函数
        onOpened: {
            console.log ("open..............")
        }
        // 当 Popup 即将隐藏时触发的事件处理函数
        onAboutToHide: {
            console.log ("hide..............")
        }
        // 当 Popup 即将显示时触发的事件处理函数
        onAboutToShow: {
            console.log ("show..............")
        }
    }
```

2025/8/25

## Dialog

- 对话框组件，可添加多种按钮用于实际操作。

```qml
// 定义一个对话框组件
Dialog{
    id: pop

    // 控制对话框的模态性（Qt 5兼容性更好的方式）
    // false表示非模态（允许操作背后窗口），true表示应用级模态（阻塞整个应用）
    modal: false

    // 设置对话框的标题栏文本
    title: "Dialog"

    // 配置对话框底部的标准按钮组合（确定和取消按钮）
    standardButtons: Dialog.Ok|Dialog.Cancel

    // 当用户点击"确定"按钮时触发的信号处理函数
    onAccepted: {
        // 在控制台输出确认信息
        console.log("ok........")
    }

    // 当用户点击"取消"按钮时触发的信号处理函数
    onRejected: {
        // 在控制台输出关闭信息
        console.log("close.......")
    }
    width: 200
    height: 150
}
```

## FileDialog&FolderDialog

- 使用FileDialog（文件对话框）和FolderDialog（文件夹对话框）记得包含相关模块。

```qml
import QtQuick.Dialogs 1.3
import Qt.labs.platform 1.1 as Platform
```

```qml
// 创建一个文件对话框组件，设置id为pop以便引用
Platform.FileDialog{
    id:pop
    // 设置对话框中确认按钮的文本为"asdf"
    acceptLabel: "asdf"
    // 设置对话框中取消按钮的文本为"close"
    rejectLabel: "close"

    // 设置文件对话框的模式为打开多个文件
    fileMode:Platform.FileDialog.OpenFiles

    // 定义对话框被确认（点击确认按钮）时的处理函数
    onAccepted: {
        // 在控制台输出当前选中的文件列表地址
        console.log(currentFiles)
    }
}
```

```qml
// 创建一个文件夹选择对话框组件
Platform.FolderDialog{
    id:pop
    // 定义对话框被用户确认（点击确认按钮）时触发的事件处理函数
    onAccepted: {
        // 在控制台输出用户选择的当前文件夹路径
        console.log(currentFolder)
    }
}
```

## Color&Font&MessageDialog

```qml
// 创建一个颜色选择对话框组件
ColorDialog{
    id:pop
    // 定义对话框被用户确认（点击确认按钮）时触发的事件处理函数
    onAccepted: {
        // 在控制台输出用户选择的当前颜色值
            console.log(currentColor)
    }
}
```

```qml
// 创建一个字体选择对话框组件
FontDialog{
    id:pop
    // 定义对话框被用户确认（点击确认按钮）时触发的事件处理函数
    onAccepted: {
        // 在控制台输出用户选择的字体是否为粗体(bold)以及字体家族(family)信息
        console.log(currentFont.bold,currentFont.family)
    }
}
```

- 使用MessageDialog时要添加和修改相关数据。

![Qt/QML 网易云音乐桌面前端课程学习笔记 配图 30](/posts/qml-course-notes/image30.webp)

```qmake
QT += quick
QT += widgets
```

```cpp
#include <QApplication>  // 改为 QApplication 而非 QGuiApplication
#include <QQmlApplicationEngine>

int main(int argc, char *argv[])
{
    // 使用 QApplication 而非 QGuiApplication
    QApplication app(argc, argv);
```

```qml
// 创建一个平台消息对话框组件
Platform.MessageDialog{
    id:pop
    // 设置对话框显示的按钮，这里同时显示"确定"(Ok)和"取消"(Cancel)按钮
    buttons: MessageDialog.Ok|MessageDialog.Cancel
    // 设置对话框中显示的文本内容
    text:"这是一个对话框"
}
```

2025/8/26

## State&Transition

- state（状态）以及transition（过渡）的使用技巧。

```qml
// 创建一个带鼠标悬停交互的矩形按钮，通过状态(State)和过渡(Transition)
// 实现鼠标进入/离开时的颜色平滑切换和文本变化
Rectangle{
    id:btn
    width:100
    height:40
    color:"red"
    anchors.centerIn:parent
```

```qml
// 定义状态之间切换时的过渡动画集合，控制状态变化的视觉效果
transitions: [
    // 定义过渡：从"normal"状态切换到"hovered"状态时的动画
    Transition {
        // 过渡的起始状态：normal
        from: "normal"
        // 过渡的目标状态：hovered
        to: "hovered"

        // 过渡动画类型：颜色动画，用于实现颜色的平滑渐变
        ColorAnimation {
            // 动画作用的目标组件：btn
            target: btn
            // 动画持续时间：200毫秒（控制颜色变化的快慢）
            duration: 200
        }
    },
    // 定义过渡：从"hovered"状态切换到"normal"状态时的动画
    Transition {
        // 过渡的起始状态：hovered
        from: "hovered"
        // 过渡的目标状态：normal
        to: "normal"

        // 过渡动画类型：颜色动画，实现颜色平滑渐变
        ColorAnimation {
            // 动画作用的目标组件：btn
            target: btn
            // 动画持续时间：200毫秒
            duration: 200
        }
    }
]
```

> 图注：红框圈出 `transitions: [` 一行；两个红色箭头分别指向两个 `Transition {` 过渡定义块（normal→hovered 与 hovered→normal）

```qml
// 定义组件的所有状态集合，每个状态对应不同的属性配置
states: [
    // 定义状态：normal
    State {
        // 状态名称：normal
        name: "normal"
        // 状态对应的属性变化：修改btn组件的属性
        PropertyChanges {
            // 属性变化的目标组件：btn
            target: btn
            // 修改颜色为红色
            color: "red"
        }
        // 状态对应的属性变化：修改txt组件的属性
        PropertyChanges {
            // 属性变化的目标组件：txt
            target: txt
            // 该状态下txt的显示文本："移出去"
            text:"移出去"
        }
    },
    // 定义状态：hovered
    State {
        // 状态名称：hovered
        name: "hovered"
        // 状态对应的属性变化：修改btn组件的属性
        PropertyChanges {
            // 属性变化的目标组件：btn
            target: btn
            // 修改颜色为黄色
            color: "yellow"
        }
        // 状态对应的属性变化：修改txt组件的属性
        PropertyChanges {
            // 属性变化的目标组件：txt
            target: txt
            // 该状态下txt的显示文本："放进来"
            text:"放进来"
        }
    }
]
```

> 图注：红框圈出 `states: [` 一行；两个红色箭头分别指向两个 `State {` 状态定义块（normal 与 hovered）

```qml
Text{
    id:txt
    anchors.centerIn: parent
}
//鼠标交互事件
MouseArea{
    // 设置MouseArea的大小填充整个父组件（Rectangle），确保鼠标在按钮范围内都能被检测
    anchors.fill:parent
    // 启用鼠标悬停检测（默认false，需手动开启才能触发onEntered/onExited事件）
    hoverEnabled: true
    // 鼠标进入MouseArea范围时触发的事件（即鼠标悬停到按钮上）
    onEntered: {
        // 将btn组件的状态切换为"hovered"，触发对应状态和过渡动画
        btn.state = "hovered"
    }
    // 鼠标离开MouseArea范围时触发的事件（即鼠标从按钮上移开）
    onExited: {
        // 将btn组件的状态切换为"normal"，触发对应状态和过渡动画
        btn.state = "normal"
    }
}
```

2025/8/27

## PropertyAnimation_qml教程

- 放在过渡动画中可以实现颜色渐变。

```qml
// 定义过渡： 从"hovered"状态切换到"normal"状态时的动画
Transition {
    // 过渡的起始状态： hovered
    from: "hovered"
    // 过渡的目标状态： normal
    to: "normal"

    // 创建一个属性动画对象
    PropertyAnimation{
        // 动画作用的目标对象，这里是名为btn的按钮
        target: btn
        // 要动画的属性，这里是颜色属性
        property: "color"
        // 动画结束时的目标值，这里是红色
        to:"red"
        // 动画持续时间，单位为毫秒，这里是300毫秒
        duration: 300
    }
}
```
> 图注：红框圈出的是 PropertyAnimation 属性动画对象的创建部分（target、property、to、duration 四个属性）

- 放在父对象中，可用于修改该组件的宽度。

```qml
//  创建一个带鼠标悬停交互的矩形按钮，通过状态(State)和过渡(Transition)
//  实现鼠标进入/离开时的颜色平滑切换和文本变化
Rectangle{
    id:btn
    width:100
    height:40
    color:"red"
    //放在父对象中，直接修改宽度属性到400，用时1000ms
    PropertyAnimation on width{to:400;duration:1000}
```

> 图注：红框圈出最后两行——注释「放在父对象中，直接修改宽度属性到400，用时1000ms」及其下方的 `PropertyAnimation on width{to:400;duration:1000}`

- 也可单独拎出来作用其他对象的参数修改，不过需要单独创建按钮来调用它。

```qml
// 创建一个属性动画对象，并指定唯一标识符为ani1，方便后续通过id调用该动画
PropertyAnimation{
    id:ani1
    // 动画作用的目标对象是名为btn的控件
    target: btn
    // 要进行动画的属性是目标对象的宽度(width)
    property: "width"
    // 动画开始时width的初始值为100（单位通常为像素）
    from:100
    // 动画结束时width的目标值为400（单位通常为像素）
    to:400
    // 设置动画的缓动类型为InQuad（二次方缓入），即动画开始时较慢，逐渐加速
    easing.type:Easing.InQuad
}
```

```qml
Button{
    onClicked: ani1.restart()
}
```

## Behavior_qml教程

- 如果动画需要多次修改，则需要定义多个propertyAnimation，用起来非常麻烦，使用bahavior可进行多次修改，操作便捷。

```qml
Rectangle{
    id:btn
    width: 100
    height:100
    color:"yellow"

    // 为width属性设置行为：当width发生变化时自动应用动画
    Behavior on width{
        // 使用数字动画，设置动画持续时间为1000毫秒（1秒）
        NumberAnimation{duration: 1000}
    }

    // 定义一个鼠标交互区域，覆盖整个矩形
    MouseArea{
        anchors.fill: parent
        // 单击事件处理：将父元素（Rectangle）的宽度设置为400像素
        // 由于有Behavior定义，宽度变化会自动以1秒动画过渡
        onClicked: {
            parent.width = 400
        }
        // 双击事件处理：将父元素（Rectangle）的宽度设置为700像素
        // 同样会触发1秒的宽度过渡动画
        onDoubleClicked: {
            parent.width = 700
        }
    }
}
```

> 图注：红框圈出 `Behavior on width` 代码块；两个红色箭头分别指向 `parent.width = 400` 与 `parent.width = 700` 两行。

## ParallelAnimation&SequentialAnimation

- 并行动画ParallelAnimation。

```qml
// 创建一个并行动画容器，用于同时执行多个动画
ParallelAnimation{
    id:pani   // 定义唯一标识符pani，用于控制这个并行动画（如启动、停止）

    // 第一个属性动画：控制宽度变化
    PropertyAnimation{
        id:ani1   // 动画1的唯一标识
        target: btn   // 作用对象为id是btn的元素
        property: "width"   // 动画属性为宽度
        to:400   // 宽度目标值为400
        duration:1000   // 动画持续1000毫秒（1秒）
    }

    // 第二个属性动画：控制高度变化
    PropertyAnimation{
        id:ani2   // 动画2的唯一标识
        target: btn   // 同样作用于btn元素
        property: "height"   // 动画属性为高度
        to:400   // 高度目标值为400
        duration:1000   // 动画持续1秒
    }

    // 第三个属性动画：控制颜色变化
    PropertyAnimation{
        id:ani3   // 动画3的唯一标识
        target: btn   // 作用于btn元素
        property: "color"   // 动画属性为颜色
        to:"red"   // 目标颜色为红色
        duration:1000   // 动画持续1秒
    }
}
```

> 图注：红色手绘下划线划在首行注释「// 创建一个并行动画容器，用于同时执行多个动画」下方

- 串行动画SequentialAnimation。

```qml
// 创建一个序列动画容器，用于按顺序执行多个动画
SequentialAnimation{
    id:sani
    // 第一个属性动画：控制宽度变化
    PropertyAnimation{
        id:ani1  // 动画1的唯一标识
        target: btn  // 作用对象为id是btn的元素
        property: "width"  // 动画属性为宽度
        to:400  // 宽度目标值为400
        duration:1000  // 动画持续1000毫秒（1秒）
    }

    // 第二个属性动画：控制高度变化
    PropertyAnimation{
        id:ani2  // 动画2的唯一标识
        target: btn  // 同样作用于btn元素
        property: "height"  // 动画属性为高度
        to:400  // 高度目标值为400
        duration:1000  // 动画持续1秒
    }

    // 第三个属性动画：控制颜色变化
    PropertyAnimation{
        id:ani3  // 动画3的唯一标识
        target: btn  // 作用于btn元素
        property: "color"  // 动画属性为颜色
        to:"red"  // 目标颜色为红色
        duration:1000  // 动画持续1秒
    }
}
```

> 图注：红色下划线指向首行注释「创建一个序列动画容器，用于按顺序执行多个动画」

- 脚本动画，一般用于业务当中。

```qml
// 定义一个脚本动作，用于在动画序列中执行自定义脚本代码
ScriptAction{
    // 脚本内容：当该动作被触发时执行的代码块
    script: {
        // 在控制台输出一条信息，提示串行动画已经结束
        console.log("串行动画结束了!")
    }
}
```

2025/8/28

## 线性-锥型-辐射渐变_qml教程

- 渐变，默认垂直渐变。

```qml
Rectangle{
    id:btn
    width: 400
    height:400
    anchors.centerIn: parent
    // 为矩形设置渐变填充
    gradient: Gradient{
        // 设置渐变方向为水平方向（从左到右）
        orientation:  Gradient.Horizontal
        // 渐变停止点1：位置0.0（最左侧），颜色为红色
        GradientStop { position: 0.0; color: "red" }
        // 渐变停止点2：位置0.33（左侧1/3处），颜色为黄色
        GradientStop { position: 0.33; color: "yellow" }
        // 渐变停止点3：位置0.60（左侧3/5处），颜色为绿色
        GradientStop { position: 0.60; color: "green" }
        // 渐变停止点4：位置0.83（左侧约5/6处），颜色为粉色
        GradientStop { position: 0.83; color: "pink" }
        // 渐变停止点5：位置1.0（最右侧），颜色为青色
        GradientStop { position: 1.0; color: "cyan" }
    }
}
```

- 线性渐变。

```qml
// 定义线性渐变
LinearGradient{
    // 渐变填充范围与id为btn的元素相同
    anchors.fill: btn
    // 渐变起始点：坐标(0,0)，即元素的左上角
    start: Qt.point(0,0)
    // 渐变结束点：坐标(400,400)，即元素的右下角
    end: Qt.point(400,400)
    gradient:  Gradient {
        GradientStop {
           position: 0.000
           color: Qt.rgba(1, 0, 0, 1)
        }
        GradientStop {
           position: 0.167
           color: Qt.rgba(1, 1, 0, 1)
        }
        GradientStop {
           position: 0.333
           color: Qt.rgba(0, 1, 0, 1)
        }
        GradientStop {
           position: 0.500
           color: Qt.rgba(0, 1, 1, 1)
        }
        GradientStop {
           position: 0.667
           color: Qt.rgba(0, 0, 1, 1)
        }
        GradientStop {
           position: 0.833
           color: Qt.rgba(1, 0, 1, 1)
        }
        GradientStop {
           position: 1.000
           color: Qt.rgba(1, 0, 0, 1)
        }
```

![Qt/QML 网易云音乐桌面前端课程学习笔记 配图 48](/posts/qml-course-notes/image48.webp)

- 锥形渐变。

```qml
// 定义一个锥形渐变效果
ConicalGradient{
    // 渐变填充范围与id为btn的元素相同
    anchors.fill: btn
    // 设置锥形渐变的起始角度为45度
    // 角度以顺时针方向计算，0度从右侧开始，45度指向右下方
    angle:45
    gradient: Gradient {
        GradientStop {
            position: 0.000
            color: Qt.rgba(1, 0, 0, 1)
        }
        GradientStop {
            position: 0.167
            color: Qt.rgba(1, 1, 0, 1)
        }
        GradientStop {
            position: 0.333
            color: Qt.rgba(0, 1, 0, 1)
        }
        GradientStop {
            position: 0.500
            color: Qt.rgba(0, 1, 1, 1)
        }
        GradientStop {
            position: 0.667
            color: Qt.rgba(0, 0, 1, 1)
        }
        GradientStop {
            position: 0.833
            color: Qt.rgba(1, 0, 1, 1)
        }
        GradientStop {
            position: 1.000
            color: Qt.rgba(1, 0, 0, 1)
        }
    }
}
```

![Qt/QML 网易云音乐桌面前端课程学习笔记 配图 50](/posts/qml-course-notes/image50.webp)

- 径向渐变。

```qml
// 定义一个径向渐变效果
RadialGradient{
    // 渐变填充范围与id为btn的元素相同
    anchors.fill: btn
    // 设置渐变的角度为45度（影响渐变的椭圆方向）
    angle:45
    // 设置水平半径为100像素（决定渐变在水平方向的扩散范围）
    horizontalRadius: 100
    // 设置垂直半径为200像素（决定渐变在垂直方向的扩散范围）
    verticalRadius: 200
    gradient:  Gradient {
        GradientStop {
            position: 0.0
            color: "#F0F0F0"
        }
        GradientStop {
            position: 0.5
            color: "#000000"
        }
        GradientStop {
            position: 1.0
            color: "#F0F0F0"
        }
    }
}
```

![Qt/QML 网易云音乐桌面前端课程学习笔记 配图 52](/posts/qml-course-notes/image52.webp)

## BrightnessContrast_qml教程

- 使用BrightnessContrast组件对图像进行实时处理。

```qml
// 定义亮度和对比度调整组件
// 用于对源图像进行亮度和对比度的调节
BrightnessContrast{
    id:bc
    anchors.fill: item
    // 设置调整的源图像为id为img1的图像元素
    source: img1
    // 设置初始亮度值为0.5（取值范围通常为0.0到1.0）
    brightness: 0.5
    // 设置初始对比度值为0.5（取值范围通常为0.0到1.0）
    contrast: 0.5
}
```

```qml
Item {
    id: item
    width:400
    height:400
    anchors.centerIn: parent
}

Image {
    id: img1
    //缩放比例为0.1
    scale: 0.1
    anchors.fill:parent
    source: "/image/WanJianShaoYun.png"
}
```

- 创建滑块控制图像亮度。

```qml
Text{
    text:" 亮度"
    color:"red"
    anchors.right: sliderbrightness.left
    // 使文本在垂直方向上与id为slider的元素居中对齐
    anchors.verticalCenter: sliderbrightness.verticalCenter
}

// 定义一个滑动条控件
Slider{
    id:sliderbrightness
    // 使滑动条在水平方向上相对于父元素居中
    anchors.horizontalCenter: parent.horizontalCenter
    width:400
    height:30
    // 设置滑动条的最小值为0
    from:0
    // 设置滑动条的最大值为1
    to:1
    // 当滑动条的值发生变化时触发的事件处理函数
    onValueChanged: {
        // 将滑动条的当前值赋给id为bc的元素的brightness属性
        bc.brightness = value
    }
}
```

- 创建滑块控制图片饱和度。

```qml
Text{
    text:" 饱和度"
    color:"red"
    anchors.right: slidercontrast.left
    // 使文本在垂直方向上与id为slider的元素居中对齐
    anchors.verticalCenter: slidercontrast.verticalCenter
}

// 定义一个滑动条控件
Slider{
    id:slidercontrast
    // 使滑动条在水平方向上相对于父元素居中
    anchors.horizontalCenter: parent.horizontalCenter
    // 左边缘与左边缘对齐
    anchors.left: sliderbrightness.left
    // 顶部与底部对齐
    anchors.top: sliderbrightness.bottom
    // 上下之间间距为10像素
    anchors.topMargin: 10
    width:400
    height:30
    // 设置滑动条的最小值为0
    from:0
    // 设置滑动条的最大值为1
    to:1
    // 当滑动条的值发生变化时触发的事件处理函数
    onValueChanged: {
        // 将滑动条的当前值赋给id为bc的元素的contrast属性
        bc.contrast = value
    }
}
```

## qml教程__HSL色彩空间调整

- HSL（色调、饱和度、亮度）的应用，其中只展示亮度的滑动控件使用。

```qml
// 着色器组件，用于通过HSL颜色空间调整图像颜色
Colorize{
    id:colorize
    anchors.fill:item
    // 着色器的输入源，这里关联到名为img1的图像组件
    source:img1
    // HSL颜色空间的色相参数，范围通常为0.0-1.0，控制颜色的基本色调
    hue:0.0
    // HSL颜色空间的饱和度参数，范围0.0-1.0，控制颜色的鲜艳程度
    saturation: 0.0
    // HSL颜色空间的明度参数，范围-1.0-1.0，控制颜色的明暗程度
    lightness: 0.0
}
```

```qml
// 定义一个滑动条控件
Slider{
    id:slider3
    anchors.horizontalCenter: parent.horizontalCenter
    anchors.left: sliderbrightness.left
    anchors.top: slidercontrast.bottom
    anchors.topMargin: 10
    width:400
    height:30
    from:-1
    to:1
    onValueChanged: {
        // 将滑动条的当前值赋给colorize组件的lightness(明度)属性，实现明度调节
        colorize.lightness = value
    }
}
```

- 单独控制饱和度。

![Qt/QML 网易云音乐桌面前端课程学习笔记 配图 59](/posts/qml-course-notes/image59.webp)

- 伽马矫正组件。

```qml
// 伽马校正组件，用于调整图像的伽马值，修正图像亮度
GammaAdjust{
    id:gammaAdjust
    anchors.fill:item
    source:img1
    // 伽马值参数，用于调整图像的亮度曲线，0为默认值
    gamma: 0
}
```

- 色相饱和度调整组件，使用方法类似着色器组件。

```qml
// 色相饱和度调整组件，用于独立调整图像的色相、饱和度和明度
HueSaturation{
    id:hueSaturation
    anchors.fill:item
    source:img1
    hue:-0.3
    saturation: -0.3
    lightness: -0.4
}
```

## qml教程_-Blur

- 多种方式进行图片模糊处理。

```qml
Image {
    id: img1
    source: "/image/WanJianShaoYun.png"
}

Image {
    id: img2
    anchors.left: img1.right
    source: "/image/WanJianShaoYun.png"
}

Image {
    id: img3
    anchors.left: img2.right
    source: "/image/WanJianShaoYun.png"
}

Image {
    id: img4
    anchors.left: img3.right
    source: "/image/WanJianShaoYun.png"
}
```

```qml
Image {
    id: img5
    anchors.left: img1.left
    anchors.top: img1.bottom
    source: "/image/WanJianShaoYun.png"
}

Image {
    id: img6
    anchors.left: img2.left
    anchors.top: img2.bottom
    source: "/image/WanJianShaoYun.png"
}

Image {
    id: img7
    anchors.left: img3.left
    anchors.top: img3.bottom
    source: "/image/WanJianShaoYun.png"
}

Image {
    id: img8
    anchors.left: img4.left
    anchors.top: img4.bottom
    source: "/image/WanJianShaoYun.png"
}
```

```qml
// 创建一个快速模糊效果组件
FastBlur{
    // 将模糊效果的大小和位置与img2保持一致，完全覆盖img2
    anchors.fill:img2
    // 设置模糊效果的源图像为img2，即对img2进行模糊处理
    source:img2
    // 设置模糊半径为32，控制模糊程度，值越大模糊效果越明显
    radius: 32
}

// 创建一个高斯模糊效果组件
GaussianBlur{
    anchors.fill:img3
    source:img3
    // 设置模糊半径为32，控制高斯模糊的程度
    radius: 32
}

// 创建一个递归模糊效果组件
RecursiveBlur{
    anchors.fill:img4
    source:img4
    radius: 10
    // 设置递归次数为10，通过多次迭代模糊实现更强烈的效果
    loops:10
}
```

```qml
// 创建一个线性渐变对象，作为遮罩使用
LinearGradient{
    id:mask
    anchors.fill:img5
    // 设置渐变的起始点为左上角(0,0)
    start: Qt.point(0,0)
    // 设置渐变的结束点为右下角(100,100)
    end: Qt.point(100,100)
    // 定义渐变的颜色变化
    gradient: Gradient{
        // 渐变起始位置(0.0表示最开始)的颜色，#00000000是完全透明的黑色
        GradientStop { position: 0.0; color: "#00000000" }
        // 渐变结束位置(1.0表示最末端)的颜色，#ff000000是完全不透明的黑色
        GradientStop { position: 1.0; color: "#ff000000" }
    }
}

// 创建一个带遮罩的模糊效果组件
MaskedBlur{
    anchors.fill: img5
    // 设置模糊效果的源图像为img5，即对img5进行模糊处理
    source: img5
    // 设置模糊半径为32，值越大模糊效果越明显
    radius: 32
    // 设置遮罩源为前面定义的线性渐变对象mask，实现渐变遮罩效果
    maskSource: mask
}
```

```qml
// 创建一个方向性模糊效果组件
DirectionalBlur{
    anchors.fill:img6
    source:img6
    // 设置模糊的长度为32，控制模糊的强度
    length:32
    // 设置采样数量为32，影响模糊效果的平滑度，值越高效果越平滑但性能消耗更大
    samples: 32
    // 设置模糊的方向角度为45度，使模糊效果沿45度方向扩散
    angle:45
}

// 创建一个径向模糊效果组件（放射状模糊）
RadialBlur{
    anchors.fill:img7
    source:img7
    // 设置采样数量为32，影响模糊效果的平滑度
    samples: 32
    // 设置模糊的角度为45度，控制径向模糊的旋转强度
    angle:45
}

// 创建一个缩放模糊效果组件（类似缩放时的动态模糊）
ZoomBlur{
    anchors.fill:img8
    source:img8
    // 设置模糊的长度为32，控制缩放模糊的强度
    length:32
    // 设置采样数量为32，影响模糊效果的平滑度
    samples: 32
}
```

![Qt/QML 网易云音乐桌面前端课程学习笔记 配图 67](/posts/qml-course-notes/image67.webp)

其中1-7对应2-8的imge图片模糊。

![Qt/QML 网易云音乐桌面前端课程学习笔记 配图 68](/posts/qml-course-notes/image68.webp)

2025/8/29

## qml教程_-Blend&ColorOverlay

- 图叠加和混合。

```qml
// 创建一个颜色叠加层组件
ColorOverlay{
    anchors.fill: img1
    // 设置叠加层的源图像为img1
    source:img1
    // 设置叠加层颜色为半透明红色（#50表示透明度，Ff0000表示红色）
    color: "#50Ff0000"
}
```

```qml
// 创建一个混合效果组件，用于将两个图像进行混合处理
Blend{
    anchors.fill:item
    // 指定混合效果的背景源图像为img1
    source:img1
    // 指定混合效果的前景源图像为img2
    foregroundSource: img2
    // 设置混合模式为"average"，即对两个图像的对应像素取平均值进行混合
    mode:"average"
}
```

## qml教程__DropShadow&InnerShadow

- 投影。

```qml
// 定义一个投影效果组件
DropShadow{
    // 设置投影效果的范围与矩形rect完全一致
    anchors.fill:rect
    // 指定投影的来源对象为矩形rect
    source:rect
    // 设置投影在水平方向上的偏移量为10像素（向右方向）
    horizontalOffset:10
    // 设置投影在垂直方向上的偏移量为10像素（向下方向）
    verticalOffset:10
    // 设置投影的模糊半径为10像素，值越大投影越模糊
    radius:10
    // 设置投影的采样数量，这里设为半径的2倍，用于控制模糊质量
    samples: radius*2
    // 设置投影的边界为透明，避免出现生硬的边缘
    transparentBorder: true
}
```

![Qt/QML 网易云音乐桌面前端课程学习笔记 配图 72](/posts/qml-course-notes/image72.webp)

- 内阴影。

```qml
// 定义一个内阴影效果组件
InnerShadow{
    // 设置内阴影效果的范围与矩形rect完全一致
    anchors.fill:rect
    // 指定内阴影的来源对象为矩形rect
    source:rect
    // 设置内阴影在水平方向上的偏移量为-10像素（向左方向）
    horizontalOffset:-10
    // 设置内阴影在垂直方向上的偏移量为-10像素（向上方向）
    verticalOffset:-10
    // 设置内阴影的模糊半径为10像素，值越大阴影越模糊
    radius:10
    // 设置内阴影的采样数量，这里设为半径的2倍，用于控制模糊质量
    samples: radius*2
}
```

![Qt/QML 网易云音乐桌面前端课程学习笔记 配图 74](/posts/qml-course-notes/image74.webp)

## Glow&RectangleGlow

- 发光。

```qml
// 创建一个发光效果组件
Glow{
    anchors.fill:rect
    source:rect
    color:"green"
    // 设置发光的模糊半径为10像素，值越大发光效果越扩散
    radius:10
    // 设置发光效果的采样数量，这里设为半径的2倍，用于控制发光质量
    samples: radius*2
}

// 创建一个矩形发光效果组件（更适合矩形对象的发光效果）
RectangularGlow{
    anchors.fill: rect
    color: "red"
    // 设置发光的半径为10像素，控制发光扩散程度
    glowRadius: 10
    // 计算并设置发光效果的圆角半径
    // 取矩形宽高的最小值的一半加上发光半径，使发光圆角与源矩形匹配
    cornerRadius: Math.min(rect.width,rect.height)/2+glowRadius
}
```

![Qt/QML 网易云音乐桌面前端课程学习笔记 配图 76](/posts/qml-course-notes/image76.webp)

2025/8/31

## qml教程__ListView

- Ctrl+Shift+up：选中文本向上移动。

```qml
Rectangle{
    id:leftRect
    anchors.left: parent.left
    anchors.top:parent.top
    anchors.bottom: parent.bottom
    width: parent.width/2-5
}
Rectangle{
    id:rightRect
    anchors.right: parent.right
    anchors.top:parent.top
    anchors.bottom: parent.bottom
    width: parent.width/2-5
}
Text {
    anchors.centerIn: parent
    font.pixelSize: 30
    text: name+"-"+age
}
```

```qml
Rectangle{
    id:leftRect
    anchors.left: parent.left
    anchors.top:parent.top
    anchors.bottom: parent.bottom
    width: parent.width/2-5
}
Text {
    anchors.centerIn: parent
    font.pixelSize: 30
    text: name+"-"+age
}
Rectangle{
    id:rightRect
    anchors.right: parent.right
    anchors.top:parent.top
    anchors.bottom: parent.bottom
    width: parent.width/2-5
}
```

- 详细请浏览相关代码：D:\Mycode\Qtcode\Music。

2025/9/1

## qml教程_-布局系统

- row行布局和column列布局。

```qml
//行布局
Row{
    //间隔为10
    spacing:10
    anchors.centerIn: parent
    //从右到左布局
    layoutDirection: "RightToLeft"
    //向下偏移100
    topPadding: 100
    Rectangle{
        id:rect1
        width:100
        height:100
        color:"red"
    }
    Rectangle{
        id:rect2
        width:100
        height:100
        color:"green"
    }
    Rectangle{
        id:rect3
        width:100
        height:100
        color:"pink"
    }
}
```

```qml
//列布局
Column{
    //间隔为10
    spacing:10
    anchors.centerIn: parent
    Rectangle{
        id:rect1
        width:100
        height:100
        color:"red"
    }
    Rectangle{
        id:rect2
        width:100
        height:100
        color:"green"
    }
    Rectangle{
        id:rect3
        width:100
        height:100
        color:"pink"
    }
}
```

- 网格布局。

```qml
//网格布局
Grid{
    //间隔为10
    spacing:10
    columns: 2
    //从上往下布局（默认从左往右）
    flow: Grid.TopToBottom
    anchors.centerIn: parent
    Rectangle{ id: rect1...}
    Rectangle{ id: rect2...}
    Rectangle{ id: rect3...}
    Rectangle{ id: rect4...}
}
```

- rowlayout和column。

```qml
//行布局（row：绝对布局。rowlayout：相对布局，可随窗口缩放）
RowLayout{
    //间隔为10
    spacing:10
    anchors.centerIn: parent
    Rectangle{ id: rect1...}
    Rectangle{ id: rect2...}
    Rectangle{
        id:rect3
        width:100
        height:100
        color:"pink"
        //控件最小高度设置为50
        Layout.minimumHeight: 50
        //控件最小宽度设置为50
        Layout.minimumWidth: 50
        //始终填满layout的高度
        Layout.fillHeight: true
        //始终平分layout的宽度
        Layout.fillWidth: true
    }
    Rectangle{ id: rect4...}
}
```

```qml
//列布局（column：绝对布局。columnlayout：相对布局，可随窗口缩放）
ColumnLayout{
    //间隔为10
    spacing:10
    anchors.centerIn: parent
    Rectangle{ id: rect1...}
    Rectangle{ id: rect2...}
    Rectangle{
        id:rect3
        width:100
        height:100
        color:"pink"
        //控件最小高度设置为50
        Layout.minimumHeight: 50
        //控件最小宽度设置为50
        Layout.minimumWidth: 50
        //始终填满layout的高度
        Layout.fillHeight: true
        //始终平分layout的宽度
        Layout.fillWidth: true
    }
    Rectangle{ id: rect4...}
}
```

- gridlayout。

```qml
//网格布局（grid：绝对布局。gridlayout：相对布局，可随窗口缩放）
GridLayout{
    //间隔为10
    rowSpacing:10
    columnSpacing: 20
    columns: 2
    //anchors.centerIn: parent
    anchors.fill:parent
    Rectangle{
        id:rect1
        width:100
        height:100
        color:"red"
        //网格布局内单个控件中心对齐且上对齐
        Layout.alignment: Qt.AlignHCenter|Qt.AlignTop
        Layout.minimumHeight: 50
        Layout.minimumWidth: 50
        Layout.fillHeight: true
        Layout.fillWidth: true
    }
    Rectangle{ id: rect2...}
    Rectangle{ id: rect3...}
    Rectangle{ id: rect4...}
}
```

## qml教程_-自定义组件

- 添加自定义组件。

![Qt/QML 网易云音乐桌面前端课程学习笔记 配图 85](/posts/qml-course-notes/image85.webp)

![Qt/QML 网易云音乐桌面前端课程学习笔记 配图 86](/posts/qml-course-notes/image86.webp)

![Qt/QML 网易云音乐桌面前端课程学习笔记 配图 87](/posts/qml-course-notes/image87.webp)

```qml
import QtQuick 2.15
import QtQuick.Controls 2.15
//按钮-矩形-带10px圆角-鼠标移入是red移出是green
Button{
    width: 100
    height: 100
    background:Rectangle{
        width: 100
        height: 100
        color: "green"
        radius: 10
        MouseArea{
            anchors.fill: parent
            hoverEnabled: true
            onEntered: {
                parent.color = "red"
            }
            onExited: {
                parent.color = "green"
            }
            onClicked: {
            console.log("asjkdfhajklsdfl;asdfklj")
            }
        }
    }
}
```
> 图注：红字“注意导入模块”的箭头指向第 2 行的 import 语句；红字“删掉自带的item，直接复制粘贴写好的控件”的箭头指向编辑器中的控件代码（MyButton.qml，整段代码被红框圈出）

设置好后在主函数可直接调用（注意qml文件当中文件名首字母大写）。

```qml
    MyButton{
        height: 100
        width:40
    }
}
```

- 添加新文件夹里的qml文件如何引用。可通过improt它的地址进行关联。

```qml
import QtQuick 2.14
import QtQuick.Window 2.14
import QtQuick.Controls 2.14
import "./controls"

Window {
    visible: true
    width: 640
    height: 480
    title: qsTr("Hello World")

    MyButton{
        height: 40
        width:100
        background:MyRect{}
    }
}
```

> 图注：红框圈出第 4 行 `import "./controls"`；红色箭头指向第 15 行 `background:MyRect{}` 中的 `MyRect{}`。

## C++访问qml控件

```cpp
//  获取QML引擎中的根对象列表，并取第一个根对象
//  根对象通常是QML中最顶层的元素（如Window）
QObject* obj = engine.rootObjects().first();

//  通过QQmlProperty修改根对象的"title"属性值为"hello world"
//  对应QML中Window的title属性
QQmlProperty(obj,"title").write("hello world");

//  修改根对象的"width"属性为800
//  对应QML中元素的宽度属性
QQmlProperty(obj,"width").write(800);

//  输出根对象列表的大小和第一个根对象的地址
//  用于调试，确认是否成功获取到根对象
qDebug()<<"list size is:"<<engine.rootObjects().size()<<obj;
```

- qml触发信号如何连接到C++的槽，在C++当中实现信号与槽，构建类必须要继承QObject。

![Qt/QML 网易云音乐桌面前端课程学习笔记 配图 92](/posts/qml-course-notes/image92.webp)

- C++访问qml控件以及qml的信号与C++的槽的连接。

```cpp
// 创建TestQmlSignal类的实例，用于接收QML发送的信号
TestQmlSignal* test = new TestQmlSignal;
// 获取QML引擎中的第一个根对象（通常是QML中的顶层窗口元素，如Window）
QObject* obj = engine.rootObjects().first();
// 通过QQmlProperty修改QML根对象的"title"属性，设置窗口标题为"hello world"
QQmlProperty(obj, "title").write("hello world");
// 在QML根对象的子元素中查找objectName或id为"rect"的元素（通常是Rectangle等可视组件）
QObject* rect = obj->findChild<QObject*>("rect");
// 修改查找到的"rect"元素的"color"属性，将其颜色设置为黄色
QQmlProperty(rect, "color").write("yellow");
// 定义一个QVariant变量，用于存储调用QML函数后的返回值
QVariant ret;
// 调用QML根对象中名为"testArg"的函数，传递字符串参数"dddd"
// 并通过Q_RETURN_ARG获取函数的返回值，存储到ret变量中
QMetaObject::invokeMethod(obj, "testArg",
                          Q_RETURN_ARG(QVariant, ret),
                          Q_ARG(QVariant, "dddd"));
// 连接QML根对象的"sig"信号到TestQmlSignal实例的"print"槽函数
// 当QML中发射sig信号时，会触发test对象的print()函数执行
QObject::connect(obj, SIGNAL(sig()), test, SLOT(print()));
// 调用QML根对象中名为"sig"的信号（或触发该信号的函数），用于测试信号槽连接是否生效
QMetaObject::invokeMethod(obj, "sig");
// 输出调用testArg函数后得到的返回值，用于调试查看结果
qDebug() << ret;
```

```cpp
#include <QObject>

class TestQmlSignal : publ // [此处模糊：行尾被截图右边缘截断]
{
    Q_OBJECT
public:
    explicit TestQmlSignal // [此处模糊：行尾被截图右边缘截断]

signals:

public slots:
    void print();
};
```
> 图注：红色手写文字「定义槽函数」与红色矩形框共同指向第 14–16 行的 public slots 部分（槽函数 print() 的定义）。
> 有 2 处无法确认

```cpp
}

void TestQmlSignal::print()
{
    qDebug()<<"hello C++";
}
```

> 图注：红色批注「槽函数」指向 void TestQmlSignal::print() 函数定义，说明该函数是槽函数

```qml
Window {
    visible: true
    width: 640
    height: 480
    title: qsTr("Hello World")

    signal sig()
    onSig: {
        console.log("sig is triggered")
    }

    function testArg(arg){
        console.log("the arg is",arg)
        return "recieved"
    }
    Rectangle{
        objectName: "rect"
        width:100
        height: 100
        color: "red"
        anchors.centerIn: parent
    }
}
```

> 图注：红色手写字「信号」的箭头指向第 10–13 行红框内的 signal sig() 与 onSig 信号处理块；红色手写字「函数」的箭头指向第 15–18 行红框内的 function testArg(arg) 函数定义块

注意头文件包含

```cpp
#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlProperty>
#include <QDebug>
#include "testqmlsignal.h"
```

## Qml访问C++类成员属性和方法

- C++的类的数据通过注册添加qml间接访问。

```cpp
    void pro1Changed();
    void pro2Changed();

public slots:
    void print();

private:
    int pro1 = 89;
    int pro2 = 40;
};

#endif // TESTQMLSIGNAL_H
```

> 图注：红色手写批注「alt+enter后选第一个，后面代码交给AI补齐」，红箭头指向被红框圈出的 private 块（private: 及其内两行成员定义 int pro1 = 89; 与 int pro2 = 40;）

![Qt/QML 网易云音乐桌面前端课程学习笔记 配图 99](/posts/qml-course-notes/image99.jpeg)

```cpp
                 &app, [url](QObject *obj, const QUrl &objUrl) {
    if (!obj && url == objUrl)
        QCoreApplication::exit(-1);
}, Qt::QueuedConnection);
// 将C++类TestQmlSignal注册到QML环境中，使其可以在QML中像使用
// 函数原型：qmlRegisterType<类名>(模块名，主版本号，次版本号，QML中使用的类型名)
qmlRegisterType<TestQmlSignal>(
    "TestQmlSignal",  // QML中导入时使用的模块名（需与QML中的import语句匹配）
    1,               // 主版本号（通常用于不兼容的API变更）
    0,               // 次版本号（通常用于兼容的功能新增）
    "TestQmlSignal"   // 在QML中使用的类型名称（类似QML内置类型如Rectangle）
);
engine.load(url);

// 创建TestQmlSignal类的实例，用于接收QML发送的信号
TestQmlSignal* test = new TestQmlSignal;
// 获取QML引擎中的第一个根对象（通常是QML中的顶层窗口元素，如Window）
```

> 图注：红箭头指向 engine.load(url); 一行，批注文字：引擎在这行已经运行完毕，所以必须注册在这行之前

```qml
import QtQuick 2.14
import QtQuick.Window 2.14
import TestQmlSignal 1.0

Window {
    visible: true
    // [此处模糊：截图底边截断的一行，仅见字符顶部笔画]
```
> 图注：红框圈出 `import TestQmlSignal 1.0` 一行，旁边红色手写批注「记得添加模块」

> 有 1 处无法确认

```qml
Rectangle{
    objectName: "rect"
    width:100
    height: 100
    color: "red"
    anchors.centerIn: parent
    Text {
        text: test.pro1

    }
}
TestQmlSignal{
    id:test
}
```

> 图注：红字「就可以直接使用了」注在 Text 块闭合花括号旁；两个红框分别框住 `text: test.pro1` 一行与底部的 `TestQmlSignal{ id:test }` 块，表示 TestQmlSignal 以 id: test 声明后，其属性 pro1 在 Text 中可直接写作 test.pro1 使用。

- C++的数据qml直接访问。

```cpp
//  向QML引擎的根上下文注册一个全局属性，使得该属性可以在所有QML文件中直接访问
//  函数原型：void QQmlContext::setContextProperty(const QString &name, const QVariant &value)
//qml中可直接通过text: globalProperty来访问
engine.rootContext()->setContextProperty(
    "globalProperty",  // 在QML中访问该属性时使用的名称
    "afgsdfgasdf"      // 属性的值（这里是一个字符串，也可以是QObject指针、数字等QVariant支持的类型）
);
```

2025/9/2

## WorkerScript_qml也能多线程异步处理数据

- 单独写一个js文件。

![Qt/QML 网易云音乐桌面前端课程学习笔记 配图 104](/posts/qml-course-notes/image104.webp)

![Qt/QML 网易云音乐桌面前端课程学习笔记 配图 105](/posts/qml-course-notes/image105.webp)

## 项目制作笔记

- 封装

![Qt/QML 网易云音乐桌面前端课程学习笔记 配图 106](/posts/qml-course-notes/image106.webp)

- width和impliciwidth的区别，一般引用其他控件的宽度时使用后者。

![Qt/QML 网易云音乐桌面前端课程学习笔记 配图 107](/posts/qml-course-notes/image107.webp)

- 子控件是可以访问到父控件以及父控件的兄弟控件。
