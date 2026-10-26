+++
title = 'C++/Qt 网课学习笔记（社长嵌入式）'
date = '2026-10-02'
tags = ['Qt', 'C++']
draft = false
description = "C++/Qt 网课全程笔记：从 Qt 概述、信号槽到控件与事件循环，按上课日期整理的学习记录。"
images = ["images/og/qt-cpp-course-notes.png"]
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

![C++/Qt 网课学习笔记（社长嵌入式） 配图 1](/posts/qt-cpp-course-notes/image1.webp)

- std::to_string()——可以直接将整型数转换成长相一样的字符串。打印字符串可以如图表示。

```cpp
void bwmThreePrintCarInfo(string color,string brand,string type, int year)
{
    string str = "车的品牌是：" + brand
            + ",型号是: " + type
            + ",颜色是: " + color
            + ",上市年限是:" + std::to_string(year);
    cout << str << endl;
}
```

- 类的权限访问归类如图。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 3](/posts/qt-cpp-course-notes/image3.webp)

- 变量类型是否是指针的区别，如图。

```cpp
Car BWMthree;
BWMthree.color = "白色";
BWMthree.brand = "宝马";
BWMthree.type  = "3系";
BWMthree.year  = 2023;

BWMthree.printCarInfo = bwmThreePrintCarInfo;
BWMthree.printCarInfo(BWMthree.color,BWMthree.brand,BWMthree.type,BWMthree.year);

Car *AodiA6 = new Car();
//  AodiA6 = (struct Car*)malloc(sizeof(struct Car));

cout << "调试" << endl;
AodiA6->color = "黑色";
AodiA6->brand = "奥迪";
AodiA6->type = "A6";
AodiA6->year = 2008;
cout << "调试2"<< endl;
AodiA6->printCarInfo = A6PrintCarInfo;

AodiA6->printCarInfo(AodiA6->color,AodiA6->brand,AodiA6->type,AodiA6->year);
```

> 图注：红色箭头分别指向 `Car BWMthree;` 与 `Car *AodiA6 = new Car();` 这两行。

> 有 1 处无法确认

- Shift+Win+S：电脑自带截图；Ctrl+Alt+A：QQ截图（附带长截图）。

- C++中，string和char的区别如图。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 5](/posts/qt-cpp-course-notes/image5.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 6](/posts/qt-cpp-course-notes/image6.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 7](/posts/qt-cpp-course-notes/image7.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 8](/posts/qt-cpp-course-notes/image8.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 9](/posts/qt-cpp-course-notes/image9.webp)

- strlen和sizeof的区别如图所示。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 10](/posts/qt-cpp-course-notes/image10.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 11](/posts/qt-cpp-course-notes/image11.webp)

## 2025-07-08 周二

### 13.真正的成员函数

- 普通结构体是需要进行传参的，类是不需要进行传参，可直接使用的。

- 双冒号“::”称为作用域解析运算符。

- 成员函数的实现如图，无需传参。

```cpp
    void realPrintCarInfo();//声明成员函数

};

void Car::realPrintCarInfo() //在类的外部进行成员函数的实现
{
    string str = "车的品牌是：" + brand
            + ",型号是: " + type
            + ",颜色是: " + color
            + ",上市年限是:" + std::to_string(year);
         cout << str << endl;
}
```

### 14.类的组合

- 在 C++中，一个类包含另一个类的对象称为组合，如图。

```cpp
class Car{        //汽车“类”

public:
    //成员数据
    string color;   //颜色
    string brand;   //品牌
    string type;    //车型
    int year;      //年限

    wheel w1;
    wheel *pw1;
```

```cpp
BWMthree.pw1 = new wheel();
BWMthree.pw1->brand = "米其林";
BWMthree.pw1->year = 2023;
//BWMthree.w1.brand = "米其林";
//BWMthree.w1.year = 2023;
```

![C++/Qt 网课学习笔记（社长嵌入式） 配图 15](/posts/qt-cpp-course-notes/image15.webp)

## 2025-07-10

### 15.银行案例初识权限

- 类内部不写权限，默认是私有权限。

- a -= b 等价于 a = a - b。

## 2025-07-12

### 16.C++引用

- Ctrl+I：对齐代码行。

- 传参时，用引用代替指针可直接对地址直接访问。

```cpp
//引用变量，直接修改原始参数
void swap(int& a,int& b)
{
    int temp;
    temp = a;
    a = b;
    b = temp;
    cout<<"函数："<<endl;
    cout<<"a = "<<a<<endl;
    cout<<"b = "<<b<<endl;
}
```

- 返回引用时，同样可以直接访问数组地址修改参数。

```cpp
double& setValue(int a)
{
    double& ref = vals[a];
    return ref;
}
int main()
{
    setValue(3)=88.8;
    cout<<"修改值为: "<<endl;
    cout << vals[3] << endl;
}
```

## 2025-07-13

### 17、函数重载和运算符重载

- 函数重载

```cpp
class printData
{
public:
    void print(int i)
    {
        cout<<"整数为: "<<i<<endl;
    }
    void print(double j)
    {
        cout<<"浮点数为: "<<j<<endl;
    }
    void print(char h[])
    {
        cout<<"字符串为: "<<h<<endl;
    }
};
```
> 图注：三个红色箭头分别指向三个 print 重载函数，参数类型依次为 int、double、char[]

- 运算符重载

```cpp
class point
{
public:
    int x,y;
    point operator+(point p);
};

point point::operator+(point p)
{
    point ret;
    ret.x = x+p.x;
    ret.y = y+p.y;
    return ret;
}
```

```cpp
int main()
{
    point p1;
    p1.x = 3;
    p1.y = 4;

    point p2;
    p2.x = 4;
    p2.y = 5;

    point p3 = p1+p2;
```

### 18、构造函数

- 不带参数的构造函数和带参数的构造函数使用。

```cpp
class Car
{
public:
    string brand;
    int year;
    Car()
    {
        cout<<"构造函数被调用"<<endl;
    }
    Car(string b)
    {
        cout<<"带一个参数的构造函数被调用"<<endl;
        brand = b;
    }
    Car(string b,int y)
    {
        cout<<"带参数的构造函数被调用"<<endl;
        brand = b;
        year = y;
    }
    void display()
    {
        cout<<"brand = "<<brand<<endl;
        cout<<"year = "<<year<<endl;
    }
};
```

```cpp
int main()
{
    Car car;
    car.brand = "宝马";
    car.year = 2024;
    car.display();

    Car car2("比亚迪");
    car2.year = 2025;
    car2.display();

    Car*pcar = new Car("捷豹",2024);
    pcar->display();
    return 0;
}
```

```text
构造函数被调用
brand = 宝马
year = 2024
带一个参数的构造函数被调用
brand = 比亚迪
year = 2025
带参数的构造函数被调用
brand = 捷豹
year = 2024
```

## 2025-07-15

### 19、初始化列表构造

- 初始化列表直接在对象的构造过程中初始化成员变量。

```cpp
class Car
{
public:
    string brand;
    string type;
    int year;

    Car(string a,string b,int c):brand(a),type(b),year(c)
    {
        cout<<"参数列表的方式进行构造"<<endl;
    }

    void display();
};
```
> 图注：红线标出使用参数列表进行构造的构造函数声明

### 20、this关键字

- 选中要注释的行数，Ctrl+/即可完成注释。

- this关键字使用

```cpp
    Car& setYear(int year) {
        this->year = year; // 更新年份
        return *this; // 返回调用对象的引用
    }
};

int main()
{
    Car car("宝马",2024);
    car.display();

    // 链式调用
    car.setYear(2023).display();
```

### 21、delete关键字

- new开辟动态空间，搭配delete使用

```cpp
int main()
{
    //分配单个对象
    MyClass* myObject = new MyClass();
    //分配对象数组
    int* myArray = new int[5]{1,2,3,4,5};
    //使用对象和数组
    //释放内存
    delete myObject;
    delete[] myArray;
    return 0;
}
```

### 22、构造函数总结及拷贝构造函数的录制计划说明（网课不讲）

### 23、析构函数

- 在对象生命周期结束时被自动调用，用于执行对象销毁前的清理工作。

## 2025-07-17

### 24、静态成员static关键字

- 静态成员变量需要在类外初始化。

- 静态成员变量可以直接通过类名访问。

```cpp
class Myclass
{
private:
        static int staticNumofInstance;
public:
    Myclass()
    {
        staticNumofInstance++;
    }
    ~Myclass()
    {
        staticNumofInstance--;
    }
    static int getnumofInstance()
    {
        return staticNumofInstance;
    }
};

int Myclass::staticNumofInstance = 0;

int main()
{
    Myclass m1;
    cout<<Myclass::getnumofInstance()<<endl;
```

## 2025-07-19

### 25、继承

- 继承未标明则默认为私有继承。

### 26、继承份文件实现

- 在分文件内添加函数定义

![C++/Qt 网课学习笔记（社长嵌入式） 配图 28](/posts/qt-cpp-course-notes/image28.webp)

- 继承子类生成

![C++/Qt 网课学习笔记（社长嵌入式） 配图 29](/posts/qt-cpp-course-notes/image29.webp)

## 2025-07-20

### 27、权限对继承的影响

- 权限和继承的关系图

![C++/Qt 网课学习笔记（社长嵌入式） 配图 30](/posts/qt-cpp-course-notes/image30.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 31](/posts/qt-cpp-course-notes/image31.webp)

### 28、基类构造函数

- 派生类构造函数受基类构造函数影响。

```cpp
//基类，父类
class Vehicle
{
public:
    string country;
    double price;

    Vehicle(string country,double price)
    {
        cout<<"基类的构造函数被调用"<<endl;
        this->country = country;
        this->price = price;
    };
};

class Roadster:public Vehicle
{
public:
    int stateOfTop;
    Roadster(string country,double price,int stateOfTop):Vehicle(country,price)
    {
        cout<<"派生类的构造函数被调用"<<endl;
        this->stateOfTop = stateOfTop;
    }
};
```

### 29、虚函数

- 允许派生类重写该函数，关键字virtual。

```cpp
//基类，父类
class Vehicle
{
public:
    string country;
    double price;
    Vehicle(){};

    Vehicle(string country,double price)
    {
        cout<<"基类的构造函数被调用"<<endl;
        this->country = country;
        this->price = price;
    };

    //基类中声明一个虚函数
    virtual void run()
    {
        cout<<"车跑起来了"<<endl;
    }
    void stop();
};
```

```cpp
class Bike:public Vehicle
{
public:
    //重写虚函数
    void run() override
    {
        cout<<"脚踩自行车"<<endl;
    }
};
```

### 30、多重继承

- 多重继承是一种允许一个类同时继承多个基类的特性。这意味着派生类可以继承多个基类的属性和方法。

```cpp
class Derived : public ClassA, public ClassB {
public:
    void display() {
        displayA(); // 调用 ClassA 的 displayA
        displayB(); // 调用 ClassB 的 displayB
    }
};
```

## 2025-07-21

### 31、菱形继承和虚继承

- 菱形继承演示图。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 36](/posts/qt-cpp-course-notes/image36.webp)

### 25、多态

- 多态的实现类似于一种遥控器充当多种遥控器的身份操作不同设备的开关。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 37](/posts/qt-cpp-course-notes/image37.webp)

- 通过指针调用虚函数或者引用调用虚函数。

