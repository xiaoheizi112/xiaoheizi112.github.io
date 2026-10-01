+++
title = '天野学院第六期模拟班课程学后总结'
date = '2026-10-01'
tags = ['易语言']
draft = false
+++

图片顺序一般为：窗口界面\-\>界面设置（属性）\-\>代码\-\>其他

函数介绍一般为：函数接口名\-\>函数作用

功能介绍一般为：功能名\-\>实现功能的（函数使用以及）代码组成

# 1、2课：

## 1\.窗口的两种启动方法：

一种默认启动；另一种在配置当中更改选项为“启动子程序”，之后在程序当中通过加载来实现窗口的启动。

![image\.png](/posts/tianye-academy-summary/image_85.png)

## 2\.基础控件：

### 编辑框：

想写入文本直接通过赋值到内容即可，但是重复赋值会覆盖掉上一次的内容；或者通过写入文本直接在后面添加文本，它是以追加的方式加入不会覆盖之前的内容；通过背景颜色属性更改背景颜色，记得在颜色常量前加\#号。

![image\.png](/posts/tianye-academy-summary/image_57.png)

![image\.png](/posts/tianye-academy-summary/image_47.png)

### 选择框（多选框）：

通过点击按钮用如果真来判断哪些选项是被选中的；在选择框的单击事件里设置选项的选中为假，那么会造成这个选项选择不了。

![image\.png](/posts/tianye-academy-summary/image_8.png)

![image\.png](/posts/tianye-academy-summary/image_6.png)

### 单选框：

作用跟选择框差不多，但只能单选（图中额外添加了分组框）。

![image\.png](/posts/tianye-academy-summary/image_16.png)

![image\.png](/posts/tianye-academy-summary/image_36.png)

### 组合框：

可以通过右键添加组合框里的内容；通过属性设置内容只读和显示哪一行的内容（现行选中行）；需要关联两个组合框时（例如选择大区后自动弹出该区的哪些服务器）中，在前一个组合框列表项被选择事件里通过如果真判断选择哪一个大区，如果为真，则在后面一个组合框通过加入项目的方式来添加该区服务器。

![image\.png](/posts/tianye-academy-summary/image_13.png)

![image\.png](/posts/tianye-academy-summary/image_17.png)

### 标签：

显示文字或者坐标，如果要显示实时坐标，需要搭配时钟来使用，注意要设置时钟周期。

### 时钟：

在周期事件里间隔性更新标签的内容就可实现实时鼠标坐标位置。

![image\.png](/posts/tianye-academy-summary/image_49.png)

![image\.png](/posts/tianye-academy-summary/image_80.png)

### 透明标签：

在窗口加入背景颜色的情况下，普通标签会多出来阴影，而透明标签不会。

![image\.png](/posts/tianye-academy-summary/image_7.png)

### 分组框：

就是把一些控件给隔开（例如可以设置多个单选框区域）。

![image\.png](/posts/tianye-academy-summary/image_3.png)

### 外形框：

一般用于设置分割线，也就是把属性的高度设为1，然后拉的很长，只用于分割。

![image\.png](/posts/tianye-academy-summary/image_59.png)

### 图片框：

有两种设置图片的方式：一种直接在属性里更换图片并且设置它的显示方式（例如缩放图片，一般用于图片太大或者太小的情况下使用）；另一种则是通过点击按钮给图片框的图片用读入文件的形式（图片绝对路径\+图片名\+后缀名）进行赋值。

![image\.png](/posts/tianye-academy-summary/image_61.png)

![image\.png](/posts/tianye-academy-summary/image_39.png)

# 3、4课：

## 1\.基础控件：

### 列表框：

添加待选任务选中项到已选任务当中。（框1：待选任务，框2：已选任务）

![image\.png](/posts/tianye-academy-summary/image_20.png)

![image\.png](/posts/tianye-academy-summary/image_82.png)

当双击列表框2时，删除选中项。

![image\.png](/posts/tianye-academy-summary/image_66.png)

### 通用对话框：

属性类型为“打开文件”时，将选中的文件地址写入到编辑框当中。

![image\.png](/posts/tianye-academy-summary/image_63.png)

![image\.png](/posts/tianye-academy-summary/image_65.png)

属性类型为“保存文件”时，默认创建并将编辑框内容写入到所选文件地址以文件形式当中。

![image\.png](/posts/tianye-academy-summary/image_89.png)

![image\.png](/posts/tianye-academy-summary/image.png)

### 超文本浏览框（扩展组件1）：

属性地址填写网址，运行时自动加载。

为了防止运行时点击网址链接跳转至其他软件上，可以设置其打开新窗口逻辑。

