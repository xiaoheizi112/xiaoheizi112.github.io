+++
title = 'Python 基础'
date = '2026-10-01'
tags = ['Python']
draft = false
+++

# python基础常识：

## IDE使用基础操作：

按住crtl鼠标点击函数可查看函数说明。

## Python和pycharm的关系：

Python 是编程语言（解释器），让电脑拥有执行代码的能力

PyCharm 是代码编辑器（IDE），在 PyCharm 里写代码，点击运行，PyCharm 调用 Python 去执行程序

## Python解释器：

把 Python 代码翻译成电脑能懂的机器语言，然后执行的程序。

Python 是**解释型语言**，不是一次性全部编译成 exe，是**边翻译、边运行：**

Python 源码 → 解释器 → 字节码 → Python 虚拟机 → CPU 执行

和 C/C\+\+ 区别：C 是先完整编译成 exe 可执行文件，再直接运行；Python 每次运行都要经过解释器。

## pycharm快捷键操作：

Ctrl\+P：查看函数待输入参数的类型。

# Python基础语法：

## 注释：

单行：\#

多行：

```Python
"""
print("Hello world")
你好，世界
"""
```

## 运算：

取整数：z = x//y

求余数：z = x%y

x的y次方：z =x\*\*y

## 字符串赋值：

单行：

```Python
a = "你好"
```

多行：

```Python
b = """你好，
my friend
"""
```

多行注意：多行注释的时候会受到"""的干扰，所以要视情况而定多加"""。

输出引号：

```Python
\"haha\"
```

## 字符串占位符：

占位符：跟C语言一样，但是后面不需要逗号隔开，可以用括号括起来写在一起，例如：

```Python
str1 = "nihao"
str2 = 1.23
str3 = 123
print("占位符拼接：%s,%f,%d"%(str1,str2,str3))
```

## 字符串精度控制：

整数精度控制：百分号后面写n，那么输出时会从右往左控制在n个字符，英文数字以及汉字只占一个字符，例如：

```Python
x = 3.1415
print("%10s"%x)
```

输出：    3\.1415

小数点精度控制：只控制小数点后面位数为n，可以结合上面一起使用，例如：

```Python
x = 3.1415926
print("%.4f"%x)
```

输出：3\.1415

## 字符串格式符：

比字符串占位符更加直观写法：括号前加f，中间变量要加大括号，例如：

```Python
name = "小红"
age = 18
print(f"姓名：{name},年龄：{age}")
```

输出：姓名：小红,年龄：18

## 等待输入：

返回自己输入的值：

name = imput\(\)

## 比较运算符：

比较运算：最好用括号括起来，例如：

```Python
result = (x<=y)
result = (x!=y)
result = (x==y)
```

## 条件语句：

else if语句：

```Python
if x>y:
    print("x>y")
elif x<y:
    print("x<y")
```

## 条件循环：

while语句：

```Python
x = 5
y = 2
while(x>y):
    y = y+1
    print("%d"%y)
```

for循环语句：

```Python
min = 0 *#最小值*
max = 100 *#最大值*
step = 5 *#间隔*
*# range(起始,终止,步长)生成序列，依次赋值给变量i进行循环*
*# for循环中末尾值不会赋值，只会赋值到末尾的前一个*
for i in range(min, max,step): 
    print(i)
```

## 函数：

函数定义：例如：

```Python
def Myfunction(startNum,endNum):
    result = 0
    for i in range(startNum,endNum):
        result += i
    return result

a = Myfunction(1,4)
print(a)
```

## 函数说明：

函数说明：注意前面空格，写完后之后把鼠标移动到该函数时会自动弹出说明内容，例如：

```Python
def Myfunction(startNum,endNum):
    *"""*
*    这个函数用来累加指定区域的数值*
*    :param startNum:起始值*
*    :param endNum:末尾值*
*    :return:累加值*
*    """*
*    *result = 0
    for i in range(startNum,endNum):
        result += i
    return result
```

![image\.png](/posts/python-basics/image_17.png)

## 列表（list）：

列表：类似于C语言的数组，可以单维、多维，可以是数字、字符串和布尔类型等等，例如：

```Python
mylist = [1,"2",True]
print(mylist)
mylist = list()# 清空数组 
print(mylist)
mylist = [[1,2,3],["你好"],[True,False]]
print(mylist)
```

## 列表下标：

列表下标：默认是从0开始，和C语言一样，易语言是从1开始，正数是从左往右，负数是从右往左，例如：

```Python
mylist = [[1,2,3],["你好"],[True,False]]
print(mylist)
print(mylist[0][1],mylist[-1][1])
```

输出：
\[\[1, 2, 3\], \['你好'\], \[True, False\]\]
2 False

## 列表常用函数：

列表常用函数：例如：

```Python
myList.insert(0,4)  # 在索引0的位置插入数值4
print(myList)

myList.append(99)   # 在列表末尾追加数值99
print(myList)

newList = [5,6,7]
myList.extend(newList)  # 在列表末尾拼接另一个列表内所有元素
print(myList)

del myList[0]       # 删除索引为0的元素
print(myList)

result = myList.pop(2)  # 删除索引为2的元素，并将被删除元素返回赋值给result
print(myList)
print(result)

myList.remove(99)   # 删除列表中第一个值等于99的元素
print(myList)

myList.clear()      # 清空列表内所有元素
print(myList)

myList = [1,1,1,2,3,4,1]
print(myList.count(1)) # 统计列表中数值1出现的总次数

print(len(myList))     # 获取列表中元素的总个数
```

## range函数：

`range()` 是 Python 内置函数，用来**生成一串连续整数序列**，多用于搭配 for 循环。

### 使用方法：

1\.range \(结束值\)：默认从 **0** 开始，**取不到结束数字**（左闭右开）

```Python
range(5)   # 代表：0,1,2,3,4
```

2\.range \(起始值，结束值\)：从 start 开始，到 stop **之前停止**

```Python
range(2,6) # 2,3,4,5
```

3\.range \(起始，结束，步长\)：step = 每次增加多少，步长可以为负数（倒序）

```Python
range(1,10,2) # 1,3,5,7,9
list(range(5,0,-1)) # [5,4,3,2,1]
```

可以通过下标用来遍历列表：

```Python
myList = [10,20,30]
# len(myList)=3 → range(3) → 0,1,2
for i in range(len(myList)):
    print(i, myList[i])
```

## 元组（tuple）：

元组：使用方法跟列表差不多，len获取长度，for遍历，count统计出现次数，index查询元素下标等等，例如：

```Python
myTuple = (1,2,3)*#定义一个元组*
print(myTuple)

myTuple = tuple()*#定义空的元组*
print(myTuple)

myTuple = (1,)*#只有一个元素时，后面必须加逗号*
print(myTuple)
```

元组和列表的区别：

## 字符串常用函数（str）：

```Python
str = "  Hello World  "
print(str[0])*#正数从左往右*
print(str[-1])*#负数从右往左*

print(str.index("World"))*#查找在第几个后面*

print(str.replace("Hello", "你好"))*#替换字符串*

str.strip()   *# # 移除字符串首尾空白字符（空格、换行、制表符）*
str.lstrip()  *# l = left，只去除【左边】开头空白*
str.rstrip()  *# r = right，只去除【右边】结尾空白*
#括号里可以写字符，代表删除首尾匹配的字符（不再默认删空格）
s = "===hello===" 
print(s.strip("="))  # 输出 hello
s = "123abc321" 
print(s.strip("123")) # abc

print(str.count("l"))#计算出现“l”的个数
print(len(str))#计算字符个数（汉字也是一个）
```