```cpp
class RemoteCon
{
public:
    virtual void openUtils()
    {
        cout<<"遥控的开被按下"<<endl;
    }
};

class TvRemoteCon:public RemoteCon
{
public:
    void openUtils() override
    {
        cout<<"电视遥控的开被按下"<<endl;
    }
};

class RoundRemoteCon:public RemoteCon
{
public:
    void openUtils() override
    {
        cout<<"音响遥控的开被按下"<<endl;
    }
};

class LightRemoteCon:public RemoteCon
{
public:
    void openUtils() override
    {
        cout<<"灯光遥控的开被按下"<<endl;
    }
};

void test(RemoteCon& r)
{
    r.openUtils();
}
```

```cpp
int main()
{
    //指针调用虚函数
    RemoteCon *remoteCon = new TvRemoteCon;//多态
    remoteCon->openUtils();

    RemoteCon *remoteCon1 = new RoundRemoteCon;//多态
    remoteCon1->openUtils();

    RemoteCon *remoteCon2 = new LightRemoteCon;//多态
    remoteCon2->openUtils();

    //基类的引用调用虚函数
    TvRemoteCon tvremotecon;
    test(tvremotecon);
    return 0;
}
```

### 33、抽象类

- 抽象类用于提供共同的基础结构。它不能被实例化，只能作为其他类的基类，确保派生类实现特定的虚函数。

```cpp
int main()
{
    //Teacher  t;//抽象类不支持被实例化
    EnglishTeacher e;
    e.goInClass();
    //抽象类多态
    Teacher *teacher = new EnglishTeacher;
    teacher->afterClass();
    return 0;
}
```

```cpp
virtual void goInClass() = 0;//纯虚函数
virtual void startClass() = 0;
virtual void afterClass() = 0;
```

```cpp
int main()
{
    //Teacher t;//抽象类不支持被实例化
    EnglishTeacher e;
    e.goInClass();

    //抽象类多态
    Teacher *teacher = new EnglishTeacher;
    teacher->afterClass();
    return 0;
}
```

### 34、接口

- 接口类还是抽象类，但更多的是行为方面的。

### 35、记事本项目概述（简单讲解记事本的功能）

### 36、QT工程默认各文件解析

- 界面选择。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 43](/posts/qt-cpp-course-notes/image43.webp)

- 创建程序后各个文件各行代码理解。

```cpp
Widget::Widget(QWidget *parent)
    : QWidget(parent)
    , ui(new Ui::Widget)//初始化列表构造
{
    ui->setupUi(this);//设置QTdesigner里面的ui关联到Widget类的私有变量ui里面
}
```

```cpp
#include "widget.h"

#include <QApplication>

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);//用于初始化Qt应用程序的环境
    Widget w;//创建工程名字为Widget
    w.show();//显示界面
    return a.exec();//启动应用程序的时间循环
}
```

## 2025-07-22

### 37、记事本按键组合布局

### 38、记事本初步布局完成

- 如何排版中间无空隙。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 46](/posts/qt-cpp-course-notes/image46.webp)

### 39、实现窗口大小调整的子控件自适应

- 窗口大小自适应。（ui里面要是最大的布局）

```cpp
Widget::Widget(QWidget *parent)
    : QWidget(parent)
    , ui(new Ui::Widget)
{
    ui->setupUi(this);
    //虽然上面一行代码进行Widget和ui的窗口关联，但是如果发生窗口大小变化的时候，里面的布局不会随之变化
    //通过下面这行代码进行显示说明，让窗口变化时，布局及其子控件随之调整
    this->setLayout(ui->verticalLayout);
}
```

### 40、记事本UI美化stylesheet初探

- 按键平时状态：

QPushButton { border-image: url(:/jishiben/c0.png); }

- 按键上鼠标悬停状态：

QPushButton:hover { border-image: url(:/jishiben/c1.png); }

- 按键上鼠标按下状态：

QPushButton:pressed { border-image: url(:/jishiben/c2.png); }

- 如何添加图片生成qrc文件。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 48](/posts/qt-cpp-course-notes/image48.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 49](/posts/qt-cpp-course-notes/image49.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 50](/posts/qt-cpp-course-notes/image50.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 51](/posts/qt-cpp-course-notes/image51.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 52](/posts/qt-cpp-course-notes/image52.webp)

- 按键添加底图。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 53](/posts/qt-cpp-course-notes/image53.webp)

### 41、UI美化遗留问题解决

![C++/Qt 网课学习笔记（社长嵌入式） 配图 54](/posts/qt-cpp-course-notes/image54.webp)

- 下面的文字跟着窗口拖动下移动到固定位置

ui-\>widgetBotton-\>setLayout(ui-\>horizontalLayout_3);

![C++/Qt 网课学习笔记（社长嵌入式） 配图 55](/posts/qt-cpp-course-notes/image55.webp)

- 也可直接选中区域设置水平布局同样达到效果。

### 42、信号与槽的引用

- 通过界面方式添加信号与槽。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 56](/posts/qt-cpp-course-notes/image56.webp)

- 另外一种方式实现添加信号与槽。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 57](/posts/qt-cpp-course-notes/image57.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 58](/posts/qt-cpp-course-notes/image58.webp)

## 2025-07-24

### 43、信号与槽的四种代码实现方式

- 方法一：自动连接使用UI文件

![C++/Qt 网课学习笔记（社长嵌入式） 配图 59](/posts/qt-cpp-course-notes/image59.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 60](/posts/qt-cpp-course-notes/image60.webp)

```cpp
    : QWidget(parent)
    , ui(new Ui::Widget)
{
    ui->setupUi(this);
}

Widget::~Widget()
{
    delete ui;
}


void Widget::on_btnui_clicked()
{
    cout<<"UIBtnClicked"<<endl;
}
```

> 图注：红箭头从左侧项目树中被红框标出的 widget.cpp 指向编辑区，红圈圈出新添加的槽函数 void Widget::on_btnui_clicked()，表示该点击槽函数定义在 widget.cpp 中。

- 方法二：使用QObject::connect。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 62](/posts/qt-cpp-course-notes/image62.webp)

```cpp
    ui->setupUi(this);
    //在构造函数中进行信号与槽的绑定
    //QObject::connect(sender,SIGNAL(signal()),receiver, SLOT(slot()));
    //sender: 谁发送; SIGNAL(): 检测哪个信号; receiver:谁来响应; SLOT():响应做什么事
    QObject::connect(ui->btncon,SIGNAL(clicked()),this,SLOT(on_btncon_clickedMyself()));
}
```

> 图注：红框圈出构造函数中信号与槽的绑定部分——QObject::connect 的参数含义注释（sender/SIGNAL/receiver/SLOT）与实际绑定语句（ui->btncon 的 clicked() 信号连接到 on_btncon_clickedMyself() 槽）

```cpp
// [此处模糊：截图上边缘被裁切的一行，仅见字形底部（青色函数名与行尾 "();"）]
private slots:
    void on_btnui_clicked();
    void on_btncon_clickedMyself();
// [此处模糊：截图下边缘被裁切的一行，仅见橄榄色关键字字形顶部]
```
> 图注：红字批注「在头文件添加函数」指向 `private slots:` 下的两行函数声明

> 有 2 处无法确认

![C++/Qt 网课学习笔记（社长嵌入式） 配图 65](/posts/qt-cpp-course-notes/image65.webp)

```cpp
void Widget::on_btncon_clickedMyself()
{
    cout<<"BtnClicked"<<endl;
}
```

- 方法三：Lambda表达式。

```cpp
//QObject::connect(sender,&Sender::signal, [=]() {/* lambda body */ });//匿名函数无需声明槽函数
QObject::connect(ui->pushButton,&QPushButton::clicked,[=](){
    cout<<"BtnLambdaClicked"<<endl;
});
```

- Ctrl+B：构建函数文件。

- 方法四：

```cpp
//方法四
//QObject::connect(sender,&Sender::signal, receiver,&Receiver::slot);
QObject::connect(ui->abcd,&QPushButton::clicked,this,&Widget::fortch_clicked);
```

```cpp
private slots:
    void on_btnui_clicked();
    void on_btncon_clickedMyself();
    void fortch_clicked();
```
> 图注：红框圈出的是 `void fortch_clicked();` 这一行

```cpp
void Widget::fortch_clicked()
{
    cout<<"BtnfortchClicked"<<endl;
}
```
> 图注：红色批注「添加定义后打印」，指向上方函数定义中的打印语句

## 2025-07-24

### 44、自定义信号与槽

- 自定义信号与槽。

```cpp
public:
    Widget(QWidget *parent = nullptr);
    ~Widget();

signals:
    void mysignal();
    void mysignalparams(int value);

private slots:
    //槽函数需要定义实现
    void mysiot();
    void mysiotparams(int value);

private:
    Ui::Widget *ui;
```

> 图注：红字「声明信号」与红框指向 signals 信号声明块；红字「声明槽，需要定义」与红框指向 private slots 槽声明块

```cpp
{
    ui->setupUi(this);
    //谁接收什么信号，谁发送什么槽行为
    connect(this,SIGNAL(mysignal()),this,SLOT(mysiot()));
    emit mysignal();
    connect(this,SIGNAL(mysignalparams(int)),this,SLOT(mysiotparams(int)));
    emit mysignalparams(100);
}
```
> 图注：红框与红箭头批注「连接信号与槽」指向框内两行（注释行与 connect(this,SIGNAL(mysignal()),this,SLOT(mysiot()));）；红色下划线与红箭头批注「发射信号（带参数）」指向带下划线的 emit mysignal(); 与 emit mysignalparams(100); 两行。

```cpp
void Widget::mysiot()
{
    std::cout<<"myslot"<<std::endl;
}

void Widget::mysiotparams(int value)
{
//    std::cout<<"myslotparams"<<std::endl;
//    cout<<value<<endl;
    qDebug()<<"myslotparams";
    qDebug()<<value;
}
```

> 图注：红框圈出 qDebug()<<"myslotparams"; 与 qDebug()<<value; 两行，红字批注：注意头文件添加#include<QDebug>

### 45、QFile读取文件

- Alt+Enter：快速添加头文件。

```cpp
void Widget::on_btnread_clicked()
{
    //1.打开文件
    QFile
}
```

- QFile的引用。

```cpp
void Widget::on_btnread_clicked()
{
    //1.打开文件
    //QFile file("D:/QT/test.txt");
    QFile file;
    file.setFileName("D:/QT/test.txt");
    if(!file.open(QIODevice::ReadOnly | QIODevice::Text))
    {
        qDebug()<<"file open error";
    }
    //2.读取文件
    char contect[100]={'\0'};
    if(file.read(contect,100) == -1) return;
    //3.输出文件内容
    qDebug()<<contect;
}
```

> 图注：红框与红字「两种打开方法」指向打开文件的两种写法：被注释的 `//QFile file("D:/QT/test.txt");` 与 `QFile file; file.setFileName("D:/QT/test.txt");`

```cpp
//4.关闭，回收资源
file.close();
```

## 2025-07-25

### 46、QFile创建并写入文件

- 创建并写入文件

```cpp
void Widget::on_btnwrite_clicked()
{
    //1.打开
    QFile file("D:/QT/test2.txt");
    file.open(QIODevice::WriteOnly | QIODevice::Text);
    //2.写入
    file.write("Program 45-QFile001 write someting to this File 我是学渣");
    //3.关闭
    file.close();
}
```

### 47、QTextSteam读写文件

- 读取文件：

```cpp
void Widget::on_btnstreamRead_clicked()
{
    QFile file;
    file.setFileName("D:/QT/test.txt");
    if(!file.open(QIODevice::ReadOnly | QIODevice::Text))
    {
        qDebug()<<"file open error";
    }

    QTextStream in(&file);//取地址
    in.setCodec("UTF-8");//编码
    //QString context = in.read(file.size());//读取全部字符串
    //qDebug()<<context;
    while(!in.atEnd())
    {
        QString context = in.readLine();//读取一行一行
        qDebug()<<context;
    }

    file.close();
}
```