![image\.png](/posts/tianye-academy-summary/image_87.png)

![image\.png](/posts/tianye-academy-summary/image_76.png)

按下按钮实现跳转网址功能。

![image\.png](/posts/tianye-academy-summary/image_40.png)

![image\.png](/posts/tianye-academy-summary/image_71.png)

### 气球提示框（扩展组件1）：

用于提示信息，点击会在固定位置加载冒泡。

![image\.png](/posts/tianye-academy-summary/image_79.png)

![image\.png](/posts/tianye-academy-summary/image_60.png)

### 状态条：

用于在底部显示信息，其中在最后一栏的宽度里输入\-1值则会空白最右边一栏。

![image\.png](/posts/tianye-academy-summary/image_29.png)

![image\.png](/posts/tianye-academy-summary/image_35.png)

可通过点击按钮更改其中一栏的数据。

![image\.png](/posts/tianye-academy-summary/image_67.png)

### 进度条：

通过计次循环实现延迟加载。

![image\.png](/posts/tianye-academy-summary/image_27.png)

![image\.png](/posts/tianye-academy-summary/image_5.png)

### 滑动条：

按下按钮模拟滑块条滑动效果；当滑动块位置改变时，通过赋值实时显示滑动位置。

![image\.png](/posts/tianye-academy-summary/image_54.png)

![image\.png](/posts/tianye-academy-summary/image_18.png)

### 超级列表框（扩展组件1，属性类型选择报表列表框）：

**可保留焦点 = 真**：超级列表框**失去鼠标焦点后，依然高亮显示选中行**，选中状态不会消失。

**显示表格线 = 真**：超级列表框会显示**横向行线 \+ 纵向列线**，像 Excel 表格一样，格子边界清晰。

![image\.png](/posts/tianye-academy-summary/image_41.png)

![image\.png](/posts/tianye-academy-summary/image_77.png)

### 菜单：

可通过设置右击按下事件在鼠标当前位置弹出菜单。

![image\.png](/posts/tianye-academy-summary/image_2.png)

![image\.png](/posts/tianye-academy-summary/image_25.png)

![image\.png](/posts/tianye-academy-summary/image_38.png)

## 选择夹\+分组框：

注意需要每个分组都要添加分组框，位置需要一致美观。

![image\.png](/posts/tianye-academy-summary/image_73.png)

## 2\.数据类型

### 整数型（int）

- 存储：**正负整数**，不能存小数

- 范围：\-2147483648 \~ 2147483647

- 例子：`变量a 整数型 = 100`

### 长整数型

- 更大的整数，适合超大数字

- 范围：\-9223372036854775808 \~ 9223372036854775807

### 小数型（单精度）

- 存带小数点的数，精度一般

- 例子：`变量b 小数型 = 3.14`

### 双精度小数型

- 小数精度更高，常用

- 例子：`变量c 双精度小数型 = 3.1415926`

### 逻辑型（布尔）（赋值前默认为“假”）

- 只有两个值：**真 / 假**

- 用于判断、条件语句

- 例子：`是否登录 逻辑型 = 真`

### 文本型（字符串）

- 存文字、符号、中文，**必须用双引号**

- 例子：`姓名 文本型 = "张三"`

### 字节型

- 0\~255，很小的数字，常用于字节集、硬件交互

- 范围：0 \~ 255

### 字节集

- 易语言**超级常用**，存二进制数据：图片、文件、加密内容、数据包

- 相当于“一堆字节”，网络发包、读写文件必用

### 日期时间型

- 存时间，格式：年\-月\-日 时:分:秒

- 例子：`当前时间 日期时间型`

### 整数数组 / 文本数组

- 多个同类型数据放一起

- 例子：`分数[] 整数型`、`名字[] 文本型`

### 通用型

- 万能类型，什么都能存（文本、数字、逻辑），**不推荐乱用**，效率低





## 3\.命令以及使用

取随机性种子：

![image\.png](/posts/tianye-academy-summary/image_46.png)

## 5、6课：

## 1、数组操作：

### 注意：

**数组清零和数组排序**只对**数值型数组**有效，对**文本型数组**无效。

### 清除数组和数组清零的区别：

**清除数组 = 删掉所有成员，数组长度变成 0**

**数组清零 = 成员数量不变，只是把每个值改成 0**

## 2、文本操作：

### 注意：

易语言的汉字编码为：ansi,一个汉字占2个字节。

取文本左边如果刚好取到中文的一半，那么输出则为乱码。

读入文件输出的是字节集，需要到文本转化为文本型才能读取完整内容。