## 序列切片（Sequence）：

序列：包含列表、元组、字符串，全都支持切片 

切片作用：从序列中截取一段数据，生成新序列。

序列\[start : end : step\]：左取右不取，取左边不取右边，step默认为1，也可以写负数进行反向截取，例如：

```Python
lst = [10,20,30,40,50]

print(lst[1:4])   # [20,30,40]  下标1、2、3
print(lst[:3])    # [10,20,30]  从头取到下标3之前
print(lst[2:])    # [30,40,50]  下标2一直取到最后
print(lst[:])     # [10,20,30,40,50] 完整复制序列

lst = [10,20,30,40,50]
print(lst[-3:])   # [30,40,50]
print(lst[:-2])   # [10,20,30]
print(lst[::-1])  # [50,40,30,20,10] 序列反转！
```

## 集合（set）：

集合是无序、不重复、可变的数据容器。

1. 元素唯一：自动去重

2. 无序：不能通过下标索引取值

3. 元素必须是不可变类型（int、str、tuple；不能存 list、dict、set）

4. 使用 `{}` 定义，空集合不能用 `{}`（空字典），要用 set \(\)

基础使用：

```Python
# 创建集合
s1 = {1, 2, 3, 3, 2}
print(s1)  # {1, 2, 3} 自动去重

s2 = set()       # 空集合 ✅
s3 = {}          # 空字典 ❌

# 列表转集合（常用去重）
lst = [1,1,2,2,3]
s4 = set(lst)
print(s4)
```

增删改查：

```Python
#添加元素
s = {1,2,3}
s.add(4)          # 添加单个元素，存在则不报错
s.update([5,6])   # 批量添加，接收可迭代对象
print(s)

#删除元素
s = {1,2,3,4}
s.remove(2)       # 删除指定元素，不存在会报错
s.discard(99)     # 删除指定元素，不存在不报错（推荐）
s.pop()           # 随机删除一个元素（无序，无法指定）
s.clear()         # 清空集合

#查询：集合不支持索引**s[0]，**只能用 in 判断元素是否存在：
s = {1,2,3}
print(2 in s)      # True
print(5 not in s)  # True
```

集合运算：

```Python
a = {1,2,3,4}
b = {3,4,5,6}

# 并集 | ：两者所有元素，去重
print(a | b)   # {1,2,3,4,5,6}
print(a.union(b))

# 交集 & ：两边都存在的元素
print(a & b)   # {3,4}
print(a.intersection(b))

# 差集 - ：a有、b没有
print(a - b)   # {1,2}
print(a.difference(b))

# 对称差集 ^ ：只在一边出现的元素
print(a ^ b)   # {1,2,5,6}
print(a.symmetric_difference(b))
```

集合推导式：

格式：`{表达式 for 变量 in 可迭代对象 if 条件}`

```Python
# 获取列表中大于2的数字，去重
lst = [1,2,2,3,4,4,5]
res = {x for x in lst if x > 2}
print(res)# {3,4,5}
```

## 字典（dict）：

字典：由键 \(key\) : 值 \(value\) 成对组成的可变容器

- Python3\.7\+：字典插入有序（记住写入顺序）

- 不属于序列！不支持数字索引、切片

- 核心查找方式：通过 key 找 value

- 语法：`{k1:v1, k2:v2}`

注意：

1. `{}` → 空字典；`set()` → 空集合，千万不要搞混！

2. 字典不是序列，不能 `d[0]` 按数字索引取值，只能用 key

创建字典：

```Python
# 方式1：大括号
d1 = {"name":"小明", "age":18, "gender":"男"}

# 空字典（注意：{}是空字典，不是空集合！）
d2 = {}

# 方式2：dict()
d3 = dict(name="小红", age=20)

# 方式3：可迭代对象构建
d4 = dict([("a",1), ("b",2)])
print(d4) # {'a': 1, 'b': 2}
```

键 \(key\) 的硬性规则：

- key 必须是不可变类型（可哈希） ：

✅ 允许：`int`、`str`、`tuple`（元组内不能有可变对象） 

❌ 禁止：`list`、`set`、`dict` 当 key

- key 唯一，不能重复 如果写重复键，后面的值会覆盖前面：

```Python
d = {"a":1, "a":99}
print(d) # {'a': 99}
```

- value 没有限制，可以是任意类型（列表、字典、集合都行）

增删改查：

```Python
student = {"name":"小李", "age":17}

#查询
# 方式1：[] 获取，key不存在直接报错
print(student["name"])

# 方式2：get() 【推荐】不存在返回None，不会崩溃
print(student.get("age"))
print(student.get("score", 0)) # key不存在，返回默认值0

# 添加/修改：key 存在 → 修改值；key 不存在 → 新增键值对
student["age"] = 18       # 修改
student["score"] = 95     # 新增

# 删除
# pop(key) 删除指定key，返回对应值；不存在可设置默认值
student.pop("score")

# popitem() 删除最后插入的一组键值对（3.7+有序）
student.popitem()

# del 删除
del student["age"]

# clear() 清空所有内容
student.clear()
```

三大常用方法：keys \(\) /values \(\) /items \(\)：

```Python
d = {"a":1, "b":2, "c":3}

print(d.keys())    # 所有键 dict_keys(['a','b','c'])
print(d.values())  # 所有值 dict_values([1,2,3])
print(d.items())   # 所有键值对元组 dict_items([('a',1),...])

# 字典遍历
# 遍历key
for k in d:
    print(k, d[k])# a 1 b 2 c 3

# 同时拿到 key 和 value（开发高频写法）
for k, v in d.items():
    print(f"{k} = {v}")
```

其他实用方法：

```Python
d1 = {"a":1, "b":2}
d2 = {"b":99, "c":3}

# update() 批量合并/更新字典
d1.update(d2)
print(d1) # {'a':1, 'b':99, 'c':3}

# setdefault(key, 默认值)
# key存在：不修改，返回原值；不存在：新增key并赋值
d1.setdefault("d", 100)
```

字典推导式：

格式：`{k表达式:v表达式 for ... if ...}`

```Python
# 示例：快速生成字典
dic = {i:i*2 for i in range(1,5)}
print(dic) # {1:2, 2:4, 3:6, 4:8}

# 键值互换（注意：值不能重复）
old = {"a":1, "b":2}
new = {v:k for k,v in old.items()}
```

嵌套字典（日常开发非常多见）：

```Python
info = {
    "student1": {"name":"张三", "age":16},
    "student2": {"name":"李四", "age":17}
}
# 取值
print(info["student1"]["name"])
```

## 容器类型转换通用函数：

核心四个构造函数： `list()`、`tuple()`、`set()`、`dict()`

> 注意：所有转换函数接收**可迭代对象**作为参数
> 
> 

1. list \(\) → 转为列表：

```Go
# 元组 → 列表
t = (1,2,3)
lst = list(t)
print(lst) # [1,2,3]

# 字符串 → 列表（拆分每个字符）
s = "python"
print(list(s)) # ['p','y','t','h','o','n']

# 集合 → 列表（无序，顺序不确定）
se = {10,20,30}
print(list(se))

# 字典传入list()：只提取key
d = {"a":1,"b":2}
print(list(d)) # ['a','b']
print(list(d.values())) # [1,2]
print(list(d.items())) # [('a',1),('b',2)]
```