> 图注：红色文字「两种读取方法」与两个红框分别指向两种读取文件内容的方式——第一个红框框住用 `in.read(file.size())` 一次读取全部字符串的写法（图中已被注释），第二个红框框住 `while(!in.atEnd())` 循环中用 `in.readLine()` 一行一行读取的写法。

- 创建并写入文件：

```cpp
void Widget::on_btnstreamWrite_clicked()
{
    //1.打开
    QFile file;
    file.setFileName("D:/QT/test3.txt");
    if(!file.open(QIODevice::WriteOnly | QIODevice::Text))
    {
        qDebug()<<"file open error";
    }
    //2.写入
    QTextStream out(&file);//取地址
    out.setCodec("UTF-8");
    out<<"I wrote stream char to File";
    //3.关闭
    file.close();
}
```

### 48、QFlieDialog文件选择框

- 文件选择。

```cpp
//选择谁，执行什么操作，路径，文件类型
QString fileName = QFileDialog::getOpenFileName(this, tr("Open File"),
                                                 "D:/QT/",
                                                 tr("Text (*.txt)"));
qDebug()<<fileName;
```

### 49、QFileDialog选择多个文件

- 选择多个文件：

```cpp
void Widget::on_btnfenbuzhou_clicked()
{
    //创建一个实例
    QFileDialog qFileDialog;
    //文件形式选择，已存在文件
    qFileDialog.setFileMode(QFileDialog::ExistingFiles);
    //选择文件类型，只显示txt文件
    qFileDialog.setNameFilter("*.txt");
    //运行窗口
    qFileDialog.exec();
    QStringList qstring = qFileDialog.selectedFiles();
    for(QString str : qstring)
    {
        qDebug()<<str;
    }
}
```

![C++/Qt 网课学习笔记（社长嵌入式） 配图 82](/posts/qt-cpp-course-notes/image82.webp)

- 其中：

```cpp
for(QString str : qstring)
{
    qDebug()<<str;
}
```

![C++/Qt 网课学习笔记（社长嵌入式） 配图 84](/posts/qt-cpp-course-notes/image84.webp)

### 50、QFileDialog创建文件

- 保存文件。

```cpp
void Widget::on_btnSave_clicked()
{
    //只能保存一个
    QString fileName = QFileDialog::getSaveFileName(this, tr("Save File"),
                            "D:/QT/untitled.txt",
                            tr("Text (*.txt *.doc)"));

    qDebug()<<fileName;

    QFile file;
    file.setFileName(fileName);
    if(!file.open(QIODevice::WriteOnly | QIODevice::Text))
    {
        qDebug()<<"file open error";
    }
    QTextStream out(&file);
    out.setCodec("UTF-8");
    out<<"Qdialog write data to the txt File";
    file.close();
}
```

> 图注：红色箭头指向 `qDebug()<<fileName;` 一行之后，批注「到这里只是单纯保存，还需要实际内部操作」；另有红框圈出 `tr("Save File")` 中的 `("Save File")`。

### 51、记事本实现打开功能

- Widget可作为背景板。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 86](/posts/qt-cpp-course-notes/image86.webp)

- 添加颜色添加背景色。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 87](/posts/qt-cpp-course-notes/image87.webp)

- 文本框。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 88](/posts/qt-cpp-course-notes/image88.webp)

- 如果布局缩成一团，可以改高度试试。

- 代码解析：

打开选择文件框。

```cpp
QString fileName = QFileDialog::getOpenFileName(this,tr("Open File"),
                                                "D:/QT/",
                                                tr("Text(*.txt)"));
qDebug()<<fileName;
```

清除之前剩余内容，以只读形式打开文件，创建文本流并设置UTF-8编码。

```cpp
ui->textEdit->clear();//每次选择前清空之前保留的内容

QFile file(fileName);//直接在构造函数中指定文件名
if(!file.open(QIODevice::ReadOnly | QIODevice::Text))
{
    qDebug()<<"file open error!";
}

QTextStream in(&file);//创建文本流
in.setCodec("UTF-8");
```

```cpp
//atEnd() 用于判断是否已经到达文件末尾
while(!in.atEnd())
{
    //readLine:readLine() 是 QTextStream 提供的方法，
    //其作用是从当前位置开始读取，直到遇到换行符（\n）或者文件结束符，
    //然后返回读取到的内容（不包含换行符）。
    //每执行一次循环，就会读取文件中的下一行内容。
    QString context = in.readLine();
    //qPrintable:减掉双引号，将QString转为const char
    qDebug()<<qPrintable(context);
    //setText对整个空间进行设置，之前的内容会被下一行覆盖
    //ui->textEdit->setText(context);
    //追加内容
    ui->textEdit->append(context);
}
```

### 52、记事本实现保存新建文件的功能

- 代码解析：

```cpp
//打开文件保存对话框
QString fileName = QFileDialog::getSaveFileName(this, tr("Save File"),
                            "D:/QT/untitled.txt",
                            tr("Text (*.txt *.doc)"));
qDebug()<<fileName;
//创建文件对象并打开
QFile file(fileName);
if(!file.open(QIODevice::WriteOnly | QIODevice::Text))
{
    qDebug()<<"file open error";
}
QTextStream out(&file);
out.setCodec("UTF-8");
//获取文本编辑框中所有内容
QString context = ui->textEdit->toPlainText();
//将内容写入文件
out<<context;
file.close();
```

- 共享成员数据

```cpp
QT_END_NAMESPACE

class Widget : public QWidget
{
    Q_OBJECT

public:
    QFile file;//定义成员数据
    Widget(QWidget *parent = nullptr);
    ~Widget();

private slots:
    void on_btnOpen_clicked();

    void on_btnSave_clicked();
```

> 图注：项目树中红框标出 widget.h；代码区红框圈出成员定义行 `QFile file;//定义成员数据`，旁有红字批注「可定义成员数据实现共享，以便操作文本框内容」

```cpp
        "D:/QT/",
        tr("Text(*// [此处模糊：字符串后续内容被图片右边缘截断]
qDebug()<<fileName;

ui->textEdit->clear();//每次选择前清空之前保留的内容

file.setFileName(fileName);
if(!file.open(QIODevice::ReadOnly | QIODevice::Text))
{
    qDebug()<<"file open error!";
}

QTextStream in(&file);//创建文本流
//in.setCodec("UTF-8");
in.setCodec("ANSI");
```

> 图注：红框圈出 `file.setFileName(fileName);` 一行，右侧红字批注“可直接调用”

> 有 1 处无法确认

### 53、记事本实现关闭按键

- 代码解析：

```cpp
//检查文件是否打开，如果打开则关闭文件并清空文本编辑框的内容
if(file.isOpen())
{
    file.close();
    ui->textEdit->clear();
}
```

### 54、字符编码问题引入

- ANSI和UTF-8不同编码文件会出现乱码现象。

## 2025-07-26

### 55、QComboBox组件

- QComboBox组件实现选择编码ui功能。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 96](/posts/qt-cpp-course-notes/image96.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 97](/posts/qt-cpp-course-notes/image97.webp)

- 代码实现。

```cpp
//currentIndexChanged:当用户选择下拉列表中的不同项时会触发这个信号，
//并传递当前选中项的索引（整数类型）。
connect(ui->comboBox,SIGNAL(currentIndexChanged(int)),
        this,SLOT(oncurrentIndexChanged(int)));
```
> 图注：红色下划线标在 connect 下方

```cpp
public slots:
    void oncurrentIndexChanged(int index);
```

```cpp
void Widget::oncurrentIndexChanged(int index)
{
    qDebug()<<index;
    //调用它能够获取当前选中项所显示的文本。
    qDebug()<<ui->comboBox->currentText();
}
```

### 56、记事本优化打开各种类型的编码文件

- 拷贝项目时记得不光要改文件夹名字，还要改内部.pro文件和.pro.user文件。再次打开时可通过载入项目选项打开拷贝过后的项目。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 101](/posts/qt-cpp-course-notes/image101.webp)

- 实现文本框内编码类型选择的转换。

```cpp
//将ui->comboBox->currentText()的QString类型转化为const char*类型
QString str = ui->comboBox->currentText();
const char* c_str = str.toStdString().c_str();
in.setCodec(c_str);
```

```cpp
void Widget::onCurrentIndexChanged(int index)
{
    ui->textEdit->clear();
    if(file.isOpen())
    {
        QTextStream in(&file);
        in.setCodec(ui->comboBox->currentText().toStdString().c_str());
        //seek: 让光标回到初始位置
        file.seek(0);
        while(!in.atEnd())
        {
            QString context = in.readLine();
            qDebug()<<qPrintable(context);
            ui->textEdit->append(context);
        }
    }
}
```
> 图注：红框圈出 `//seek: 让光标回到初始位置` 与 `file.seek(0);`，右侧红字“注意让光标返回起点”

### 57、记事本支持光标行列值显示

- 工具-\>选项-\>文本编辑器，可修改文件编码。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 104](/posts/qt-cpp-course-notes/image104.webp)

- 实现获取行列信息。

```cpp
//cursorPositionChanged():
//QTextEdit 的光标位置改变时自动发出此信号，不携带参数。
connect(ui->textEdit,SIGNAL(cursorPositionChanged()),
        this,SLOT(onCursorPositionChanged()));
```

```cpp
void Widget::onCursorPositionChanged()
{
    //ui->textEdit->textCursor():获取textEdit中文本光标的当前状态。
    QTextCursor cursor = ui->textEdit->textCursor();

    qDebug()<<cursor.columnNumber()+1<<","<<cursor.blockNumber()+1;

    //数值类型的行号和列号转换为字符串类型。
    QString blockNum = QString::number(cursor.blockNumber()+1);
    QString columnNum = QString::number(cursor.columnNumber()+1);

    //拼接字符串
    const QString labelMes = "L:"+blockNum+"C:"+columnNum;

    //更新标签控件的显示内容。
    ui->labelPosition->setText(labelMes);
}
```

### 58、记事本添加打开文件的提示

- 文本框的显示提示。

```cpp
//设定当前窗口的标题为 " - MynoteBook"
this->setWindowTitle(" - MynoteBook");
```

- 显示文件路径。

```cpp
this->setWindowTitle(fileName+" - MynoteBook");
```

![C++/Qt 网课学习笔记（社长嵌入式） 配图 109](/posts/qt-cpp-course-notes/image109.webp)

### 59、C++补充知识-模块

- 类模版。

```cpp
//类模版
template<typename T>
class PrintEverything
{
private:
    //T:储存模版类型
    T data;
public:
    void printEverything()
    {
        cout<<data;
    }
    void setEverything(T data)
    {
        this->data = data;
    }
};
```

- 函数模版。

函数模板允许编写通用的函数，可以处理多种不同类型的数据。

```cpp
// 定义一个通用的函数模板
template <typename T>
T add(T a, T b) {
    return a + b;
}

int main() {
    // 使用函数模板调用通用函数
    int result1 = add(5, 10);
    double result2 = add(3.5, 2.7);
    // 输出函数模板调用结果
    std::cout << "Result1: " << result1 << std::endl; // 输出 Result1: 15
    std::cout << "Result2: " << result2 << std::endl; // 输出 Result2: 6.2

    return 0;
}
```

### 60、QList容器简介

- QList 是一个容器类，它在内部实现上类似于一个数组，但也提供了一些链表的特性。

### 61、记事本实现当前行高亮功能

- 设置当前行高亮。