## 3、线程：

用“延时”会卡界面，用“延时”不会。使用线程则不会出现卡顿。

### 多线程主要功能代码实现（包括窗口\+全局变量）：

![image\.png](/posts/tianye-academy-summary/image_62.png)

![image\.png](/posts/tianye-academy-summary/image_26.png)

#### 全部开始（包括线程函数实现）：

![image\.png](/posts/tianye-academy-summary/image_30.png)

![image\.png](/posts/tianye-academy-summary/image_74.png)

#### 全部停止：

![image\.png](/posts/tianye-academy-summary/image_56.png)

#### 全部暂停\+全部继续：

![image\.png](/posts/tianye-academy-summary/image_70.png)

#### 控制单线程开启\+控制单线程暂停（包括许可证的创建）：

![image\.png](/posts/tianye-academy-summary/image_34.png)

## 4、超级列表框（属性类型为“报表列表框”，显示表格线为“真”，整行选择为“真”）：

#### 导入游戏账号文本到超级列表框功能实现：

![image\.png](/posts/tianye-academy-summary/image_58.png)

![image\.png](/posts/tianye-academy-summary/image_22.png)

##### 其中：

**整行选择 = 真**：点击超级列表框里**任意一列的单元格，都会选中完整一整行**，高亮整行。

**整行选择 = 假**：只能选中你**点击的那一个小格子**，不会高亮整行。

**“置标题”三个参数**：第一个是项目（序号，账号等一行的内容），第二个是列（第几列）， 第三个是你要插入的数据（文本型）。

![image\.png](/posts/tianye-academy-summary/image_43.png)

# 7、8课：

## 大漠：

注意：由于系统缩放不是100%，导致一些功能的使用会错乱（例如屏幕坐标偏移问题，只显示部分屏幕问题），需要到属性去勾选替代高DPI缩放行为，且下面选择为应用程序。

![image\.png](/posts/tianye-academy-summary/image_83.png)

### 注册大漠（3种方法）：

#### 1\.类模块调用法：

1\.将本机添加到大漠服务器当中。之后会给出dm\.dll文件。

![image\.png](/posts/tianye-academy-summary/image_19.png)

2\.打开大漠类库生成工具，将dm\.dll文件拖拽到里面后会在当前文件夹下点击生成一个Output文件夹。

![image\.png](/posts/tianye-academy-summary/image_69.png)

3\.选择E文件夹后打开obj\.txt文件复制粘贴到易语言的类模块中，按照读我\.txt文件内容操作。

![image\.png](/posts/tianye-academy-summary/image_21.png)

4\.注册大漠。

![image\.png](/posts/tianye-academy-summary/image_23.png)

#### 2\.支持库调用法（注意dm文件必须提前注册大漠到系统当中）：

1\.打开工具后选择OCX组件一栏，先注册组件选择dm\.dll文件。之后再点击下一步。

![image\.png](/posts/tianye-academy-summary/image_12.png)

2\.选择dm点击保存，之后会弹窗点击是，然后就会关闭易语言程序自动生成库。

![image\.png](/posts/tianye-academy-summary/image_75.png)

3\.重新打开易语言程序，选择工具后点击支持库配置，勾选dm支持库后点击确认，然后就可以正常使用了，代码操作跟1一样。

![image\.png](/posts/tianye-academy-summary/image_88.png)

![image\.png](/posts/tianye-academy-summary/image_14.png)

#### 3\.EC模块调用法：

1\.首先创建一个易语言模块。

![image\.png](/posts/tianye-academy-summary/image_84.png)

2\.插入模块将obj\.txt文件复制粘贴到易语言的类模块中，按照读我\.txt文件内容操作。

![image\.png](/posts/tianye-academy-summary/image_24.png)

3\.填写相关配置后，打开编译选择Windows易语言模块编译。

![image\.png](/posts/tianye-academy-summary/image_4.png)

![image\.png](/posts/tianye-academy-summary/image_10.png)

4\.打开新的易语言程序，在模块引用表当中添加大漠模块\.ec重复之前代码操作即可使用。

![image\.png](/posts/tianye-academy-summary/image_81.png)

#### 注意大漠注册（reg）失败的几个原因：

1\.管理员权限未开启，未关闭UAC（就是 Windows 系统里的**用户账户控制**）。

2\.防火墙未完全关闭。

3\.杀毒软件未关闭。

4\.注册码无效。

5\.开启VPN代理网络。

### 设置路径和密码：

功能：设置后之后的每次路径输入不需要再打上前面的绝对路径了，图片密码设置后会自动解密打开。

![image\.png](/posts/tianye-academy-summary/image_9.png)