2. tuple \(\) → 转为元组：规则和 list \(\) 几乎一致

```Python
lst = [1,2,3]
t = tuple(lst)
print(t) # (1,2,3)

# 字符串转元组
print(tuple("hi")) # ('h','i')

# 字典转元组，同样只拿键
d = {"x":1,"y":2}
print(tuple(d)) # ('x','y')
```

3. set \(\) → 转为集合（自动去重、打乱顺序）：集合元素必须可哈希

```Python
lst = [1,1,2,2,3]
s = set(lst)
print(s) # {1,2,3}

# 字符串转集合
print(set("aabbcc")) # {'a','b','c'}

# 字典转集合：只保留key
d = {"a":1,"b":2}
print(set(d)) # {'a','b'}
```

4. dict \(\) → 转为字典【特殊！限制最多】：只能接收**成对可迭代对象**（嵌套二元序列）

```Python
# 方式1：列表嵌套元组
data = [("name","张三"),("age",18)]
d = dict(data)
print(d) # {'name': '张三', 'age': 18}

# 方式2：关键字参数
d2 = dict(name="李四", age=20)

# ❌错误示范：不能直接 list/tuple/set 丢进去
# dict([1,2,3]) 报错！无法构成键值对

# 常用：items() 转字典
lst_item = [("a",1),("b",2)]
print(dict(lst_item))
```

### 转换总结：

① 普通序列互转 list ↔ tuple ↔ set

✅ list \(\) /tuple \(\)：保留重复元素 ✅ set \(\)：**去重 \+ 无序**

② 字典参与转换重要规律

```Python
d = {"a":1, "b":2}
list(d)        # 只取 key
tuple(d)       # 只取 key
set(d)         # 只取 key

list(d.items()) # [(k,v),(k,v)] 键值对元组
dict(list(d.items())) # 还原字典
```

③ 不能实现的转换

1. **不能直接把普通列表 ****`[1,2,3]`**** 转字典**，缺少 value

2. **集合不能转字典**：集合无序且无法保证两两配对

3. 可变对象 \(list、dict\) 不能放进 set，否则报错

## 五大容器完整总结：

先理清两大分类：

> **序列**：有序、支持数字索引、切片
> 
> **非序列**：不支持数字索引、不能切片
> 
> 

重点区分两个大括号： `{}` → **空字典**`set()` → **空集合**

适用场景（开发怎么选）：

1. 需要有序、可修改、允许重复 → **list**

2. 数据固定不修改、作为函数返回、保护数据 → **tuple**

3. 文本数据存储 → **str**

4. 去重、交集并集、成员快速查找 → **set**

5. 根据名字 \(key\) 查找对应数值，映射关系 → **dict**

## 函数多返回值：

函数多返回值：

```Python
def myReturn():
    return 1,2*# 多返回值*

value1,value2 = myReturn()*# 可依次接收*
print(value1,value2)
```

## 函数关键字传参：

调用函数时指定 `形参名=值` 传参，不用遵守参数先后顺序。

函数关键字传参：

```Python
def myFunction(name,age,height):
    print(f"""姓名：{name},
    年龄：{age},
    身高：{height}""")

myFunction("张三",20,178)
myFunction(height = 190,name = "李四",age = 18)*# 可以手动指定顺序传承的*
```

输出：

姓名：张三,

年龄：20,

身高：178

姓名：李四,

年龄：18,

身高：190

## 函数参数缺省（sheng）值：

定义函数时给参数预先设好默认值，调用不传该参数就自动使用默认值。

函数参数缺省值：

```Python
def myFunction(name,age,height,Nation = "China"):
    print(f"""姓名：{name},
    年龄：{age},
    身高：{height}
    国家：{Nation}""")

myFunction("张三",20,178)*# 可以缺参*
myFunction("张三",20,178,"英国")
```

输出：

姓名：张三,

年龄：20,

身高：178

国家：China

姓名：张三,

年龄：20,

身高：178

国家：英国

## print函数：

打印单个内容：字符串必须加引号（单 / 双引号都行）

```Python
print("Hello Python")
print(123) 
print(3.14)
```

打印多个内容，逗号隔开：多个内容默认用**空格**分隔

```Python
print("姓名", "张三", "年龄", 20) # 输出：姓名 张三 年龄 20
```

sep 参数：自定义分隔符

```Python
# 用 - 分隔
print(2026, 8, 17, sep="-")
# 输出：2026-8-17

# 空字符分隔，紧挨着输出
print("a", "b", "c", sep="")
# 输出：abc
```

end 参数：修改结尾符号，默认 `end="\n"`，打印完自动换行

```Shell
# 不换行，结尾用空格
print("加载中", end=" ")
print("完成")
# 输出：加载中 完成

# 结尾用 >>>
print("测试", end=">>>")
```

格式化输出（常用写法）：

方式 1：f\-string（Python3\.6\+ 推荐，最简单）

```Python
name = "小明"
age = 18
print(f"名字：{name}，年龄：{age}")
```

方式 2：% 格式化（老式写法）

```Python
print("名字：%s，年龄：%d" % (name, age))
```

转义字符搭配 print

- `\n` 换行

- `\t` 制表符（相当于 Tab）

- `\\` 输出反斜杠

```Python
print("第一行\n第二行")
print("姓名\t年龄")
```

## 函数不定长参数：

`*args` 收集一堆位置参数打包成元组，`**kwargs` 收集一堆关键字参数打包成字典； 调用函数： `*`拆开序列、`**`拆开字典传参。

\*args：接收**任意多个位置参数**，打包成 **元组**

```Python
def fun(*args):
    print(args)

fun(1)
fun(1,2,3)
# 输出
# (1,)
# (1, 2, 3)
```

\*\*kwargs：接收**任意多个关键字参数 key=value**，打包成 **字典**

```Python
def fun(**kwargs):
    print(kwargs)

fun(name="张三", age=18)
# {'name': '张三', 'age': 18}
```

混合使用【固定顺序】：顺序：\*\* 普通参数 → \*args → **kwargs**

```Python
def fun(a, b, *args, **kwargs):
    print(a,b,args,kwargs)

fun(10,20,30,40,name="李四")
# 10 20 (30, 40) {'name': '李四'}
```

单独 `*` 分隔符：`*` 后面的参数**必须用关键字传参**

```Python
def fun(a, b, *, c):
    print(a,b,c)

fun(1,2,c=3) # ✅
# fun(1,2,3)  ❌报错
```

### 调用函数时：\* 和 \*\* 是拆包：

`*列表/元组`：拆成位置参数

```Python
def fun(*args):
    print(args)
lst = [1,2,3]
fun(*lst) # fun(1,2,3)
```

`**字典`：拆成关键字参数

```Python
def fun(**kwargs):
    print(kwargs)
dic = {"x":1, "y":2}
fun(**dic) # fun(x=1,y=2)
```

## 函数以函数传参：

将函数名作为实参传入，内部通过 `()` 执行收到的函数。

```Python
def add(x,y):*#加法*
*    *return x+y
def sub(x,y):*#减法*
*    *return x-y
def myFuc(add,sub):*#两个函数同作为参数*
*    *return add(1,2)+sub(3,4)

print(myFuc(add,sub))
```