```cpp
//设置当前高亮
//创建了一个名为 extraSelection 的列表，用于存储需要高亮显示的文本区域。
//QTextEdit::ExtraSelection 是一种特殊的文本选择区域类型，可用于自定义文本的显示效果。
QList<QTextEdit::ExtraSelection> extraSelection;
//创建了一个 ExtraSelection 对象 ext，用于设置单个高亮区域的属性。
QTextEdit::ExtraSelection ext;
//1.知道当前行
//获取当前文本编辑框（ui->textEdit）的光标位置，并将其赋值给 ext 对象的 cursor 属性。这一步确定了高亮显示的起始位置。
ext.cursor = ui->textEdit->textCursor();
//创建了一个灰色的画刷（QBrush），用于设置高亮区域的背景颜色。
QBrush qBrush(Qt::lightGray);
//2.颜色
//将之前创建的灰色画刷应用到 ext 对象的格式（format）中，设置高亮区域的背景色为灰色。
ext.format.setBackground(qBrush);
//设置高亮区域的属性，使其扩展到整行的宽度，即使文本没有填满整行。这样可以确保整行都被高亮显示。
ext.format.setProperty(QTextFormat::FullWidthSelection,true);
//添加下划线
ext.format.setFontUnderline(true);
//3.设置
//将配置好的 ext 对象添加到之前创建的 extraSelection 列表中。
extraSelection.append(ext);
//将配置好的高亮区域列表应用到文本编辑框（ui->textEdit）中，使设置的高亮效果显示在界面上。
ui->textEdit->setExtraSelections(extraSelection);
```

### 62、记事本优化保存文件的逻辑

- 权限更改。

```cpp
//改为可读可写保存才有效果
if(!file.open(QIODevice::ReadWrite | QIODevice::Text))
{
```

- 判断文件是否打开。

```cpp
//文件未打开时写入保存文件
if(!file.isOpen())
{
    //打开文件保存对话框
    QString fileName = QFileDialog::getSaveFileName(this, tr("Save File"),
                                "D:/QT/untitled.txt",
                                tr("Text (*.txt *.doc)"));
    //qDebug()<<fileName;
    //创建文件对象并打开
    file.setFileName(fileName);
    if(!file.open(QIODevice::WriteOnly | QIODevice::Text))
    {
        qDebug()<<"file open error";
    }
    this->setWindowTitle(fileName+" - MynoteBook");
}
QTextStream out(&file);
//out.setCodec("UTF-8");
out.setCodec(ui->comboBox->currentText().toStdString().c_str());
//获取文本编辑框中所有内容
QString context = ui->textEdit->toPlainText();
//将内容写入文件
out<<context;
```
> 图注：红框圈出开头两行 `//文件未打开时写入保存文件` 与 `if(!file.isOpen())`，右侧红字批注：增加文件是否打开的判断，没有打开则新建文件写入内容，打开则直接写入内容

### 63、记事本关闭按键功能优化

- 新增弹窗效果。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 115](/posts/qt-cpp-course-notes/image115.webp)

```cpp
int ret = QMessageBox::warning(this, tr("MyNoteBook Notice:"),
                                 tr("The document has been modified.\n"
                                    "Do you want to save your changes?"),
                                 QMessageBox::Save | QMessageBox::Discard
                                 | QMessageBox::Cancel,
                                 QMessageBox::Save);
```

![C++/Qt 网课学习笔记（社长嵌入式） 配图 117](/posts/qt-cpp-course-notes/image117.webp)

- 实现三个选项各自功能。

```cpp
switch (ret) {
    //是否保存
    case QMessageBox::Save:
        // Save was clicked
    on_btnSave_clicked();
    qDebug()<<"QMessageBox::Save";
        break;
    //是否丢弃
    case QMessageBox::Discard:
        // Don't Save was clicked
    qDebug()<<"QMessageBox::Discard:";
        break;
    //是否取消
    case QMessageBox::Cancel:
        // Cancel was clicked
    ui->textEdit->clear();
    //检查文件是否打开，如果打开则关闭文件并清空文本编辑框的内容
    if(file.isOpen())
    {
        file.close();
    }
    qDebug()<<"QMessageBox::Cancel:";
        break;
    default:
        // should never be reached
        break;
  }
```

> 图注：三个红色方框分别圈出 case QMessageBox::Save / Discard / Cancel 三行，右侧红字批注「实现三个选项各自功能」

### 64、记事本添加快捷键功能

- 创建打开和保存的快捷键。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 119](/posts/qt-cpp-course-notes/image119.webp)

```cpp
//创建一个指向 QShortcut 对象的指针，用于处理 "打开" 操作的快捷键
//this:指定当前对象作为快捷键的父对象，确保与窗口生命周期一致
QShortcut *shortcutOpen = new QShortcut(QKeySequence(tr("Ctrl+O", "File|Open")),this);
//创建一个指向 QShortcut 对象的指针，用于处理 "保存" 操作的快捷键
QShortcut *shortcutSave = new QShortcut(QKeySequence(tr("Ctrl+S", "File|Save")),this);
//connect(...):Qt 的信号槽连接函数
//shortcutOpen:信号发送者，即之前创建的 "打开" 快捷键对象
//&QShortcut::activated:信号类型，当快捷键被触发时发出此信号
//[=]():Lambda 表达式（匿名函数）
//[=]:以值捕获方式获取外部变量，确保可以访问当前对象的成员
//on_btnOpen_clicked():Lambda 函数体，调用 "打开" 按钮的点击处理函数
connect(shortcutOpen,&QShortcut::activated,[=](){
    on_btnOpen_clicked();
});
connect(shortcutSave,&QShortcut::activated,[=](){
    on_btnSave_clicked();
});
```

### 65、记事本快捷键放大缩小字体

- 实现放大和缩小的快捷键功能。

```cpp
// [此处模糊：截图上边缘被裁切的一行，仅见若干字形底部（括号、逗号的降部）]
//添加放大的快捷键
QShortcut *shortcutZoomIn = new QShortcut(QKeySequence(tr("Ctrl+SHIFT+=", "File|Save")),this);
//添加缩小的快捷键
QShortcut *shortcutZoomOut = new QShortcut(QKeySequence(tr("Ctrl+SHIFT+-", "File|Save")),this);
// [此处模糊：截图下边缘被裁切的绿色注释行，仅见 "//" 与字形顶部]
```

> 有 2 处无法确认

```cpp
public:
    QFile file;//定义成员数据
    Widget(QWidget *parent = nullptr);
    ~Widget();
    void zoomIn();
    void zoomOut();
```
> 图注：红框圈出的是两个成员函数 zoomIn() 与 zoomOut() 的声明

```cpp
connect(shortcutZoomIn,&QShortcut::activated,[=](){
    zoomIn();
});
connect(shortcutZoomOut,&QShortcut::activated,[=](){
    zoomOut();
});
```

```cpp
void Widget::zoomIn()
{
    //获得TextEdit的当前字体信息
    QFont font = ui->textEdit->font();
    //获得当前字体的大小
    int fontSize = font.pointSize();
    if(fontSize == -1) return;
    //改变大小, 并设置字体大小
    int newfontSize = fontSize+1;
    font.setPointSize(newfontSize);
    ui->textEdit->setFont(font);
}

void Widget::zoomOut()
{
    //获得TextEdit的当前字体信息
    QFont font = ui->textEdit->font();
    //获得当前字体的大小
    int fontSize = font.pointSize();
    if(fontSize == -1) return;
    //改变大小, 并设置字体大小
    int newfontSize = fontSize-1;
    font.setPointSize(newfontSize);
    ui->textEdit->setFont(font);
}
```

### 66、QT事件概念引入

- 事件（event）是由系统或者 Qt 本身在不同的场景下发出的。当用户按下/移动鼠标、敲下键盘，或者是 窗口关闭/大小发生变化/隐藏或显示都会发出一个相应的事件。一些事件在对用户操作做出响应时发出， 如鼠标/键盘事件等；另一些事件则是由系统自动发出，如计时器事件。

- 事件分发过程。

事件在Qt中产生之后，的分发过程是这样的：

1. 当事件产生之后，Qt使用应用程序对象调用 `notify()` 函数将事件发送到指定的窗口：

```cpp
[override virtual] bool QApplication::notify(QObject *receiver, QEvent *e);
```

2. 事件在发送过程中可以通过事件过滤器进行过滤，默认不对任何产生的事件进行过滤。

```cpp
// 需要先给窗口安装过滤器，该事件才会触发
[virtual] bool QObject::eventFilter(QObject *watched, QEvent *event)
```

3. 当事件发送到指定窗口之后，窗口的事件分发器会对收到的事件进行分类：

```cpp
[override virtual protected] bool QWidget::event(QEvent *event);
```

4. 事件分发器会将分类之后的事件（鼠标事件、键盘事件、绘图事件。。。）分发给对应的事件处理器函数进行处理，每个事件处理器函数都有默认的处理动作（我们也可以重写这些事件处理器函数），比如：鼠标事件：

```cpp
// 鼠标按下
[virtual protected] void QWidget::mousePressEvent(QMouseEvent *event);
// 鼠标释放
[virtual protected] void QWidget::mouseReleaseEvent(QMouseEvent *event);
// 鼠标移动
[virtual protected] void QWidget::mouseMoveEvent(QMouseEvent *event);
```

## 2025-07-27

### 67、重写窗口各类默认事件

- Alt+Enter：也能直接添加函数定义。

- 各个事件的实现：

```cpp
public://函数声明
    void enterEvent(QEvent *event) override;
    void leaveEvent(QEvent *event) override;
    void wheelEvent(QWheelEvent *event) override;
    void closeEvent(QCloseEvent *event) override;
    void resizeEvent(QResizeEvent *event) override;
```

```cpp
#include <QDebug>
#include <QWheelEvent>
#include <qmessagebox.h>//包含头文件
```

```cpp
//鼠标进入窗口检测
void Widget::enterEvent(QEvent *event)
{
    qDebug()<<"mouse in";
}
//鼠标离开窗口检测
void Widget::leaveEvent(QEvent *event)
{
    qDebug()<<"mouse leave";
}
//鼠标滚轮检测
void Widget::wheelEvent(QWheelEvent *event)
{
    qDebug()<<event->angleDelta();
}
```

```cpp
//窗口关闭检测
void Widget::closeEvent(QCloseEvent *event)
{
    int ret = QMessageBox::warning(this, tr("My Application"),
                                     tr("Close the Window.\n"
                                        "Do you want to close the Window?"),
                                     QMessageBox::Yes | QMessageBox::No,
                                   QMessageBox::No);
    switch(ret)
    {
    case QMessageBox::Yes:
        //接受执行
        event->accept();
        break;
    case QMessageBox::No:
    //处理Escape键或对话框外部点击
    default:
        //忽视执行
        event->ignore();
        break;
    }
}
```

```cpp
//窗口发生变化检测
void Widget::resizeEvent(QResizeEvent *event)
{
    //  获取窗口调整前的大小
    qDebug()<<"oldSize"<<event->oldSize()
    //获取窗口调整后的新大小
            <<"newSize"<<event->size();
}
```

### 68、用事件自定义出一个按键

- 自定义按键类头文件声明。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 131](/posts/qt-cpp-course-notes/image131.webp)

```cpp
class Mybutton : public QWidget
{
    Q_OBJECT
private:
    //存储按键显示的图片
    QPixmap pic;
public:
    explicit Mybutton(QWidget *parent = nullptr);

protected:
    //mousePressEvent: 处理鼠标按下事件
    void mousePressEvent(QMouseEvent *event) override;
    //leaveEvent: 处理鼠标离开按钮区域事件
    void leaveEvent(QEvent *event) override;
    //enterEvent: 处理鼠标进入按钮区域事件
    void enterEvent(QEvent *event) override;
    //paintEvent: 处理按钮绘制事件（自定义外观）
    void paintEvent(QPaintEvent *event) override;
signals:

};
```