### 找图：

功能：依次找到桌面图标并且鼠标延迟指向。

![image\.png](/posts/tianye-academy-summary/image_86.png)

### 找色：

功能：从上到下，从左到右依次查找PGB格式的图色，并且输出x和y轴位置。

![image\.png](/posts/tianye-academy-summary/image_1.png)

### 区域截图：

功能：设置好坐标后截图。

![image\.png](/posts/tianye-academy-summary/image_68.png)

### 快速找字：

功能：根据设置好的字库去其他文件当中快速找字。

![image\.png](/posts/tianye-academy-summary/image_64.png)

![image\.png](/posts/tianye-academy-summary/image_78.png)

### 设置字库密码：

功能：解密字库。注意要放在设置字库代码之前。

![image\.png](/posts/tianye-academy-summary/image_72.png)

### 区域找字：

功能：区域范围内根据字库找字。注意一定要显示在屏幕上才能查找。

![image\.png](/posts/tianye-academy-summary/image_51.png)

### 鼠标操作：

功能：鼠标左键单击后按下回车键。

![image\.png](/posts/tianye-academy-summary/image_90.png)

### 获取窗口：

功能：获取窗口句柄。

![image\.png](/posts/tianye-academy-summary/image_37.png)

### 设置窗口状态：

功能：设置窗口状态为最小化（可选择多种功能）。

![image\.png](/posts/tianye-academy-summary/image_52.png)

### 设置窗口标题：

功能：更改标题（一次性）。

![image\.png](/posts/tianye-academy-summary/image_55.png)

### 向指定窗口发送文本：

功能：向指定窗口发送文本，记住一般要选择输入文字的窗口，而不是父窗口。

![image\.png](/posts/tianye-academy-summary/image_31.png)

### 移动窗口：

功能：移动窗口。

![image\.png](/posts/tianye-academy-summary/image_50.png)

### 运行指定应用程序：

功能：打开应用程序，注意需要带路径打开，路径在属性中查看。

![image\.png](/posts/tianye-academy-summary/image_28.png)

# 9、10课：

## 后台：

一个成功的后台绑定模式，需要具备：

1\.后台鼠标 2\.后台键盘 3\.后台图色能刷新 4\.发送文本（非必要）  5\.内容（半内存脚本） 6\.公共参数（。。。）

### 判断窗口是否绑定：

功能：输入窗口句柄，绑定则为1，未绑定为0。

![image\.png](/posts/tianye-academy-summary/image_42.png)

### 关闭Aero效果：

功能：win7以上适用，打开的话会对识图识字有干扰，透明，阴影的效果影响找图找字。

![image\.png](/posts/tianye-academy-summary/image_45.png)

### 模拟真实鼠标，真实键盘：

功能：鼠标有部分防封的效果，手游拖动游戏内部窗口不生效，可以考虑开启次接口。键盘就起防封效果。

![image\.png](/posts/tianye-academy-summary/image_33.png)

## 大漠Foobar操作：

功能：创建独立窗口，类似于qml。

![image\.png](/posts/tianye-academy-summary/image_15.png)

## 大漠算法：

![image\.png](/posts/tianye-academy-summary/image_32.png)

## 大漠文件操作：

![image\.png](/posts/tianye-academy-summary/image_11.png)

## 大漠系统操作：

![image\.png](/posts/tianye-academy-summary/image_53.png)

## 大漠偏色计算器使用：

功能：由于有些文字是由多个图色构成，导致单一图色添加困难，所以用大漠偏色计算器计算出适用的一个图色，然后结合大漠综合工具提取出完整文字。

![image\.png](/posts/tianye-academy-summary/image_44.png)

![image\.png](/posts/tianye-academy-summary/image_48.png)

# 13、14课：

## 进程、线程：

进程：操作系统资源分配的最小单位（独立地址空间、文件描述符、内存、权限等）。

线程：进程内部CPU 调度执行的最小单位，共享所属进程的全部资源。

### 为什么线程里还能创建进程呢？

一个进程 = 一间带全套家具的房子线程 = 房子里干活的人

人（线程）在房子里干活时，完全可以向物业（操作系统）申请新建一间独立的房子（新进程）。

# 15、16课：

## 手游、端游、页游控制台细节差异

1、手游主要要控制模拟器的循环登录  页游要单独写浏览器，很可能要用到一些普通填表或者Post功能  端游反而思路最直接

2、手游要注意模拟器有可能出现卡死、崩溃等现象，需要纠错；页游要注意浏览器可能出现掉线、白屏、Flash内存溢出等问题要处理，端游很多有驱动保护