## 函数匿名函数传参：

lambda 快速创建临时函数，直接作为实参传给高阶函数，省去单独 def 定义。

**lambda = 匿名函数（一句话函数）**，不用`def`定义，适合临时传入当参数

```Python
def myFunction(add,sub):
    result = add(1,2) + sub(3,4)
    return result

# 传入两个lambda匿名函数当作参数
print(myFunction(lambda x,y:x+y,lambda x,y:x-y))
```

## 文件操作：

### 打开文件：

打开文件：中文文件一定要加 `encoding="utf-8"`，否则乱码。操作完文件必须关闭，优先使用 `with`

```Python
# 方式1：传统写法（记得手动close）
f = open("test.txt", "r", encoding="utf-8")
data = f.read()
f.close()

# 方式2：with 上下文管理器【推荐！自动关闭文件】
#不用写 close()，代码块结束自动释放文件，防止资源泄露
#相当于临时打开文件，不会全局占用文件
with open("test.txt", "r", encoding="utf-8") as f:
    data = f.read()
```

文件打开模式选择：`w` 模式打开瞬间清空文件，谨慎使用

### 读取文件：

读取文件：

```Python
with open("test.txt","r",encoding="utf-8") as f:
    content = f.read()        # 一次性读取全部内容，里面填数字对应读取多少字符
    line1 = f.readline()      # 读取一行
    lines = f.readlines()     # 读取所有行，放入列表
```

### 写入文件：

写入文件：write写入会覆盖原有内容。不要忘记换行符 `\n`，文字不会自动换行

```Python
# w 覆盖写入
with open("test.txt","w",encoding="utf-8") as f:
    f.write("第一行文字\n")

# a 追加写入
with open("test.txt","a",encoding="utf-8") as f:
    f.write("新增一行\n")
```

完整的写入操作流程：write 写入缓冲区；flush 强制刷入磁盘；close 刷新数据并关闭释放文件。

```Python
file.write("你好！认识你很高兴！")
file.flush()
file.close()
```

### 异常：

异常捕获：异常走 except，无异常走 else，有无异常 finally 都执行。

```Python
def such():
    print("")

try:
    such()
except:
    print("代码有错误！")
else:
    print("程序没有异常！")
finally:
    print("程序无论正常与否，都会执行！")
```

## 模块基础认识：

导入系统模块：

```Python
import time# 前面加import表示要引用的模块
print ("1")
time.sleep(2)
print("2")
```

模块指定导入：指定模块中的某个函数单独使用或者加\*号使用全部函数：

也可以是从MOD包（文件夹）指定导入子模块：

```Python
from time import sleep# 只从time模块中导入sleep这一个函数
print ("1")
sleep(2)
print("2")

from time import *# 使用time模块中的全部函数

# 从 MOD 包，导入子模块 MyMod
from MOD import MyMod
MyMod.xxx()

# 导入多个对象
from MOD import MyMod, test

# 导入模块内所有内容（不推荐）
from MOD import *
```

模块别名：

```Python
import time as ttt*# 给time模块起别名为ttt，导入并重命名（解决名字冲突）*
print("Hello World")
ttt.sleep(1)
print("你好，世界")

# 给time模块里的sleep函数起别名
from time import sleep as 睡觉
print("1")
睡觉(1)
print("2")
```

自定义模块：

1\.选择项目文件。

![image\.png](/posts/python-basics/image_5.png)

2\.打开项目文件，在根文件夹右键单击选择新建python文件。

![image\.png](/posts/python-basics/image_2.png)

3\.自定义模块命名，然后在里面写需要的相关函数。

![image\.png](/posts/python-basics/image_15.png)

4\.同文件夹下可直接通过import直接调用模块使用。

![image\.png](/posts/python-basics/image_7.png)

## 模块类别详解：

模块\_\_main\_\_：只执行测试文件时会加载出来执行，被别人导入时不会运行，通常用于测试文件的代码测试，

```Python
# 判断当前模块是否为主程序入口
# 当直接运行本py文件时，__name__的值为字符串'__main__'，条件成立
# 如果该文件被其他脚本import导入，条件不成立，内部代码不会执行
if __name__ == '__main__':
    print("模块已加载！！！")

def add(x,y):
    return x+y
```

模块\_\_all\_\_：代表一个**列表变量**，写在模块（`.py`）或者包的 `init.py` 中，用来规定： **`from 模块 import *`**** 时，哪些名称会被导出**。

```Python
# tool.py
__all__ = ["add", "MyMod"]  # 限定 * 只能导入这两个

def add(x, y):
    return x + y

def sub(x, y):
    return x - y

class MyMod:
    pass

# 下划线开头约定为内部私有函数
def _private_func():
    print("内部函数")
```

```Python
# main.py
from tool import *# 只有在主程序用*号条件下才能使用指定导入的函数

print(add(1,2))
obj = MyMod()
# print(sub(3,1))  # NameError！sub不在__all__里，import*导入不到
# _private_func() # 同样访问不到
```

## 包的基础认识（存放模块的专用文件夹）：

**模块**：单个 `.py` 文件 

**包**：存放多个模块的文件夹，必须包含 `init.py`，把一堆相关模块组织在一起。

总结：**包 = 带 ****`init.py`**** 的文件夹**，用来管理大量 py 文件，避免名字冲突。

目录结构示例：

```Plain Text
mypack/              # 包名 mypack
    __init__.py      # 关键文件，标识这是Python包
    mod_a.py         # 模块A
    mod_b.py         # 模块B
main.py              # 外部主程序
```

创建教程：

![image\.png](/posts/python-basics/image_11.png)

![image\.png](/posts/python-basics/image.png)

### 包和库的关系：

1. **包 \(package\)**：文件夹，包含多个 py 文件 \+`init.py`

2. **库 \(library\)**：功能集合，可以由单个模块、也可以由一个 / 多个包组成

## python安装第三方库：

### 在cmd安装：

1\.安装

```Plain Text
pip install 库名
pip install -i 镜像源 库名
```

2\.卸载

```Plain Text
pip uninstall 库名
```

python 镜像源（如果不行直接问AI）:

1. [https://pypi\.douban\.com/simple/](https://link.wtturl.cn/?target=https%3A%2F%2Fpypi.douban.com%2Fsimple%2F&scene=im&aid=582478&lang=zh) 豆瓣

2. [https://mirrors\.aliyun\.com/pypi/simple/](https://link.wtturl.cn/?target=https%3A%2F%2Fmirrors.aliyun.com%2Fpypi%2Fsimple%2F&scene=im&aid=582478&lang=zh) 阿里

3. [https://pypi\.hustunique\.com/simple/](https://link.wtturl.cn/?target=https%3A%2F%2Fpypi.hustunique.com%2Fsimple%2F&scene=im&aid=582478&lang=zh) 华中理工大学

4. shturl\.cc/ccb3iCkrdLoFwObXqSonDI6i 山东理工大学

5. [https://pypi\.mirrors\.ustc\.edu\.cn/simple/](https://link.wtturl.cn/?target=https%3A%2F%2Fpypi.mirrors.ustc.edu.cn%2Fsimple%2F&scene=im&aid=582478&lang=zh) 中国科学技术大学

6. [https://pypi\.tuna\.tsinghua\.edu\.cn/simple](https://link.wtturl.cn/?target=https%3A%2F%2Fpypi.tuna.tsinghua.edu.cn%2Fsimple&scene=im&aid=582478&lang=zh)/ 清华

3\.配置镜像源：

```Plain Text
pip config set global.index-url 镜像源
```

示例：

```Python
install -i https://pypi.tuna.tsinghua.edu.cn/simple/ xpinyin
```

取消设置：

```Plain Text
pip config unset global.index-url
```

### 在pycharm安装：

![image\.png](/posts/python-basics/image_1.png)

![image\.png](/posts/python-basics/image_12.png)

## 类和对象：

```Python
class person:# 创建类
    name = "zhangsan"
    age = 18
    height = 178

Myperson = person()*# 创建类的对象*
print(Myperson.age)

Myperson.age = 20*# 可以修改类的成员*
print(Myperson.age)
```

## 类的方法（成员函数）：

```Python
# 定义一个person类
class person:
    # 类属性：属于person类本身，所有实例对象共享
    name = "zhangsan"
    age = 18
    height = 178

    # 通过self.属性 = 值，是给实例创建实例属性，类似于C语言的this指针指向该实例对象
    def function(self,a):
        # 给【实例对象】新增/修改实例属性height
        # 注意：这里self.height是实例属性，会屏蔽上面的类属性height，不会修改类本身的height
        self.height = a

# 实例化，创建person类的对象Myperson
Myperson = person()

# 调用实例方法，传入实参170；python自动把Myperson传给self
Myperson.function(170)

# 打印对象Myperson的实例属性height，输出170
print(Myperson.height)
```

## 类\_\_init\_\_（构造函数，初始化的内置方法）：

```Python
# 定义person类
class person:
    # 这里写的是【类属性】，写在方法外面，属于person类
    name = ""
    age  = 0
    height = 0

    # 构造方法，实例化对象的时候自动调用
    # self：即将创建出来的实例对象；name/age/height：传入的参数
    def __init__(self, name, age, height):
        # self.name 是【实例属性】，赋值给当前对象
        # 会屏蔽上面同名的类属性，类属性值不会改变
        self.name = name
        self.age = age
        self.height = height

# 实例化对象，自动执行__init__，把括号里参数传给构造方法
Myperson = person("zhangsan",1,2)

# 读取实例对象Myperson的实例属性name，输出 zhangsan
print(Myperson.name)
# 读取实例对象Myperson的实例属性age，输出 1
print(Myperson.age)
# 读取实例对象Myperson的实例属性height，输出 2
print(Myperson.height)
```

## 类\_\_str\_\_：

作用：控制 **print \(对象\)**、`str(对象)` 的输出内容，返回字符串。 如果不写`str`，打印对象会输出默认的内存地址格式。

规则：

1. 方法名固定 `str`

2. 参数必须带 `self`

3. **必须 return 一个字符串，不能 print！**

4. print \(对象\)、str \(对象\) 会自动调用这个方法

```Python
class Person:
    def __init__(self,name,age):
        self.name = name
        self.age = age

    # 重写__str__魔法方法
    def __str__(self):
        # return 返回自定义字符串
        return f"Person对象：姓名={self.name}，年龄={self.age}"

p = Person("张三",18)
print(p)          # print对象 → 自动调用 __str__
s = str(p)        # str()转换，自动调用 __str__
print(s)
```

## 类**\_\_name\_\_：**

作用：写测试代码！写函数 / 类的时候，把自测代码放`if name == "main":`里面，别人导入你的模块不会乱执行测试逻辑。

```Python
# test.py
def add(a,b):
    return a+b

# 只有直接运行本文件，下面代码才执行；被import导入时，这段不会跑
if __name__ == "__main__":
    print(add(1,2))
```

## 类私有：

变量前面加双下划线变成私有属性，方法也一样适用。

```Python
class Person:
    def __init__(self, name, age):
        self.name = name          # 公有属性
        self.__age = age          # 双下划线开头：私有实例属性

    # 双下划线开头：私有方法
    def __secret_info(self):
        """私有方法，只能在类的内部调用"""
        return f"我的秘密年龄：{self.__age}"

    # 公有方法，类内部可以访问私有属性、私有方法
    def show(self):
        # 类内部可以直接使用 __age、调用 __secret_info()
        print(self.__age)
        print(self.__secret_info())


# 创建实例对象
p = Person("张三", 22)

# 1.访问公有属性，正常
print(p.name)

# 2.直接访问私有属性，报错
# print(p.__age)

# 3.直接调用私有方法，报错
# p.__secret_info()

# 4.通过公有方法，间接使用私有属性、私有方法
p.show()

# --------------------
# 注意：Python不是真私有，名字改写，可以强行访问（不推荐写业务代码）
# --------------------
print(p._Person__age)         # 强行读取私有属性
print(p._Person__secret_info())# 强行调用私有方法
```

## 类继承：

> **子类继承父类，子类直接拥有父类的属性和方法，还可以自己新增、重写**。
> 
> 

- **父类（基类）**：被继承的类

- **子类（派生类）**：去继承别人的类

单继承：

```Python
# 父类
class Person:
    def __init__(self,name,age):
        self.name = name
        self.age = age

    # 父类的实例方法
    def say(self):
        print(f"我叫{self.name}，{self.age}岁")

# Student子类，继承Person父类
class Student(Person):
    pass   # 暂时不写任何代码，直接复用父类全部东西

# 实例化子类，用父类的__init__
s1 = Student("小明",16)
# 子类对象直接使用父类的属性、方法
print(s1.name)
s1.say()
```

多继承：

```Python
class A:
    def func_a(self):
        print("A")

class B:
    def func_b(self):
        print("B")

# C同时继承A和B
class C(A,B):
    pass

c = C()
c.func_a()
c.func_b()
```

## 类pass：

`pass` 是空语句，占位符，什么都不做，只是占一个语法位置。

在类中使用pass：

```Python
# 定义类，暂时不写任何属性、方法，用pass占位
class Person:
    pass   # pass：什么都不干，仅仅补齐语法，类可以正常创建

# 可以正常实例化对象
p = Person()
print(p)
```

在方法中使用pass：

```Python
class Person:
    def test(self):
        pass #方法暂时不写逻辑，占位

p = Person()
p.test() #调用，什么也不会输出，不会报错
```

## 类继承优先级：

当子类多继承，多个父类有同名方法 / 属性，Python 按照 MRO 列表顺序，**从左往右依次查找，找到第一个就停止**。

单继承：子类\-》父类，父类\-》父类的父类，查找顺序：`C → B → A`，找到就返回。

```Python
class A:
    def func(self):
        print("A")

class B(A):
    def func(self):
        print("B")

class C(B):
    pass

c = C()
c.func() #输出B
```

多继承：

语法：`class 子类(父1,父2,父3)`，**括号****左边优先级高于右边**。 查找：先找自己，再找第一个父类，再第二个父类，再爷爷类。

```Python
class Father:
    def show(self):
        print("Father")

class Mother:
    def show(self):
        print("Mother")

# 同时继承Father,Mother
class Son(Father, Mother):
    pass

**#****左边 Father 优先级更高**，先找到 Father 的 show，直接执行，不再找 Mother。
s = Son()
s.show() #输出 Father
```

## 类复写（重写函数）： 

父类写通用骨架，把会变的函数留出来；子类复写这个函数，实现不同怪物 / 不同角色的独特行为。

使用继承 \+ 复写思路：

1. `Monster`怪物父类：写通用逻辑（血量、移动、受到伤害），`attack()`攻击方法作为可复写的接口。

2. `Goblin`哥布林子类：继承 Monster，**复写 attack \(\)，实现近身攻击**。

3. `Mage`法师子类：继承 Monster，**复写 attack \(\)，实现释放魔法**。

```Python
# 怪物父类：通用模板，游戏脚本框架的基类
class Monster:
    def __init__(self,hp):
        self.hp = hp

    # 通用逻辑：怪物执行一轮AI，父类写死整体流程
    def ai_loop(self):
        """怪物主循环：移动→攻击，框架固定流程"""
        self.move()
        self.attack()  # 这个方法交给子类去复写实现

    def move(self):
        print("怪物向玩家移动")

    # 预留接口方法，供子类复写
    def attack(self):
        pass # 父类pass占位，本身不实现具体攻击

# 哥布林子类，复写attack
class Goblin(Monster):
    def attack(self):
        # 复写父类attack，哥布林特有行为
        print("哥布林：近身挥刀砍玩家！")

# 法师怪子类，复写attack
class Mage(Monster):
    def attack(self):
        # 复写父类attack，法师特有行为
        print("法师怪：释放火球术！")


# --------脚本运行--------
g1 = Goblin(100)
g1.ai_loop() # 执行父类ai_loop，自动调用子类复写的attack

print("-"*30)
m1 = Mage(80)
m1.ai_loop()
```

输出：

```Plain Text
怪物向玩家移动
哥布林：近身挥刀砍玩家！
------------------------------
怪物向玩家移动
法师怪：释放火球术！
```

注意：子类重写\_\_init\_\_，必须要调用父类构造才能继承父类的属性。反例：

```Python
class Monster:
    def __init__(self, hp):
        self.hp = hp

class Boss(Monster):
    def __init__(self, name):
        # 漏写 super().__init__(xxx)
        self.name = name

boss = Boss("巨龙")
print(boss.hp) #报错！AttributeError，hp根本没有被创建
```

## 类复写系统函数：

Python 中`xxx`双下划线的函数，叫**系统内置魔法方法**，属于 object 父类自带的系统函数。

> 复写：我们自己在类里重写这些系统函数，**改变 Python 底层默认行为**。 不是我们自己调用，**在特定条件下 Python 解释器会自动调用**。
> 
> 对比普通方法复写：普通方法是业务逻辑；魔法方法复写，是修改语言本身的行为。
> 
> 

总结：直接改写系统函数使用方法，自己自定义系统函数内部逻辑。

## 类访问父类：

游戏脚本场景：父类`Monster`是所有怪物通用脚本，提供受伤、死亡；`Boss`继承 Monster，重写死亡逻辑，既要执行父类死亡（掉金币、销毁实体），又要加 BOSS 专属爆炸特效。

### super \(\) 核心用法

`super()` 代表父类对象，用来调用父类的**方法、构造函数**。

> 重点：子类重写了和父类同名方法时，子类方法会直接覆盖父类，如果不写`super()`，父类代码完全不会执行。
> 
> 

```Python
class Monster:
    def __init__(self, hp):
        self.hp = hp

    def die(self):
        """通用怪物死亡：掉金币、销毁怪物"""
        print("执行父类：怪物死亡，掉落金币，销毁实体")


class Boss(Monster):
    def __init__(self, hp, boss_name):
        # 调用父类构造方法，初始化hp，继承父类的属性
        super().__init__(hp)
        self.boss_name = boss_name

    def die(self):
        # 调用父类die()，先跑通用死亡逻辑
        super().die()
        # 再执行BOSS自己独有的逻辑
        print(f"执行子类：{self.boss_name} 触发BOSS爆炸特效！")


b = Boss(1000, "魔龙")
b.die()
```

## 类型注解（就是直接定义数据类型是什么）：

不是强制类型，**只是提示、给 IDE 看**，运行时 Python 不会校验类型。 游戏脚本场景：写怪物、角色、技能类，标注变量、函数入参、返回值是什么类型，IDE 就能自动补全、提前报错误，减少运行时 bug。

变量注解：

```Python
# 格式：变量名: 类型 = 值
hp: int = 100          # 血量整数
speed: float = 2.5     # 移速浮点数
name: str = "哥布林"    # 名字字符串
is_boss: bool = False  # 是否boss
```

容器类型（列表、字典）：

```Plain Text
skill_list: list[str] = ["冲撞","喷火"]   # 字符串列表
attr_dict: dict[str, int] = {"hp":500,"atk":30} # key字符串，value整数
```

可选类型：`| None`（可以是某类型或者 None）

游戏脚本非常常用：很多对象可能为空（怪物没有目标、没有武器）

```Python
target: Monster | None = None  # target可以是Monster实例，也可以是None
```

## 函数参数和返回值注解：

格式：`def 函数(参数:类型) -> 返回类型:`

```Python
def take_damage(damage: int) -> int:
    """受到伤害，返回剩余血量"""
    remain_hp = 200 - damage
    return remain_hp
```

## 联合注解：

游戏脚本视角：一个变量**既可以是 A 类型，又可以是 B 类型**，两种或多种类型都合法，就用联合类型。 Python3\.10\+ 推荐用 `|` 竖线语法；旧版本用 `typing.Union`。

新式语法：

```Python
# 变量可以是 int 或者 float，血量可以整数，也可以小数
hp: int | float
hp = 100
hp = 99.5
```

旧版写法（3\.9 及更早，需要导入 Union）:

```Python
from typing import Union

damage: Union[int, float]
```

## 多态：

同一个调用接口，不同对象做出不同行为。

```Python
class Monster:
    def action(self):
        pass

class Goblin(Monster):
    def action(self):
        print("哥布林冲过来攻击")

class Skeleton(Monster):
    def action(self):
        print("骷髅举起骨刀挥砍")


def monster_do_action(m: Monster):
    m.action()


monster_do_action(Goblin())
monster_do_action(Skeleton())
```

## 抽象：

只定义接口，不写完整实现，强制子类必须把方法写出来。

使用模块：`abc` 内置库，`ABC`、`@abstractmethod`

```Python
from abc import ABC, abstractmethod

class Monster(ABC):
    def __init__(self, hp: int) -> None:
        self.hp: int = hp

    # 抽象方法：规定所有怪物必须有attack
    @abstractmethod
    def attack(self) -> None:
        pass

    # 普通实例方法，抽象类里面可以拥有普通已经实现的方法
    def take_damage(self, dmg: int) -> None:
        self.hp -= dmg
        print(f"受到伤害，剩余血量 {self.hp}")


class Goblin(Monster):
    def attack(self) -> None:
        print("哥布林挥舞小刀攻击玩家")


class Skeleton(Monster):
    def attack(self) -> None:
        print("骷髅挥动骨剑劈砍")


g = Goblin(100)
g.attack()
g.take_damage(20)

s = Skeleton(80)
s.attack()
```

## 闭包：

**闭包 = 内部函数 \+ 捕获外部函数的局部变量** 简单说：函数里面再定义一个内部函数，内部函数记住外层函数的局部变量，即使外层函数执行结束，变量也不会销毁，内部函数依然可以访问。

关键点：

1. 有**嵌套函数**：外层函数，内层函数

2. **内层函数引用外层函数的局部变量**

3. **外层函数把内层函数返回出去**（不是调用，返回函数对象）

> 普通函数执行完，内部局部变量就销毁；闭包会把用到的变量保存下来。
> 
> 

```Python
def outer(x):
    # 外层局部变量 x
    def inner():
        # 内层函数捕获外层的 x
        print(x)
    return inner  # 返回内部函数对象，不是 inner()调用

f = outer(100)
# outer函数已经执行完毕，按理局部变量x应该销毁
f()  # 输出 100，依然可以拿到x
```

## 闭包nonlocal：

- `global`：修改**全局变量**

- `nonlocal`：修改**外层嵌套函数的局部变量**，**不碰全局**

其实就是引用并且可以修改外部的局部变量。

```Python
def outer():
    count = 10

    def inner():
        nonlocal count  # 声明：count不是inner本地，去外层嵌套函数拿
        print(count)
        count = count + 1

    inner()
    print("outer里count =", count) # 被修改成11

outer()
```

输出：

```Plain Text
10
outer里count = 11
```

## 闭包装饰器：

**装饰器本质 = 闭包 \+ 函数作为参数** 

作用：**不修改原函数代码，给函数增加额外功能**。

装饰器就是利用**闭包**：把旧函数包一层，在前后加代码，返回新函数，不用修改旧函数源码。例如：

```Python
def my_decorator(func):
    # 内部包装函数（闭包）
    def wrapper():
        print("=====开始=====")
        func()   # 执行原来的函数
        print("=====结束=====")
    return wrapper  # 返回内部函数对象


def hello():
    print("hello world")


# 手动使用装饰器
hello = my_decorator(hello)

hello()
```

输出：

```Plain Text
=====开始=====
hello world
=====结束=====
```

等价 @语法糖写法：

```Python
def my_decorator(func):
    def wrapper():
        print("=====开始=====")
        func()
        print("=====结束=====")
    return wrapper


@my_decorator   # 等价 hello = my_decorator(hello)
def hello():
    print("hello world")


hello()
```

## 多线程：

```Python
import threading
import time

def task(name, delay):
    print(f"线程 {name} 启动")
    time.sleep(delay)   # 模拟IO等待，sleep会释放GIL
    print(f"线程 {name} 结束")


if __name__ == "__main__":
    # 创建线程，target=要执行的函数，args传参数元组
    t1 = threading.Thread(target=task, args=("A", 2))
    t2 = threading.Thread(target=task, args=("B", 1))

    t1.start()  # 启动线程，不是直接调用task()
    t2.start()

    t1.join()   # 主线阻塞，等待t1执行完毕
    t2.join()

    print("全部线程执行完毕")
```

输出：

```Plain Text
线程 A 启动
线程 B 启动
线程 B 结束
线程 A 结束
全部线程执行完毕
```

- `.start()`：开启子线程。

- `.join()`：主线等待子线程完成；不写 join，主线跑完程序直接退出，子线程可能被杀死。

## re模块（正则）：

Python 使用内置模块 `re`，不需要额外安装。

正则核心：用来匹配、查找、提取、替换字符串。脚本场景：OCR 识别出来文字，提取数字、匹配状态、解析日志。

元字符：



> 写正则字符串，建议用原始字符串 `r""`，避免转义冲突。
> 
> 

### re模块四大常用函数：

re\.match\(pattern, string\)：

**从字符串开头匹配**，开头不满足直接返回 None

```Python
import re

s = "hp:85"
res = re.match(r"hp:\d+", s)
print(res)
if res:
    print(res.group())
```

re\.search\(pattern, string\)：

**整个字符串搜索，找到第一个匹配就返回**，不要求开头。脚本用的最多。

```Python
s = "xxx hp:92 xxx"
res = re.search(r"hp:(\d+)", s)
if res:
    print(res.group(0)) # 完整匹配 hp:92
    print(res.group(1)) # 第1分组捕获内容 92
```

`()`分组，括号里面的内容可以单独拿出来，非常适合提取数字。

re\.findall\(pattern, string\)：

**找到全部匹配，返回列表**，批量提取，脚本高频。

```Python
text = "hp:100 mp:65 cd:3"
nums = re.findall(r"(\d+)", text)
print(nums) # ['100','65','3']
```

re\.sub\(pattern, repl, string\)：

替换，把匹配到的内容替换成别的。

```Python
s = "hp=99,mp=50"
new_s = re.sub(r"\d+", "XX", s)
print(new_s) # hp=XX,mp=XX
```

### 正则使用规则：

正则表达式字符集匹配：

1. `[字符列表]`字符集，匹配括号中任意**一个字符**。

2. `[a-z0-9]`使用`-`表示字符范围。

3. `[^abc]`放在开头表示取反，匹配不在集合中的单个字符。

4. 内部多数元字符失效，不用转义。

5. 字符集处理单字符选择；多字符串选择用 `|`。

6. `\d \w \s`是预定义字符集简写。

示例文本：`血量：105，魔力：37！` 

只想提取数字，用字符集：

```Python
import re

ocr = "血量：105，魔力：37！"
nums = re.findall(r"[0-9]+", ocr)
print(nums) # ['105', '37']
```

正则表达式长度限定：

```Python
import re

# 正则：^[1][0-9]{10}$
# ^ 匹配字符串**开头**
# [1] 匹配字符'1'
# [0-9]{10} 严格匹配正好10位数字
# $ 匹配字符串**结尾**
rule = "^[1][0-9]{10}$"

# 待匹配字符串，一共11位字符：1 2 3 4 5 6 7 8 9 6 6
myStr = "12345678966"

# findall：查找所有完全匹配的内容
result = re.findall(rule, myStr)

print(result)
```

正则表达式邮箱匹配：

教你学习如何使用正则表达式网址：https://regexlearn\.com/zh\-cn/learn/regex101

更多的是多尝试，或者直接拿来主义使用。

## 递归：

递归：函数自己调用自己。

两大必备要素：

1. **递归出口（终止条件）**：什么时候停止，没有就无限递归，栈溢出报错。

2. **递归递推公式**：把大问题拆成规模更小的同类型子问题。

```Python
def func(n):
    # 1.递归出口：终止条件
    if 满足停止条件:
        return 结果
    
    # 2.递归逻辑：缩小问题规模，自己调用自己
    return func(更小的n)
```

## 可视化（前端界面制作）：

`tkinter`（tk）是 Python**自带 GUI 库**，不需要 pip 安装，用来做桌面窗口程序。

基础模版：

```Python
import tkinter as tk

#1. 创建主窗口对象
root = tk.Tk()
root.title("窗口标题")    #窗口标题
root.geometry("400x300") #窗口大小 宽x高，不要空格

# 在这里放所有控件（按钮、输入框、标签）

#2. 启动事件循环，界面一直显示，等待点击、输入。【必须写在最后】
root.mainloop()
```

`mainloop()` 是消息循环：监听鼠标点击、键盘输入，没有这句窗口一闪就消失。

常用控件：

## tk事件：

tk 的事件：监听**鼠标点击、键盘按下、窗口移动、控件触发**。 两种绑定方式：

1. **command**：按钮、菜单专用，只能响应点击，能力有限。

2. **bind\(\)**：通用事件绑定，几乎所有控件 / 窗口都能用，可以捕获键盘、鼠标、滚轮等完整事件。

> `widget.bind(事件字符串, 回调函数)` 回调函数**必须接收一个 event 参数**，`def func(event):`，event 对象携带事件信息。
> 
> 

基础模版：

```Python
import tkinter as tk

root = tk.Tk()
root.geometry("400x250")

def on_key(event):
    # event 事件对象，存放按键、坐标等信息
    print("触发事件", event.keysym, event.x, event.y)

# 给主窗口绑定键盘按下事件
root.bind("<Key>", on_key)

root.mainloop()
```

> bind 回调不能省略 event 参数，否则运行直接报错。
> 
> 

command 和 bind 的区别：

`command`：按钮、复选框专用，**没有 event 参数**，只响应点击。

`bind`：通用，键盘、鼠标、滚轮都能捕获；回调必须带`event`。

> Button 组件可以同时用 command 和 bind。command 是按钮的语义点击；bind 捕获原始鼠标事件。
> 
> 

区分 command 和 bind：

```Python
import tkinter as tk

def cmd_func():
    print("command触发，没有event")

def bind_func(event):
    print("bind鼠标事件，x=",event.x)

root = tk.Tk()
btn = tk.Button(root,text="测试按钮",command=cmd_func)
btn.pack()
btn.bind("<Button‑1>", bind_func)

root.mainloop()
```

## 帮助手册：

python帮助手册网址：https://docs\.python\.org/zh\-cn/3/index\.html

## 发布：

前提：安装installer软件包。

首先打开解释器，点击加号搜索pyinstaller，然后点击下载即可。

![image\.png](/posts/python-basics/image_3.png)

![image\.png](/posts/python-basics/image_10.png)



![image\.png](/posts/python-basics/image_14.png)

打包：

在终端里输入：installer \-D 打包名称，之后按下回车会在当前文件夹生成build文件夹和dist文件夹，其中dist文件夹当中就是打包好的程序。

![image\.png](/posts/python-basics/image_9.png)

![image\.png](/posts/python-basics/image_16.png)

![image\.png](/posts/python-basics/image_6.png)

![image\.png](/posts/python-basics/image_8.png)

## 键鼠自动化、热键注册：

1. **pyautogui：做动作（输出）**：模拟鼠标移动、点击、键盘按键、截图找图。**不能监听全局键盘热键**，只能输出操作。

2. **keyboard：做监听（输入）**：捕获系统全局键盘，后台热键；也可以模拟按键；**没有鼠标功能**。Windows 下**需要管理员权限运行**才能全局监听。

使用前提：首先安装两个包：pyautogui和keyboard。

![image\.png](/posts/python-basics/image_4.png)

![image\.png](/posts/python-basics/image_13.png)

## pyautogui：

鼠标操作：

```Python
# 获取屏幕宽高
w, h = pyautogui.size()

# 获取当前鼠标坐标
x, y = pyautogui.position()

# 移动鼠标到指定坐标，duration是移动耗时(秒)
pyautogui.moveTo(200,300, duration=0.2)

# 相对移动：相对于当前位置偏移
pyautogui.moveRel(50,0)

# 点击
pyautogui.click(x=200,y=300)   #左键单击
pyautogui.rightClick()         #右键
pyautogui.doubleClick()        #双击

# 拖拽
pyautogui.dragTo(500,400, duration=0.3)

#滚轮，正数向上，负数向下
pyautogui.scroll(-30)
```

键盘操作：

```Python
#输入英文文本，interval每个字符间隔秒
pyautogui.write("hello world", interval=0.1)

#按下并松开按键
pyautogui.press("enter")
pyautogui.press(["f1","esc"]) #连续按多个键

#按住不放 / 松开
pyautogui.keyDown("shift")
pyautogui.keyUp("shift")

#组合快捷键 hotkey
pyautogui.hotkey("ctrl","c")  #复制
pyautogui.hotkey("ctrl","v")  #粘贴
```

pyautogui 限制：

1. **不能监听键盘**，只能输出按键动作；想要热键启停脚本，必须搭配`keyboard`库。

2. 游戏驱动级反作弊下，pyautogui 的模拟会被识别拦截。

3. 多显示器，只识别主显示器。

## keyboard：

> Windows 运行脚本**必须右键以管理员身份运行**，否则全局钩子失效，收不到按键事件。
> 
> 

### 核心函数

add\_hotkey 注册全局热键（游戏脚本最常用）：

后台常驻，**程序窗口没焦点也能触发**。

```Python
import keyboard
import time

def start_script():
    print("F1按下，启动脚本")

def stop_script():
    print("F2按下，停止脚本")

#注册热键
keyboard.add_hotkey("f1", start_script)
keyboard.add_hotkey("f2", stop_script)

#等待esc退出，阻塞主线程
keyboard.wait("esc")
print("程序结束")
```

wait \(\) 阻塞等待某个按键按下：

```Python
print("等待按空格继续")
keyboard.wait("space")
print("检测到空格，继续执行代码")
```

重要坑：

1. keyboard 监听运行在**独立子线程**。如果搭配 tkinter 界面，**不能直接在 hotkey 回调里面操作 tk 控件**，会线程冲突卡死，要用`root.after()`调度回主线程更新 UI。

2. 锁屏睡眠唤醒后，部分按键状态会卡住，热键失效，需要重新初始化钩子。

3. 不要用来记录密码，属于键盘钩子，杀毒软件可能告警。

# 游戏脚本完整小示例（两者联合）

> F1 启动循环点击，F2 停止，ESC 退出。keyboard 负责热键监听，pyautogui 负责鼠标动作。
> 
> 

```Python
import pyautogui   # 导入自动操作库：鼠标、键盘模拟
import keyboard    # 导入键盘钩子库：全局热键监听
import time        # 时间休眠模块

pyautogui.PAUSE = 0.2   # pyautogui每次执行动作后强制停顿0.2秒，防止操作速度过快

running = False         # 全局标记，控制脚本循环是否运行，False=停止，True=运行

def toggle_start():
    """F1热键回调函数：切换脚本运行状态（启动/停止）"""
    global running          # 声明使用全局变量running
    running = not running   # 布尔取反，实现开关效果：True变False，False变True
    if running:
        print("✅脚本已启动")
    else:
        print("🛑脚本已停止")

# 注册全局热键：按下F1，执行toggle_start函数
keyboard.add_hotkey("f1", toggle_start)

print("F1切换启停，ESC退出")

try:
    # 主循环，程序持续运行
    while True:
        # 如果运行标记为True，则执行点击逻辑
        if running:
            pyautogui.click()   # 鼠标左键单击一次
            time.sleep(1)       # 点击后休眠1秒
        time.sleep(0.05)        # 循环空转休眠，降低CPU占用
except KeyboardInterrupt:
    # 捕获 Ctrl+C 强制中断程序的异常
    pass
finally:
    # 无论程序正常结束还是异常退出，都会执行这里
    keyboard.unhook_all()   # 清除所有键盘钩子，释放系统资源，防止钩子残留
    print("退出完成")
```

## 虚拟环境：

创建虚拟环境，是为了给当前这个项目，创造一个独立、干净、专属的“小隔间”。主要作用如下：

- 防止多个Python版本冲突，避免项目之间互相干扰，需要为每个项目创建一个独立的环境。

- 为了不污染全局环境，需要把项目的依赖都放在一个隔离的环境里

- 可以导出环境里所有库的版本号，保证了你的软件在任何电脑上都能以相同的方式运行