- 可通过右击图片复制图片路径。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 133](/posts/qt-cpp-course-notes/image133.webp)

- 按键自定义函数设置

```cpp
//按键的初始化
Mybutton::Mybutton(QWidget *parent) : QWidget(parent)
{
    //将指定图片加载到QPixmap对象中
    pic.load(":/jishiben/c0.png");
    //pic.size(): 获取加载图片的尺寸（QSize 对象）
    //setFixedSize(): 设置按钮大小为图片的尺寸
    setFixedSize(pic.size());
    //触发paintEvent()事件，确保按钮立即绘制图片
    update();
}
```

```cpp
void Mybutton::mousePressEvent(QMouseEvent *event)
{
    pic.load(":/jishiben/c2.png");
    update();
}
void Mybutton::leaveEvent(QEvent *event)
{
    pic.load(":/jishiben/c0.png");
    update();
}
void Mybutton::enterEvent(QEvent *event)
{
    pic.load(":/jishiben/c1.png");
    update();
}
```

```cpp
void Mybutton::paintEvent(QPaintEvent *event)
{

    //#include <QPainter>
    //绘图控件为当前按键
    QPainter painter(this);
    //rect(): 获取按钮的矩形区域 （QRect 对象）
    //pic: 之前加载的QPixmap图片
    //作用: 将图片缩放至按钮大小并填充整个按钮区域
    painter.drawPixmap(rect(),pic);

}
```

- 选择Widget作为按键使用，通过提升选用按键类实现按键定义功能。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 137](/posts/qt-cpp-course-notes/image137.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 138](/posts/qt-cpp-course-notes/image138.webp)

### 69、使用自定义按键的信号与槽

- 自定义按键的信号与槽。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 139](/posts/qt-cpp-course-notes/image139.webp)

```cpp
Widget::Widget(QWidget *parent)
    : QWidget(parent)
    , ui(new Ui::Widget)
{
    ui->setupUi(this);
    connect(ui->Mybtn,&Mybutton::clicked,[=](){
        qDebug()<<"mybutton is clicked";
    });
}
```

> 图注：红框圈出 connect 语句——将 ui->Mybtn 的 clicked 信号连接到一个 lambda 函数，点击时通过 qDebug 输出 "mybutton is clicked"

```cpp
void Mybutton::mousePressEvent(QMouseEvent *event)
{
    pic.load(":/jishiben/c2.png");
    update();
    //当按钮被点击时触发信号
    emit clicked();
}
```

> 图注：红框圈住「//当按钮被点击时触发信号」与「emit clicked();」两行，旁边红字批注：需要触发信号才会有响应

### 70、事件重写实现滚轮放大缩小字体

- 创建QTextEdit的子类。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 142](/posts/qt-cpp-course-notes/image142.webp)

- 事件设计。

```cpp
class MyTextEdit : public QTextEdit
{
public:
    //对 MyTextEdit 对象进行初始化，并且把它放置到父窗口部件 parent 中。
    //在 Qt 的应用程序里，窗口部件之间通过父子关系构建成一个层级结构，
    //这样有助于实现资源管理和界面布局的功能。可以实现提升功能。
    MyTextEdit(QWidget *parent);
protected:
    //鼠标滚轮事件
    void wheelEvent(QWheelEvent *e) override;
    //Ctrl按键按下事件
    void keyPressEvent(QKeyEvent *e) override;
    //Ctrl按键松开事件
    void keyReleaseEvent(QKeyEvent *e) override;
private:
    //用于标记Ctrl键的状态
    bool ctrlKeyPressed = 0;
};

#endif // MYTEXTEDIT_H
```

```cpp
//处理鼠标滚轮事件，实现了 Ctrl + 滚轮 缩放文本 的功能
void MyTextEdit::wheelEvent(QWheelEvent *e)
{
    //正值表示向上滚动，负值表示向下滚动
    qDebug()<<e->angleDelta().y();
    //Ctrl按下后
    if(ctrlKeyPressed == 1)
    {
        //向上放大
        if(e->angleDelta().y()>0)
        {
            zoomIn();
        }
        //向下缩小
        else
        {
            zoomOut();
        }
        //标记事件已处理，阻止继续传播
        e->accept();
    }
    else
    {
        //调用基类实现，保持原有滚动功能
        QTextEdit::wheelEvent(e);
    }
}
```

```cpp
//捕获键盘按键被按下的事件
void MyTextEdit::keyPressEvent(QKeyEvent *e)
{
    //判断按下的是否为 Ctrl 键
    if(e->key() == Qt::Key_Control)
    {
        //qDebug()<<"ctrl Pressed";
        ctrlKeyPressed = 1;
    }
    QTextEdit::keyPressEvent(e);
}
//捕获键盘按键被松开的事件
void MyTextEdit::keyReleaseEvent(QKeyEvent *e)
{
    if(e->key() == Qt::Key_Control)
    {
        //qDebug()<<"ctrl Release";
        ctrlKeyPressed = 0;
    }
    QTextEdit::keyPressEvent(e);
}
```

![C++/Qt 网课学习笔记（社长嵌入式） 配图 146](/posts/qt-cpp-course-notes/image146.webp)

### 71、事件过滤器的方式实现滚轮按键放大

- 事件过滤器（Event Filter）：可以让你在事件达到目标对象之前进行拦截和处理。这是一种强大的机制，允许你在不同对象间共享事件处理逻辑或在父对象中集中处理特定事件。

- 事件派发 -\> 事件过滤-\>事件分发-\>事件处理。

- 事件过滤器方式实现滚轮放大缩小。

```cpp
Widget::Widget(QWidget *parent)
    : QWidget(parent)
    , ui(new Ui::Widget)
{
    ui->setupUi(this);
    //安装事件过滤器
    ui->textEdit->installEventFilter(this);
```

> 图注：红框圈出两行代码——注释「//安装事件过滤器」与「ui->textEdit->installEventFilter(this);」

```cpp
//实现事件过滤功能
//QObject *watched: 该参数指向的是正在被监控的对象，也就是事件原本要传递到的对象。
//QEvent *event: 这是一个指向事件对象的指针，
//事件对象中包含了事件的具体类型（像鼠标点击、键盘按键等）以及相关数据。
bool eventFilter(QObject *watched, QEvent *event) override;
```

```cpp
bool Widget::eventFilter(QObject *watched, QEvent *event)
{
    //当检测到鼠标滚轮滚动时
    if(event->type() == QEvent::Wheel)
    {
        //实时判断当前是否按下Ctrl键
        if(QGuiApplication::keyboardModifiers() == Qt::ControlModifier)
        {
            //类型强转
            //dynamic_cast:专门用于处理对象的多态性，只能用于指针和引用，且涉及对象类必须有虚函数。
            QWheelEvent *wheelEvent = dynamic_cast<QWheelEvent*>(event);
            if(wheelEvent->angleDelta().y()>0)
            {
                zoomIn();
            }
            else
            {
                zoomOut();
            }
            //若成功处理 Ctrl + 滚轮事件，返回 true 表示事件已被完全处理，不再继续传递。
            return true;
        }
        //若未按下 Ctrl 键，返回 false 让事件继续传递给目标控件。
        return false;
    }
}
```

### 72、记事本项目总结

## 2025-08-07

### 73、串口调试助手界面01

- 组框+文本编辑器+栅格布局

![C++/Qt 网课学习笔记（社长嵌入式） 配图 150](/posts/qt-cpp-course-notes/image150.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 151](/posts/qt-cpp-course-notes/image151.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 152](/posts/qt-cpp-course-notes/image152.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 153](/posts/qt-cpp-course-notes/image153.webp)

- 勾选框+线性文本框+按钮

![C++/Qt 网课学习笔记（社长嵌入式） 配图 154](/posts/qt-cpp-course-notes/image154.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 155](/posts/qt-cpp-course-notes/image155.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 156](/posts/qt-cpp-course-notes/image156.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 157](/posts/qt-cpp-course-notes/image157.webp)

- 改布局空间比例

![C++/Qt 网课学习笔记（社长嵌入式） 配图 158](/posts/qt-cpp-course-notes/image158.webp)

- 在 Qt Designer 中，如果删除了一个名为pushButton的按钮后，新建按钮无法使用相同名称，这是因为 Qt Designer 会自动维护对象名称的唯一性，即使原对象已删除，有时也会保留名称记录。可以直接退出重进即可解决。

### 74、串口调试助手页面完结

- 调整上下布局间距

![C++/Qt 网课学习笔记（社长嵌入式） 配图 159](/posts/qt-cpp-course-notes/image159.webp)

## 2025-08-08

### 75、串口助手添加参数选项

![C++/Qt 网课学习笔记（社长嵌入式） 配图 160](/posts/qt-cpp-course-notes/image160.webp)

- 查看QSerialPort的Public type可看到很多串口枚举。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 161](/posts/qt-cpp-course-notes/image161.webp)

### 76、串口调试助手自动检测串口号

- QSerialPortInfo，检测串口号。

```cpp
#include <QSerialPortInfo>
QT += serialport
```

> 图注：红色手写批注「使用时需包含」，指向被红框圈出的 Header 行（#include <QSerialPortInfo>）与 qmake 行（QT += serialport）。

```cpp
// 获取当前系统中所有可用的串口信息列表
QList<QSerialPortInfo> SerialList = QSerialPortInfo::availablePorts();
// 遍历每一个串口信息对象
for (QSerialPortInfo SerialInfo : SerialList)
{
    // 在调试控制台输出该串口的名称（如 COM3、ttyUSB0 等）
    qDebug() << SerialInfo.portName();
    // 将串口名称添加到界面上的下拉框控件 comboBox_serialnum 中
    ui->comboBox_serialnum->addItem(SerialInfo.portName());
}
```

### 77、串口调试助手打开串口

- 首先创建一个串口通信对象，接着将ui界面的数据获取到串口里面。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 164](/posts/qt-cpp-course-notes/image164.webp)

```cpp
private:
    Ui::Widget *ui;
    QSerialPort *serialPort;
```

> 图注：红框圈出的是新增的串口成员变量声明行 QSerialPort *serialPort;

![C++/Qt 网课学习笔记（社长嵌入式） 配图 166](/posts/qt-cpp-course-notes/image166.webp)

```cpp
//1、选择端口号：从下拉框comboBox_serialnum获取当前选中的文本作为串口名称并设置给serialPort
serialPort->setPortName(ui->comboBox_serialnum->currentText());

//2、配置波特率：从下拉框comboBox_borautrate获取当前选中的文本，转换为整数后设置为串口波特率
serialPort->setBaudRate(ui->comboBox_borautrate->currentText().toInt());

//3、配置数据位：从下拉框comboBox_databit获取当前选中的文本，转换为无符号整数后，
//   转换为QSerialPort::DataBits枚举类型并设置为串口数据位
serialPort->setDataBits(QSerialPort::DataBits(
                            ui->comboBox_databit->currentText().toUInt()));
```

```cpp
//4、配置校验位: 根据下拉框comboBox_checkout的当前选中索引, 通过switch语句设置不同的校验方式
//    0-无校验(NoParity), 1-偶校验(EvenParity), 2-标记校验(MarkParity)
//    3-奇校验(OddParity), 4-空格校验(SpaceParity), 默认-未知校验(UnknownParity)
switch(ui->comboBox_checkout->currentIndex()){
case 0:
    serialPort->setParity(QSerialPort::NoParity);
    break;
case 1:
    serialPort->setParity(QSerialPort::EvenParity);
    break;
case 2:
    serialPort->setParity(QSerialPort::MarkParity);
    break;
case 3:
    serialPort->setParity(QSerialPort::OddParity);
    break;
case 4:
    serialPort->setParity(QSerialPort::SpaceParity);
    break;
default:
    serialPort->setParity(QSerialPort::UnknownParity);
    break;
}
```

```cpp
//5、配置停止位：从下拉框comboBox_stopbit获取当前选中的文本，转换为无符号整数后，
//    转换为QSerialPort::StopBits枚举类型并设置为串口停止位
serialPort->setStopBits(QSerialPort::StopBits(
                                ui->comboBox_stopbit->currentText().toUInt()));

//6、流控：判断下拉框comboBox_fluidcontrol当前选中的文本是否为"None"，若是则设置为无流控制
if(ui->comboBox_fluidcontrol->currentText() == "None")
{
    serialPort->setFlowControl(QSerialPort::NoFlowControl);
}

//7、打开串口：尝试以读写模式(QIODevice::ReadWrite)打开串口，若成功则输出调试信息"serial open succes"
if(serialPort->open(QIODevice::ReadWrite))
{

    qDebug()<<"serial open succes";
}
```

### 78、串口调试助手实现自收自发功能

- 创建信号与槽函数，实现自收自发。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 170](/posts/qt-cpp-course-notes/image170.webp)

```cpp
    // 输出调试信息，显示发送成功及发送的具体内容
    qDebug()<<"Send Ok"<<sendData;
    // 将发送的数据追加到文本编辑控件textEditRecord中，用于记录发送历史
    // sendData是之前定义的const char*类型的发送数据指针
    // append()方法会自动在原有内容后添加新数据并换行
    ui->textEditRecord->append(sendData);
}

void Widget::on_SerialData_readytoRead()
{
    // 从串口读取所有可用数据，并将其存储在QString类型的revMessage变量中
    // readAll()方法会读取当前串口缓冲区中所有的数据，并返回一个QByteArray
    // 这里利用了QString的构造ctor可以直接接收QByteArray的特性进行隐式转换
    QString revMessage = serialPort->readAll();

    // 输出调试信息，显示接收到的消息内容
    qDebug()<<"getMessage:"<<revMessage;

    // 将接收到的消息追加显示到UI的textEditRev文本编辑控件中
    // append()方法会在现有内容末尾添加新内容，并自动换行
    ui->textEditRev->append(revMessage);
}
```

> 图注：红字批注「send函数中」指第一段红框内的代码位于 send 函数体内；两个红框分别框出 send 函数尾部代码与整个 on_SerialData_readytoRead 槽函数。

### 79、串口助手发送状态更新（截止，没有串口暂时看不到运行效果，以后再做程序为73-1）

### 147、天气预报项目概述

## 2025-08-09

### 148、天气预报界面-中部

- stylesheet当中指令border-radius: 10px;添加到样式表为边框圆弧化。

截图上方是一个标签为 "Format C:" 的红色圆角按钮。

The only issue remaining is that the button doesn't react （此处模糊）

```css
QPushButton#evilButton {
    background-color: red;
    border-style: outset;
    border-width: 2px;
    border-radius: 10px;
    border-color: beige;
    font: bold 14px;
    min-width: 10em;
    padding: 6px;
}
```

> 有 1 处无法确认

- 更改Widget比例。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 173](/posts/qt-cpp-course-notes/image173.webp)

- label可选择图片。图片装不下可勾选scaledContents。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 174](/posts/qt-cpp-course-notes/image174.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 175](/posts/qt-cpp-course-notes/image175.webp)

- 更改字体位置（靠左还是靠右，还是居中）。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 176](/posts/qt-cpp-course-notes/image176.webp)

- Ctrl+鼠标左键拖动：即可完成复制粘贴。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 177](/posts/qt-cpp-course-notes/image177.webp)

- 改大可以使图片紧凑（包含上、下、左和右）。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 178](/posts/qt-cpp-course-notes/image178.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 179](/posts/qt-cpp-course-notes/image179.webp)

- 调整中间间隙。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 180](/posts/qt-cpp-course-notes/image180.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 181](/posts/qt-cpp-course-notes/image181.webp)

- 调整上下间隙。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 182](/posts/qt-cpp-course-notes/image182.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 183](/posts/qt-cpp-course-notes/image183.webp)

### 149、天气预报界面-上部

### 150、天气预报界面-下部-空气-湿度

### 151、天气预报界面-下部

- 边框圆角设置（注意：使用边角时必须包含全框圆角代码）。

```css
color: rgb(255, 255, 255);
background-color: rgb(170, 170, 255);
border-radius: 7px;
border-bottom-right-radius: 0px;
border-bottom-left-radius: 0px;
```

> 图注：红色箭头分别从 border-radius: 7px;、border-bottom-right-radius: 0px;、border-bottom-left-radius: 0px; 三行指向手写批注「全框圆角」「右下边角」「左下边角」

```css
color: rgb(255, 255, 255);
background-color: rgb(170, 170, 255);
border-radius: 7px;
border-top-right-radius: 0px;
border-top-left-radius: 0px;
```

> 图注：红色箭头从 `border-top-right-radius: 0px;` 一行指向「右上边角」，从 `border-top-left-radius: 0px;` 一行指向「左上边角」

### 152、天气预报界面完成

- 固定尺寸和去边框代码。

```cpp
{
    ui->setupUi(this);
    //设置窗口的固定尺寸
    setFixedSize(550,990);
    //去除窗口边框
    setWindowFlag(Qt::FramelessWindowHint);
```

## 2025-08-10

### 153、天气预报重写鼠标右键事件-退出功能

- 创建菜单用于退出。

```cpp
protected:
    // 这是一个虚函数重写，用于处理鼠标按下事件
    void mousePressEvent (QMouseEvent *event);

private:
    Ui::Widget *ui;
    QMenu *menuQuit;
};
#endif // WIDGET_H
```
> 图注：红框框出两处——mousePressEvent 虚函数重写声明（含其上方注释行），以及成员变量声明 QMenu *menuQuit;

```cpp
// 创建一个 QMenu 对象，作为退出菜单，父对象为当前窗口
menuQuit = new QMenu (this);

// 创建一个 QAction 对象，设置其图标为 close.png，显示文本为 "退出"，父对象为当前窗口
QAction *closeAct = new QAction (QIcon (":/weather/weather_1/close.png"), tr ("退出"), this);
// 将创建的 QAction 添加到退出菜单中
menuQuit->addAction (closeAct);

// 连接菜单的 triggered 信号到匿名槽函数
// 当菜单中的动作被触发时，执行当前窗口的 close () 方法，关闭窗口
connect (menuQuit,&QMenu::triggered,this,[=]{
this->close ();
});
```

```cpp
// 重写 Widget 类的鼠标按下事件处理函数
void Widget::mousePressEvent (QMouseEvent *event)
{
    // 判断鼠标按下的是否是右键
    if (event->button () == Qt::RightButton)
    {
    // 调试输出语句，当前被注释掉
    //qDebug ()<<"right Mouse clicked!";

    // 在鼠标当前位置显示退出菜单
    // QCursor::pos () 获取当前鼠标在屏幕上的位置
    menuQuit->exec (QCursor::pos ());
}
```

### 154、天气预报重写鼠标移动事件-移动窗口

- 计算偏移量用于定位鼠标移动位置。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 190](/posts/qt-cpp-course-notes/image190.webp)

### 155、天气预报-天气数据来源方案

### 156、网络通信协议基本概念

### 157、天气预报-QtHttp编程-天气原始数据获得

- 请求之前记得在工程文件添加network和头文件。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 191](/posts/qt-cpp-course-notes/image191.webp)

\#include \<QCoreApplication\>

\#include \<QNetworkAccessManager\>

\#include \<QNetworkRequest\>

\#include \<QNetworkReply\>

\#include \<QObject\>

\#include \<QDebug\>

- void ***mouseMoveEvent***(QMouseEvent \*event) override;

当中override是什么意思？

![C++/Qt 网课学习笔记（社长嵌入式） 配图 192](/posts/qt-cpp-course-notes/image192.webp)

![C++/Qt 网课学习笔记（社长嵌入式） 配图 193](/posts/qt-cpp-course-notes/image193.webp)

- http协议请求与响应代码编写。

```cpp
// 创建网络访问管理器，生命周期跟随当前对象（Widget）
QNetworkAccessManager *manager = new QNetworkAccessManager(this);

// 连接 manager 的 finished 信号到 lambda，仅打印一条调试信息（对业务无实质作用）
connect(manager, &QNetworkAccessManager::finished, this, [](){
    qDebug() << "manager finish!=============";
});

// 构造两个 QUrl，分别对应 v9 和 v63 接口
QUrl urlItBoy("http://gfeljm.tianqiapi.com/api?unescape=1&version=v9&appid=29132936&appsecret=JV3FYmaV");
QUrl urlTianQi("http://gfeljm.tianqiapi.com/api?unescape=1&version=v63&appid=29132936&appsecret=JV3FYmaV");

// 创建网络请求对象，目标地址使用 urlItBoy
QNetworkRequest res(urlItBoy);

// 发起 GET 请求，返回的 reply 对象需要在头文件中声明为成员变量（QNetworkReply *reply）
reply = manager->get(res);

// 当网络响应结束时，调用 Widget::readHttpReply 槽函数读取返回数据
connect(reply, &QNetworkReply::finished, this, &Widget::readHttpReply);
```

```cpp
// 读取网络响应槽函数
void Widget::readHttpReply()
{
    // 一次性读取服务器返回的全部字节数据
    QByteArray data = reply->readAll();
    // 将 UTF-8 编码的字节数组转为 QString 并打印到调试输出
    qDebug() << QString::fromUtf8(data);
}
```

## 2025-08-13

### 158、天气预报-QtHttp编程-处理网络请求失败

- 网络请求失败（404）直接弹窗报错。

```cpp
//  获取HTTP响应状态码，如200表示成功，404表示未找到等
int resCode = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();

//  在调试输出中打印HTTP状态码
qDebug()<<resCode;

//  检查网络请求是否成功且状态码为200（HTTP_OK）
if(reply->error() == QNetworkReply::NoError && resCode == 200)
{
    //  一次性读取服务器返回的全部字节数据
    QByteArray data = reply->readAll();

    //  将UTF-8编码的字节数组转换为QString并打印到调试输出
    qDebug() << QString::fromUtf8(data);
}
```

```cpp
else
{
    // 注释：调试输出请求失败信息和错误描述
    //qDebug()<<"请求失败! "<<reply->errorString();

    // 注释：创建消息框的另一种方式（静态函数调用）
    //QMessageBox::warning(this,"错误","网络请求失败",QMessageBox::Ok);

    // 创建QMessageBox实例，用于显示错误信息
    QMessageBox mes;

    // 设置消息框的标题为"错误"
    mes.setWindowTitle("错误");

    // 设置消息框的显示文本为"网络请求失败"
    mes.setText("网络请求失败");

    // 为消息框中的按钮设置样式表，文字颜色为红色
    mes.setStyleSheet("QPushButton {color:red}");

    // 设置消息框的标准按钮为"确定"按钮
    mes.setStandardButtons(QMessageBox::Ok);

    // 以模态方式显示消息框，等待用户点击按钮
    mes.exec();
}
```

### 159、JSON概述

- JSON本质就是一个字符串。

### 160、JSON数据封装生成一个文件

- 封装数据写入文件当中。

```cpp
// 创建一个QJsonObject对象，用于存储JSON的键值对数据
QJsonObject rootObj;
// 向JSON对象中添加键值对：城市ID
rootObj["cityid"] = "1010100";
// 向JSON对象中添加键值对：日期数据
rootObj["data"] = "2025-08-13";
// 向JSON对象中添加键值对：天气状况
rootObj["weather"] = "雨夹雪";
// 向JSON对象中添加键值对：温度（数值类型）
rootObj["tmp"] = 3;

// 创建一个QJsonArray对象，用于存储数组数据
QJsonArray jsonArray;
// 向数组中添加字符串元素
jsonArray.append("data1");
jsonArray.append("data2");
jsonArray.append("data3");
// 向数组中添加数值元素（数组可以包含不同类型的元素）
jsonArray.append(100);

// 将数组作为一个键值对添加到根JSON对象中
rootObj["testArry"] = jsonArray;

// 创建QJsonDocument对象，用于处理JSON文档
QJsonDocument jsonDoc(rootObj);
// 将JSON文档转换为QByteArray格式（默认使用缩进格式）
QByteArray jsonArry = jsonDoc.toJson();
```

```cpp
// 创建QFile对象，指定要写入的JSON文件路径
QFile file("D:/QT/test.json");
// 以只写方式打开文件
file.open(QIODevice::WriteOnly);
// 将JSON数据写入文件
file.write(jsonArray);
// 关闭文件
file.close();
```

### 161、JSON数据封装加强理解和应用

- 添加更多数组。

```cpp
QJsonObject day0;
day0["day"] = "星期一";
day0["wea"] = "晴";
day0["tem"] = 5.7;

QJsonObject day1;
day1["day"] = "星期二";
day1["wea"] = "晴";
day1["tem"] = 7;

QJsonObject day2;
day2["day"] = "星期三";
day2["wea"] = "多云";
day2["tem"] = 5;

QJsonArray dayArray;
dayArray.append(day0);
dayArray.append(day1);
dayArray.append(day2);

rootObj["days"] = dayArray;
```

### 162、JSON数据解析

- 解析数据。

```cpp
// 创建QFile对象，指定要读取的JSON文件路径
QFile file("D:/QT/test.json");
// 以只读方式打开文件
file.open(QIODevice::ReadOnly);
// 读取文件中的所有数据到QByteArray中
QByteArray rawData = file.readAll();
// 关闭文件
file.close();

// 将读取到的原始数据解析为QJsonDocument对象
QJsonDocument jsonDoc = QJsonDocument::fromJson(rawData);
```

```cpp
// 检查JSON文档是否有效且为对象类型
if(!jsonDoc.isNull() && jsonDoc.isObject())
{
    // 获取JSON文档的根对象
    QJsonObject jsonRoot = jsonDoc.object();

    // 从根对象中获取"weather"字段的值（字符串类型）
    QString strW = jsonRoot["weather"].toString();
    // 从根对象中获取"tmp"字段的值（转换为整数类型）
    int tempretrue = jsonRoot["tmp"].toInt();
    // 从根对象中获取"cityid"字段的值（字符串类型）
    QString strCityId = jsonRoot["cityid"].toString();

    // 输出解析得到的天气、温度和城市ID信息
    qDebug() << strW;
    qDebug() << QString::number(tempretrue);
    qDebug() << strCityId;
```

```cpp
//  检查根对象中是否包含"testArry"字段且该字段为数组类型
if(jsonRoot.contains("testArry") && jsonRoot["testArry"].isArray())
{
    //  将"testArry"字段的值转换为QJsonArray
    QJsonArray testArray = jsonRoot["testArry"].toArray();
    //  遍历数组中的每个元素
    for(QJsonValue val : testArray)
    {
        //  获取当前元素的数据类型
        QJsonValue::Type t = val.type();
        //  根据元素类型进行不同处理
        switch(t){
            case QJsonValue::Double:
                //  如果是数字类型，转换为字符串并输出
                qDebug() << QString::number(val.toDouble());
                break;
            case QJsonValue::String:
                //  字符串类型（此处未处理，仅作为示例）
                break;
            case QJsonValue::Object:
                //  对象类型（此处未处理，仅作为示例）
                break;
            //  可以根据需要添加其他类型的处理
        }
        //  尝试将元素转换为字符串并输出（对于非字符串类型可能返回空）
        qDebug() << val.toString();
    }
}
```

```cpp
// 检查根对象中是否包含"alam"字段且该字段为对象类型
if(jsonRoot.contains("alam") && jsonRoot["alam"].isObject())
{
    QJsonObject alamObj = jsonRoot["alam"].toObject();
    qDebug()<<alamObj["alamLeve"].toString();
    qDebug()<<alamObj["alamTitle"].toString();
    qDebug()<<alamObj["alamType"].toString();
}
```

### 163、JSON数据解析-对象数组

- 对于对象里有数组的数据解析。

```cpp
// 检查JSON根对象中是否包含"days"字段，并且该字段是一个数组
if(jsonRoot.contains("days") && jsonRoot["days"].isArray())
{
    // 将"days"字段的值转换为QJsonArray类型，用于遍历
    QJsonArray dayArray = jsonRoot["days"].toArray();

    // 遍历数组中的每个元素（每个元素代表一天的天气信息）
    for(QJsonValue val : dayArray)
    {
        // 检查当前数组元素是否为JSON对象（确保数据格式正确）
        // 两种写法等价：val.type() == QJsonValue::Object 或 val.isObject()
        if(val.isObject())
        {
            // 将JSON值转换为QJsonObject，便于获取其中的字段
            QJsonObject obj = val.toObject();

            // 从对象中获取"day"字段（星期信息），转换为字符串并输出
            qDebug() << obj["day"].toString();
            // 从对象中获取"tem"字段（温度信息），转换为double后转为字符串输出
            qDebug() << QString::number(obj["tem"].toDouble());
            // 从对象中获取"wea"字段（天气状况），转换为字符串并输出
            qDebug() << obj["wea"].toString();
        }
    }
}
```

### 164、天气预报-刷新当天的天气数据

- 解析并读取天气数据。

```cpp
// 检查网络请求是否成功且状态码为200（HTTP_OK）
if(reply->error() == QNetworkReply::NoError && resCode == 200)
{
    // 一次性读取服务器返回的全部字节数据
    QByteArray data = reply->readAll();

    parseWeatherJsonData(data);

    // 将UTF-8编码的字节数组转换为QString并打印到调试输出
    qDebug() << QString::fromUtf8(data);
```

> 图注：红框圈出 `parseWeatherJsonData(data);` 这一行调用

```cpp
void Widget::parseWeatherJsonData(QByteArray rawData)
{
    QJsonDocument jsonObj = QJsonDocument::fromJson(rawData);
    if(!jsonObj.isNull() && jsonObj.isObject())
    {
        QJsonObject objRoot = jsonObj.object();
        //解析日期
        QString date = objRoot["date"].toString();
        QString week = objRoot["week"].toString();
        ui->labelCurrentDate->setText(date+"  "+week);
        //解析城市名称
        QString cityname = objRoot["city"].toString();
        ui->labelCity->setText(cityname+"市");
        //解析当前温度
        QString currentTemp = objRoot["tem"].toString();
        ui->labelTmp->setText(currentTemp+"℃");
        ui->labelTempRange->setText(objRoot["tem2"].toString()+"~"
                +objRoot["tem1"].toString()+"℃");
        //解析天气类型
        ui->labelWeatherType->setText(objRoot["wea"].toString());
        //感冒指数
        ui->labelGanbao->setText(objRoot["air_tips"].toString());
        //风向
        ui->labelFXType->setText(objRoot["win"].toString());
        //风力
        ui->labelFXData->setText(objRoot["win_speed"].toString());
        //PM2.5
        ui->labelPM25Data->setText(objRoot["air_pm25"].toString());
        //湿度
        ui->labelShiDuType->setText(objRoot["humidity"].toString());
        //空气质量
        ui->labelAirQualityData->setText(objRoot["air_level"].toString());
    }
}
```

### 165、天气预报-支持不同城市天气

- 获取城市编码，再将编码添加到网址后面，通过槽函数实现搜索不同城市天气功能。

```cpp
// 创建网络访问管理器，生命周期跟随当前对象（Widget）
manager = new QNetworkAccessManager(this);

strUrl = "http://gfeljm.tianqiapi.com/api?unescape=1&version=v61&appid=29132936&appsecret=JV3FYmaV";
QUrl urlTianQi(strUrl);

// 创建网络请求对象，目标地址使用 urlItBoy
QNetworkRequest res(urlTianQi);

// 发起 GET 请求，返回的 reply 对象需要在头文件中声明为成员变量（QNetworkReply *reply）
reply = manager->get(res);

// 当网络响应结束时，调用 Widget::readHttpReply 槽函数读取返回数据
connect(manager, &QNetworkAccessManager::finished, this, &Widget::readHttpReply);
```

```cpp
// 根据城市名称获取城市编码的函数，参数为城市名称字符串，返回值为城市编码字符串
QString getCityCodeFromName(QString name)
{
    // 创建QFile对象，指定要读取的JSON文件路径（这里使用资源文件路径）
    QFile file(":/citycode.json");
    // 以只读方式打开文件
    file.open(QIODevice::ReadOnly);
    // 读取文件的全部内容到QByteArray对象中
    QByteArray rawData = file.readAll();
    // 关闭文件
    file.close();

    // 将读取到的JSON数据转换为QJsonDocument对象
    QJsonDocument jsonDoc = QJsonDocument::fromJson(rawData);
    // 判断JSON文档是否为数组类型
    if(jsonDoc.isArray())
    {
        // 将JSON文档转换为QJsonArray对象，存储城市数据列表
        QJsonArray citys = jsonDoc.array();
        // 遍历城市数据数组中的每个元素
        for(QJsonValue val : citys)
        {
            // 判断当前元素是否为JSON对象
            if(val.isObject())
            {
                // 从JSON对象中获取"city_name"字段的值，作为城市名称
                QString cityName = val["city_name"].toString();
                // 比较当前城市名称与传入的城市名称是否一致
                if(cityName == name)
                {
                    // 若一致，返回该城市对应的"city_code"字段值
                    return val["city_code"].toString();
                }
            }
        }
        // 若遍历完所有城市都未找到匹配项，返回空字符串
        return "";
    }
```

```cpp
void Widget::on_LineEditCity_clicked()
{
    // 从UI的lineEditCity控件中获取用户输入的城市名称
    QString cityNameFromUser = ui->lineEditCity->text();

    // 调用自定义函数，根据用户输入的城市名称获取对应的城市编码
    QString cityCode = getCityCodeFromName(cityNameFromUser);

    // 检查是否成功获取到城市编码（不为空字符串）
    // 注意：QString判断非空应使用isEmpty()，原代码中!=NULL的写法不规范但可运行
    if(cityCode != NULL)
    {

        // 将城市编码拼接到底层URL字符串中，形成完整请求参数
        strUrl += "&cityid="+cityCode;

        // 通过网络管理器发送GET请求，请求地址为拼接后的完整URL
        manager->get(QNetworkRequest(QUrl(strUrl)));
    }
    else
    {
        // 创建QMessageBox实例，用于显示错误信息
        QMessageBox mes;
        // 设置消息框的标题为"错误"
        mes.setWindowTitle("错误");
        // 设置消息框的显示文本为"请输入正确的城市名称"
        mes.setText("请输入正确的城市名称");
        // 为消息框中的按钮设置样式表，文字颜色为红色
        mes.setStyleSheet("QPushButton {color:red}");
        // 设置消息框的标准按钮为"确定"按钮
        mes.setStandardButtons(QMessageBox::Ok);
        // 以模态方式显示消息框，等待用户点击按钮
        mes.exec();
    }
}
```

### 166、天气预报-QMap解决天气bug

- 引用QMap保存数据只需查找一次库即可。

```cpp
QString CityCodeUtils::getCityCodeFromName(QString cityName)
{
    if(CityMap.isEmpty())
    {
        InitCityMap();
    }
    QMap<QString,QString>::iterator it = CityMap.find(cityName);
    if( it == CityMap.end())
    {
        it = CityMap.find(cityName+"市");
        if( it == CityMap.end())
        {
            it = CityMap.find(cityName+"县");
        }
        if( it == CityMap.end())
        {
            it = CityMap.find(cityName+"区");
        }
        if( it == CityMap.end())
        {
            return "";
        }

    }
    return it.value();

}
```

```cpp
void CityCodeUtils::InitCityMap()
{
    QFile file(":/citycode.json");
    file.open(QIODevice::ReadOnly);
    QByteArray rawData = file.readAll();
    file.close();

    QJsonDocument jsonDoc = QJsonDocument::fromJson(rawData);
    if(jsonDoc.isArray())
    {
        QJsonArray citys = jsonDoc.array();
        for(QJsonValue val : citys)
        {
            if(val.isObject())
            {
                QString cityName = val["city_name"].toString();
                QString cityCode = val["city_code"].toString();
                CityMap.insert(cityName,cityCode);
            }
        }
    }
}
```

### 167-天气预报-支持天气图标刷新

- 创建qmap保存文件地址，然后解析获取地址。

>

![C++/Qt 网课学习笔记（社长嵌入式） 配图 213](/posts/qt-cpp-course-notes/image213.webp)

>

```cpp
// 根据keys,设置icon的路径
mTypeMap.insert("暴雪",":/res/type/BaoXue.png");
mTypeMap.insert("暴雨",":/res/type/BaoYu. png");
mTypeMap.insert("暴雨到大暴雨",":/res/type/BaoYuDaoDaBaoYu.png");
mTypeMap.insert("大暴雨",":/res/type/DaBaoYu.png");
mTypeMap.insert("大暴雨到特大暴雨",":/res/type/DaBaoYuDaoTeDaBaoYu.png");
mTypeMap.insert("大到暴雪",":/res/type/DaDaoBaoXue.png");
mTypeMap.insert("大雪",":/res/type/DaXue.png");
mTypeMap.insert("大雨",":/res/type/DaYu.png");
mTypeMap.insert("冻雨",":/res/type/DongYu.png");
mTypeMap.insert("多云",":/res/type/DuoYun.png");
mTypeMap.insert("浮沉",":/res/type/FuChen.png");
mTypeMap.insert("雷阵雨",":/res/type/LeiZhenYu.png");
mTypeMap.insert("雷阵雨伴有冰雹",":/res/type/LeiZhenYuBanYouBingBao.png");
mTypeMap.insert("霾",":/res/type/Mai.png");
mTypeMap.insert("强沙尘暴",":/res/type/QiangShaChenBao.png");
mTypeMap.insert("晴",":/res/type/Qing.png");
mTypeMap.insert("沙尘暴",":/res/type/ShaChenBao.png");
mTypeMap.insert("特大暴雨",":/res/type/TeDaBaoYu.png");
mTypeMap.insert("undefined",":/res/type/undefined.png");
mTypeMap.insert("雾",":/res/type/Wu.png");
```

>

```cpp
//解析天气类型
ui->labelWeatherType->setText(objRoot["wea"].toString());
ui->labelWeatherIcon->setPixmap(mTypeMap[objRoot["wea"].toString()]);
```
> 图注：红框圈出第三行，即通过 mTypeMap 以天气类型字符串为键取出图标并设置给 labelWeatherIcon 的那一行。

### 168、天气预报-获取7天天气数据

- 创建day类用于存储json数据，再通过解析读取到ui当中。

```cpp
class Day
{
public:
    Day();
    QString mDate;
    QString mWeek;
    QString mCity;
    QString mTemp;
    QString mTempLow;
    QString mTempHigh;
    QString mWeathType;
    QString mTips;
    QString mFix;
    QString mFl;
    QString mPm25;
    QString mHu;
    QString mAirq;

};
```

```cpp
void Widget::parseWeatherJsonDataNew(QByteArray rawData)
{
    QJsonDocument jsonDoc = QJsonDocument::fromJson(rawData);
    if(!jsonDoc.isNull() && jsonDoc.isObject())
    {
        QJsonObject jsonRoot = jsonDoc.object();
        days[0].mCity = jsonRoot["city"].toString();
        days[0].mPm25 = jsonRoot["aqi"].toObject()["pm25"].toString();
        if(jsonRoot.contains("data") && jsonRoot["data"].isArray())
        {
            QJsonArray weaArray = jsonRoot["data"].toArray();
            for(int i = 0;i < weaArray.size();i++)
            {
                QJsonObject obj = weaArray[i].toObject();
                //qDebug()<<obj["date"].toString()<<obj["wea"].toString();
                days[i].mDate = obj["date"].toString();
                days[i].mWeek = obj["week"].toString();
                days[i].mWeathType = obj["wea"].toString();
                days[i].mTemp = obj["tem"].toString();
                days[i].mTempLow = obj["tem2"].toString();
                days[i].mTempHigh = obj["tem1"].toString();
                days[i].mFx = obj["win"].toArray()[0].toString();
                days[i].mFl = obj["win_speed"].toString();
                days[i].mAirq = obj["air_level"].toString();
                days[i].mTips = obj["air_tips"].toString();
                days[i].mHu = obj["humidity"].toString();
            }
            updateUI();
        }
    }
}
```

```cpp
void Widget::updateUI()
{
    //解析日期
    ui->labelCurrentDate->setText(days[0].mDate+"  "+days[0].mWeek);
    //解析城市名称
    ui->labelCity->setText(days[0].mCity+"市");
    //解析当前温度
    ui->labelTemp->setText(days[0].mTemp+"℃");
    ui->labelTempRange->setText(days[0].mTempLow+"~"
            +days[0].mTempHigh+"℃");
    //解析天气类型
    ui->labelWeatherType->setText(days[0].mWeathType);
    ui->labelWeatherIcon->setPixmap(mTypeMap[days[0].mWeathType]);
    //感冒指数
    ui->labelGanbao->setText(days[0].mTips);
    //风向
    ui->labelFXType->setText(days[0].mFx);
    //风力
    ui->labelFXData->setText(days[0].mFl);
    //PM2.5
    ui->labelPM25Data->setText(days[0].mPm25);
    //湿度
    ui->labelShiDuData->setText(days[0].mHu);
    //空气质量
    ui->labelAirQualityData->setText(days[0].mAirq);

    ui->labelWeatherTypeDate0->setText(days[0].mWeathType);
    ui->labelWeatherTypeDate1->setText(days[1].mWeathType);
    ui->labelWeatherTypeDate2->setText(days[2].mWeathType);
    ui->labelWeatherTypeDate3->setText(days[3].mWeathType);
    ui->labelWeatherTypeDate4->setText(days[4].mWeathType);
    ui->labelWeatherTypeDate5->setText(days[5].mWeathType);
}
```

### 169、天气预报-更新七天天气UI显示

- 创建数组保存数据，通过遍历ui读取数据。

```cpp
public:
    Day  days[7];
    QList<QLabel  *>  mDateList;
    QList<QLabel  *>  mWeekList;
    QList<QLabel  *>  mIconList;
    QList<QLabel  *>  mWeaTypeList;
    QList<QLabel  *>  mAirqList;
    QList<QLabel  *>  mFxList;
    QList<QLabel  *>  mFlList;
```

> 图注：红框圈出的是 7 个 QList<QLabel *> 成员变量声明（mDateList、mWeekList、mIconList、mWeaTypeList、mAirqList、mFxList、mFlList）

```cpp
mWeekList<<ui->labelDay0<<ui->labelDay1
        <<ui->labelDay2<<ui->labelDay3
       <<ui->labelDay4<<ui->labelDay5;

mDateList<<ui->labelDate0<<ui->labelDate1
        <<ui->labelDate2<<ui->labelDate3
       <<ui->labelDate4<<ui->labelDate5;

mIconList<<ui->labelWeatherkon0<<ui->labelWeatherkon1
        <<ui->labelWeatherkon2<<ui->labelWeatherkon3
       <<ui->labelWeatherkon4<<ui->labelWeatherkon5;

mWeaTypeList<<ui->labelWeatherTypeDate0<<ui->labelWeatherTypeDate1
           <<ui->labelWeatherTypeDate2<<ui->labelWeatherTypeDate3
          <<ui->labelWeatherTypeDate4<<ui->labelWeatherTypeDate5;

mAirqList<<ui->labelAirQ0<<ui->labelAirQ1
        <<ui->labelAirQ2<<ui->labelAirQ3
       <<ui->labelAirQ4<<ui->labelAirQ5;

mFxList<<ui->labelFX0<<ui->labelFX1
      <<ui->labelFX2<<ui->labelFX3
     <<ui->labelFX4<<ui->labelFX5;

mFlList<<ui->labelFL0<<ui->labelFL1
      <<ui->labelFL2<<ui->labelFL3
     <<ui->labelFL4<<ui->labelFL5;
```

```cpp
for(int i=0 ;i < 6;i++)
{
    mWeekList[i]->setText(days[i].mWeek);
    mDateList[i]->setText(days[i].mDate);
    mIconList[i]->setPixmap(mTypeMap[days[i].mWeathType]);
    mWeekList[i]->setText(days[i].mWeathType);
    mAirqList[i]->setText(days[i].mAirq);
    mFxList[i]->setText(days[i].mFx);
    mFlList[i]->setText(days[i].mFl);
}
```

### 170、天气预报-优化上节课显示不好的地方

- 天气转换。

```cpp
int index = days[i].mWeathType.indexOf("转");
if(index!=-1)
{
    pixmap = mTypeMap[days[i].mWeathType.right(index)];
}
else
{
    pixmap = mTypeMap[days[i].mWeathType];
}
```

- 空气质量不同时，图片颜色与之相对应。

```cpp
QString airQ = days[i].mAirq;
mAirqList[i]->setText(airQ);
if(airQ == "优")
{
    mAirqList[i]->setStyleSheet("background-color: rgb(150,213,32);border-radius:7px;color:rgb(255,255,255)");
}
if(airQ == "良")
{
    mAirqList[i]->setStyleSheet("background-color: rgb(255,170,127);border-radius:7px;color:rgb(255,255,255)");
}
if(airQ == "轻度")
{
    mAirqList[i]->setStyleSheet("background-color: rgb(255,199,199);border-radius:7px;color:rgb(255,255,255)");
}
if(airQ == "中度")
{
    mAirqList[i]->setStyleSheet("background-color: rgb(255,17,17);border-radius:7px;color:rgb(255,255,255)");
}
if(airQ == "重度")
{
    mAirqList[i]->setStyleSheet("background-color: rgb(153,0,0);border-radius:7px;color:rgb(255,255,255)");
}
```

- 消掉最前面的2025年份，显示简略化，只显示后面的月份和日期。

```cpp
mWeekList[i]->setText(days[i].mWeek);
mWeekList[0]->setText("今天");
mWeekList[1]->setText("明天");
mWeekList[2]->setText("后天");
QStringList dayList = days[i].mDate.split("-");
mDateList[i]->setText(dayList.at(1)+"-"+dayList.at(2));
```

## 2025-08-15

### 171、用事件过滤器在子控件上绘图

### 172、天气预报-绘制7天高低温曲线图

### 173、天气预报-最终版本

## 2025-09-25

### 110、服务端建立连接

- 注意pro文件添加network。

![C++/Qt 网课学习笔记（社长嵌入式） 配图 225](/posts/qt-cpp-course-notes/image225.webp)

- Windows系统连接服务端指令：telnet 服务器地址 端口
